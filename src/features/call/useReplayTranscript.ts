import { useEffect, useRef, useState } from "react";
import type { DemoCall } from "../../data/demoCalls";
import type { Segment, SourceStatus } from "../../lib/transcript";

const WORD_MS = 260;
const LINE_PAUSE_MS = 700;

/**
 * Plays a scripted call word by word with realistic timing. Uses the same Segment stream as the
 * live microphone, so detection, warnings and sharing behave exactly as they would on a real call.
 */
export function useReplayTranscript() {
  const [status, setStatus] = useState<SourceStatus>("idle");
  const [segments, setSegments] = useState<Segment[]>([]);
  const [partial, setPartial] = useState("");
  const [call, setCall] = useState<DemoCall | null>(null);
  const timers = useRef<number[]>([]);

  const clearTimers = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  };

  useEffect(() => clearTimers, []);

  const play = (demo: DemoCall) => {
    clearTimers();
    setCall(demo);
    setSegments([]);
    setPartial("");
    setStatus("listening");

    let elapsed = 400;
    demo.lines.forEach((line, lineIndex) => {
      const words = line.split(" ");
      words.forEach((_, wordIndex) => {
        elapsed += WORD_MS;
        const shown = words.slice(0, wordIndex + 1).join(" ");
        timers.current.push(window.setTimeout(() => setPartial(shown), elapsed));
      });
      elapsed += LINE_PAUSE_MS;
      timers.current.push(
        window.setTimeout(() => {
          setPartial("");
          setSegments((prev) => [
            ...prev,
            {
              id: `${demo.id}-${lineIndex}`,
              text: line,
              committedAt: performance.now(),
            },
          ]);
        }, elapsed),
      );
    });
    timers.current.push(window.setTimeout(() => setStatus("ended"), elapsed + 200));
  };

  const stop = () => {
    clearTimers();
    setPartial("");
    setStatus("ended");
  };

  return { status, segments, partial, call, play, stop };
}
