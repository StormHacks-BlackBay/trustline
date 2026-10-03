import { ElevenLabsClient, ElevenLabsError } from "@elevenlabs/elevenlabs-js";
import { errorResponse, json } from "./_http";

/** Mints a single-use Scribe token so the ElevenLabs API key never reaches the browser. */
export async function POST(): Promise<Response> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) return errorResponse("transcription_not_configured", 503);

  try {
    const client = new ElevenLabsClient({ apiKey });
    const { token } = await client.tokens.singleUse.create("realtime_scribe");
    return json({ token });
  } catch (error) {
    const status = error instanceof ElevenLabsError ? (error.statusCode ?? 502) : 502;
    console.error("Scribe token request failed", error);
    return errorResponse("transcription_token_failed", status >= 500 ? 502 : status);
  }
}
