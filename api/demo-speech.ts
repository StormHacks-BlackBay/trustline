import { DEMO_CALLS } from "../src/data/demoCalls";
import { lineHash, spokenText } from "../src/lib/demoSpeech";
import { errorResponse } from "./_http";

const API_BASE = "https://api.elevenlabs.io/v1/text-to-speech";
const TIMEOUT_MS = 15_000;
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

/**
 * Voices one line of a scripted demo call. Only lines that exist in DEMO_CALLS can be requested,
 * so this cannot be used as a general text-to-speech service. Responses are cacheable, so
 * Vercel's CDN serves repeat plays without calling ElevenLabs again.
 */
export async function GET(request: Request): Promise<Response> {
  const params = new URL(request.url).searchParams;
  const call = DEMO_CALLS.find((c) => c.id === params.get("call"));
  const lineParam = params.get("line") ?? "";
  const line = /^\d+$/.test(lineParam) ? Number(lineParam) : -1;
  if (!call || call.lines[line] === undefined) return errorResponse("unknown_line", 404);
  const text = spokenText(call, line);
  if (params.get("v") !== lineHash(text)) return errorResponse("stale_line", 400);

  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) return errorResponse("speech_not_configured", 503);

  const voices = [CALLER_VOICES[call.id] ?? FALLBACK_VOICE, FALLBACK_VOICE];
  for (const voice of new Set(voices)) {
    let upstream: Response;
    try {
      upstream = await fetch(`${API_BASE}/${voice}?output_format=mp3_44100_128`, {
        method: "POST",
        headers: { "xi-api-key": apiKey, "content-type": "application/json", accept: "audio/mpeg" },
        body: JSON.stringify({ text, model_id: MODEL() }),
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
    } catch {
      console.error("Demo speech request to ElevenLabs failed or timed out");
      return errorResponse("speech_failed", 502);
    }

    if (upstream.ok) {
      return new Response(await upstream.arrayBuffer(), {
        status: 200,
        headers: {
          "content-type": "audio/mpeg",
          "cache-control": "public, max-age=86400, s-maxage=31536000, immutable",
        },
      });
    }
    const reason = await upstream
      .json()
      .then((body) => (body as { detail?: { status?: string } }).detail?.status ?? "")
      .catch(() => "");
    console.error(
      `ElevenLabs text to speech error ${upstream.status}${reason ? ` (${reason})` : ""} for voice ${voice}`,
    );
    if (upstream.status === 401) return errorResponse("speech_not_configured", 503);
    if (upstream.status === 429) return errorResponse("speech_rate_limited", 429);
    // Anything else (for example a voice missing from the account): try the fallback voice.
  }
  return errorResponse("speech_failed", 502);
}
