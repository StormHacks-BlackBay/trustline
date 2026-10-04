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
    // connect() resolves before the socket opens, and send() throws until it does.
    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(
        () => reject(new Error("Scribe did not connect in time")),
        OPEN_TIMEOUT_MS,
      );
      connection.on(RealtimeEvents.OPEN, () => {
        clearTimeout(timer);
        resolve();
      });
      connection.on(RealtimeEvents.CLOSE, () => {
        clearTimeout(timer);
        reject(new Error("Scribe closed the connection before it opened"));
      });
    });
    let dropped = false;
    return {
      sendAudio: (payload) => {
        try {
          connection.send({ audioBase64: payload });
        } catch (error) {
          // Report a dropped connection once instead of crashing the server on every chunk.
          if (!dropped) onError(error);
          dropped = true;
        }
      },
      close: () => connection.close(),
    };
  };
}

const OPEN_TIMEOUT_MS = 10_000;
