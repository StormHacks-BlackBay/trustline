import { DEMO_CALLS } from "../src/data/demoCalls.js";
import { speechHash, spokenText, wordStartTimes, type DemoSpeech } from "../src/lib/demoSpeech.js";
import { errorResponse, json } from "./_http.js";

const API_BASE = "https://api.elevenlabs.io/v1/text-to-speech";
const OUTPUT = "output_format=mp3_44100_128";
const TIMEOUT_MS = 20_000;
/** Eleven v3 performs the audio tags in the spoken scripts ([sternly], [hesitates], pauses). */
const MODEL = () => process.env.ELEVENLABS_DEMO_TTS_MODEL || "eleven_v3";

/** Stock ElevenLabs voices, one per demo caller, so each call sounds like a different person. */
export const CALLER_VOICES: Record<string, string> = {
  "ircc-scam": "pNInz6obpgDQGcFmaJgB",
  "bank-alert": "EXAVITQu4vr4xnSDxMaL",
  "bank-ambiguous": "onwK4e9ZLuTAKqWW03F9",
};
/** Used if a caller's voice is unavailable on the account. Same stock voice as server/speaker.ts. */
export const FALLBACK_VOICE = "JBFqnCBsd6RMkjVDRZzb";

const CACHEABLE = "public, max-age=86400, s-maxage=31536000, immutable";

interface TimestampResponse {
  audio_base64?: string;
  alignment?: { characters?: string[]; character_start_times_seconds?: number[] } | null;
}

type Attempt = { ok: true; speech: DemoSpeech } | { ok: false; status: number };

async function reason(response: Response): Promise<string> {
  const body = (await response.json().catch(() => null)) as { detail?: { status?: string } } | null;
  return body?.detail?.status ?? "";
}

function request(voice: string, path: string, text: string, apiKey: string) {
  return fetch(`${API_BASE}/${voice}${path}?${OUTPUT}`, {
    method: "POST",
    headers: { "xi-api-key": apiKey, "content-type": "application/json" },
    body: JSON.stringify({ text, model_id: MODEL() }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
}

/**
 * Asks for audio with character timestamps so the transcript can follow the voice word by word.
 * If ElevenLabs rejects that request for the model (400 or 422), asks for plain audio instead.
 */
async function synthesize(
  voice: string,
  text: string,
  wordCount: number,
  apiKey: string,
): Promise<Attempt> {
  const timed = await request(voice, "/with-timestamps", text, apiKey);
  if (timed.ok) {
    const body = (await timed.json()) as TimestampResponse;
    if (!body.audio_base64) return { ok: false, status: 502 };
    const alignment = body.alignment;
    const wordStarts = alignment
      ? wordStartTimes(
          alignment.characters ?? [],
          alignment.character_start_times_seconds ?? [],
          wordCount,
        )
      : null;
    return { ok: true, speech: { audio: body.audio_base64, wordStarts } };
  }
  if (timed.status !== 400 && timed.status !== 422) {
    console.error(`ElevenLabs error ${timed.status} ${await reason(timed)} for voice ${voice}`);
    return { ok: false, status: timed.status };
  }

  const plain = await request(voice, "", text, apiKey);
  if (!plain.ok) {
    console.error(`ElevenLabs error ${plain.status} ${await reason(plain)} for voice ${voice}`);
    return { ok: false, status: plain.status };
  }
  const audio = Buffer.from(await plain.arrayBuffer()).toString("base64");
  return { ok: true, speech: { audio, wordStarts: null } };
}

/**
 * Voices one line of a scripted demo call and says when each word starts. Only lines that exist
 * in DEMO_CALLS can be requested, so this is not a general text-to-speech service. Responses are
 * cacheable, so Vercel's CDN serves repeat plays without calling ElevenLabs again.
 */
export async function GET(request: Request): Promise<Response> {
  const params = new URL(request.url).searchParams;
  const call = DEMO_CALLS.find((c) => c.id === params.get("call"));
  const lineParam = params.get("line") ?? "";
  const line = /^\d+$/.test(lineParam) ? Number(lineParam) : -1;
  const transcriptLine = call?.lines[line];
  if (!call || transcriptLine === undefined) return errorResponse("unknown_line", 404);
  const text = spokenText(call, line);
  if (params.get("v") !== speechHash(text)) return errorResponse("stale_line", 400);

  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) return errorResponse("speech_not_configured", 503);

  const wordCount = transcriptLine.split(" ").length;
  const voices = new Set([CALLER_VOICES[call.id] ?? FALLBACK_VOICE, FALLBACK_VOICE]);
  for (const voice of voices) {
    let attempt: Attempt;
    try {
      attempt = await synthesize(voice, text, wordCount, apiKey);
    } catch {
      console.error("Demo speech request to ElevenLabs failed or timed out");
      return errorResponse("speech_failed", 502);
    }
    if (attempt.ok) {
      const response = json(attempt.speech);
      response.headers.set("cache-control", CACHEABLE);
      return response;
    }
    if (attempt.status === 401) return errorResponse("speech_not_configured", 503);
    if (attempt.status === 429) return errorResponse("speech_rate_limited", 429);
    // Anything else (for example a voice missing from the account): try the fallback voice.
  }
  return errorResponse("speech_failed", 502);
}
