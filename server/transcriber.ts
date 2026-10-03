import {
  AudioFormat,
  CommitStrategy,
  ElevenLabsClient,
  RealtimeEvents,
} from "@elevenlabs/elevenlabs-js";
import { scribeKeyterms } from "../src/lib/keyterms";

export interface TranscriberHandlers {
  onPartial: (text: string) => void;
  onCommitted: (text: string) => void;
  onError: (error: unknown) => void;
}

export interface Transcriber {
  /** Base64 mu-law 8 kHz audio, exactly as Twilio delivers it. */
  sendAudio: (payload: string) => void;
  close: () => void;
}

export type TranscriberFactory = (handlers: TranscriberHandlers) => Promise<Transcriber>;

/** Scribe v2 Realtime accepts Twilio's mu-law audio directly, so no transcoding is needed. */
export function elevenLabsTranscriber(apiKey: string): TranscriberFactory {
  const client = new ElevenLabsClient({ apiKey });
  return async ({ onPartial, onCommitted, onError }) => {
    const connection = await client.speechToText.realtime.connect({
      modelId: "scribe_v2_realtime",
      audioFormat: AudioFormat.ULAW_8000,
      sampleRate: 8000,
      commitStrategy: CommitStrategy.VAD,
      languageCode: "en",
      keyterms: scribeKeyterms(),
    });
    connection.on(RealtimeEvents.PARTIAL_TRANSCRIPT, (data) => onPartial(data.text));
    connection.on(RealtimeEvents.COMMITTED_TRANSCRIPT, (data) => onCommitted(data.text));
    connection.on(RealtimeEvents.ERROR, (error) => onError(error));
    connection.on(RealtimeEvents.AUTH_ERROR, (error) => onError(error));
    return {
      sendAudio: (payload) => connection.send({ audioBase64: payload }),
      close: () => connection.close(),
    };
  };
}
