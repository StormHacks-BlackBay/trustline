import { CommitStrategy, useScribe } from "@elevenlabs/react";
import { useRef, useState } from "react";
import { DIRECTORY } from "../../data/directory";
import { ApiError, fetchScribeToken } from "../../lib/api";
import type { Segment, SourceStatus, TranscriptSource } from "../../lib/transcript";

// Bias recognition toward the names and phrases scam callers use.
const KEYTERMS = [
  ...DIRECTORY.flatMap((d) => d.aliases.filter((a) => a.length > 3)).slice(0, 40),
  "gift card",
  "Google Play",
  "bitcoin",
  "verification code",
  "deportation",
  "warrant",
];

function describeError(error: unknown): string {
  if (error instanceof ApiError && error.code === "transcription_not_configured") {
    return "Live transcription is not set up on this server. Try a demo call instead.";
  }
  if (error instanceof DOMException && error.name === "NotAllowedError") {
    return "Microphone access was blocked. Allow it in your browser settings to listen to calls.";
  }
  return "Could not start live transcription. Check your connection and try again.";
}

/** Streams the microphone to ElevenLabs Scribe v2 Realtime and exposes committed segments. */
export function useLiveTranscript(): TranscriptSource {
  const [status, setStatus] = useState<SourceStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [segments, setSegments] = useState<Segment[]>([]);
  const nextId = useRef(0);

  const scribe = useScribe({
    modelId: "scribe_v2_realtime",
    commitStrategy: CommitStrategy.VAD,
    languageCode: "en",
    keyterms: KEYTERMS,
    onCommittedTranscript: ({ text }) => {
      if (!text.trim()) return;
      const committedAt = performance.now();
      const id = `live-${nextId.current++}`;
      setSegments((prev) => [...prev, { id, text, committedAt }]);
    },
    onError: () => setStatus("error"),
    onDisconnect: () => setStatus((s) => (s === "error" ? s : "ended")),
  });

  const start = async () => {
    setError(null);
    setStatus("connecting");
    scribe.clearTranscripts();
    setSegments([]);
    try {
      const token = await fetchScribeToken();
      await scribe.connect({
        token,
        microphone: { echoCancellation: false, noiseSuppression: true, autoGainControl: true },
      });
      setStatus("listening");
    } catch (caught) {
      setError(describeError(caught));
      setStatus("error");
    }
  };

  const stop = () => {
    scribe.disconnect();
    setStatus("ended");
  };

  return {
    status,
    segments,
    partial: scribe.partialTranscript,
    error: error ?? (status === "error" ? scribe.error : null),
    start: () => void start(),
    stop,
  };
}
