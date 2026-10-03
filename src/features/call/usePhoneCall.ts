import { useEffect, useRef, useState } from "react";
import { CallEventSchema, type CallEvent } from "../../lib/callEvents";
import { callServer } from "../../lib/callServer";
import type { Segment, SourceStatus } from "../../lib/transcript";
import type { LanguageCode } from "../../lib/types";

export interface SpokenWarning {
  text: string;
  spoken: boolean;
}

/**
 * Follows phone calls that the user has merged TrustLine into. The call server sends the live
 * transcript; detection runs here exactly as it does for the microphone and demo calls.
 */
export function usePhoneCall(userId: string, language: LanguageCode, onCallStarted: () => void) {
  const [connected, setConnected] = useState(false);
  const [status, setStatus] = useState<SourceStatus>("idle");
  const [segments, setSegments] = useState<Segment[]>([]);
  const [partial, setPartial] = useState("");
  const [warning, setWarning] = useState<SpokenWarning | null>(null);
  const onStarted = useRef(onCallStarted);

  useEffect(() => {
    onStarted.current = onCallStarted;
  }, [onCallStarted]);

  useEffect(() => {
    if (!callServer.url) return;
    const params = new URLSearchParams({ user: userId, lang: language });
    const source = new EventSource(`${callServer.url}/events?${params}`);
    let callId: string | null = null;

    const handle = (event: CallEvent) => {
      if (event.type === "call_started") {
        callId = event.callId;
        setSegments([]);
        setPartial("");
        setWarning(null);
        setStatus("listening");
        onStarted.current();
        return;
      }
      if (event.callId !== callId) return;
      if (event.type === "partial") setPartial(event.text);
      if (event.type === "segment") {
        setPartial("");
        setSegments((prev) =>
          prev.some((s) => s.id === event.id)
            ? prev
            : [...prev, { id: event.id, text: event.text, committedAt: performance.now() }],
        );
      }
      if (event.type === "warning") setWarning({ text: event.text, spoken: event.spoken });
      if (event.type === "call_ended") {
        setPartial("");
        setStatus("ended");
      }
    };

    source.onopen = () => setConnected(true);
    source.onerror = () => setConnected(false);
    source.onmessage = (message: MessageEvent<string>) => {
      try {
        const parsed = CallEventSchema.safeParse(JSON.parse(message.data));
        if (parsed.success) handle(parsed.data);
      } catch {
        // Ignore malformed messages.
      }
    };
    return () => source.close();
  }, [userId, language]);

  return { connected, status, segments, partial, warning };
}
