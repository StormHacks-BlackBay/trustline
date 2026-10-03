import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import type { LanguageCode } from "../src/lib/types";

export interface Speaker {
  /** Returns mu-law 8 kHz audio, the format Twilio plays into the call. */
  synthesize: (text: string, language: LanguageCode) => Promise<Buffer>;
}

// Eleven v3 covers all five warning languages, including Punjabi, Filipino and Persian.
const DEFAULT_MODEL = "eleven_v3";
// A stock ElevenLabs voice; override with ELEVENLABS_VOICE_ID.
const DEFAULT_VOICE = "JBFqnCBsd6RMkjVDRZzb";

export function elevenLabsSpeaker(
  apiKey: string,
  voiceId = process.env.ELEVENLABS_VOICE_ID || DEFAULT_VOICE,
  modelId = process.env.ELEVENLABS_TTS_MODEL || DEFAULT_MODEL,
): Speaker {
  const client = new ElevenLabsClient({ apiKey });
  const cache = new Map<string, Promise<Buffer>>();

  const render = async (text: string): Promise<Buffer> => {
    const stream = await client.textToSpeech.convert(voiceId, {
      text,
      modelId,
      outputFormat: "ulaw_8000",
    });
    const chunks: Uint8Array[] = [];
    const reader = stream.getReader();
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }
    return Buffer.concat(chunks);
  };

  return {
    // Warnings repeat across calls, so identical text is synthesized once.
    synthesize: (text) => {
      const cached = cache.get(text);
      if (cached) return cached;
      const pending = render(text).catch((error: unknown) => {
        cache.delete(text);
        throw error;
      });
      cache.set(text, pending);
      return pending;
    },
  };
}
