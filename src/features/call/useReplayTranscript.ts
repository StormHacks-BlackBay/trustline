import { useEffect, useRef, useState } from "react";
import type { DemoCall } from "../../data/demoCalls";
import { readStored, writeStored } from "../../lib/storage";
import type { Segment, SourceStatus } from "../../lib/transcript";
import { createDemoVoice, type DemoVoice } from "./demoVoice";

const WORD_MS = 260;
const LINE_PAUSE_MS = 700;
const START_DELAY_MS = 400;
/** Pause between spoken lines, after the speech itself has finished. */
const SPOKEN_LINE_GAP_MS = 450;
const READ_ALOUD_KEY = "trustline.readDemoCallsAloud";

/**
 * Plays a scripted call word by word with realistic timing. Uses the same Segment stream as the
 * live microphone, so detection, warnings and sharing behave exactly as they would on a real call.
 * When "read aloud" is on, each line is spoken and every word appears as the voice says it.
 */
export function useReplayTranscript() {
  const [status, setStatus] = useState<SourceStatus>("idle");
  const [segments, setSegments] = useState<Segment[]>([]);
  const [partial, setPartial] = useState("");
  const [call, setCall] = useState<DemoCall | null>(null);
  const [readAloud, setReadAloudState] = useState(() => readStored(READ_ALOUD_KEY) !== "off");
  const timers = useRef<number[]>([]);
  const run = useRef(0);
  const voice = useRef<DemoVoice | null>(null);

  const clearTimers = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  };

  const later = (ms: number) =>
    new Promise<void>((resolve) => timers.current.push(window.setTimeout(resolve, ms)));

  useEffect(
    () => () => {
      run.current++;
      clearTimers();
      voice.current?.cancel();
    },
    [],
  );

  const commit = (demo: DemoCall, lineIndex: number, text: string) => {
    setPartial("");
    setSegments((prev) => [
      ...prev,
      {
        id: `${demo.id}-${lineIndex}`,
        text,
        committedAt: performance.now(),
      },
    ]);
  };

  const playTimed = (demo: DemoCall) => {
    let elapsed = START_DELAY_MS;
    demo.lines.forEach((line, lineIndex) => {
      const words = line.split(" ");
      words.forEach((_, wordIndex) => {
        elapsed += WORD_MS;
        const shown = words.slice(0, wordIndex + 1).join(" ");
        timers.current.push(window.setTimeout(() => setPartial(shown), elapsed));
      });
      elapsed += LINE_PAUSE_MS;
      timers.current.push(window.setTimeout(() => commit(demo, lineIndex, line), elapsed));
    });
    timers.current.push(window.setTimeout(() => setStatus("ended"), elapsed + 200));
  };

  const playSpoken = async (demo: DemoCall, speaker: DemoVoice, token: number) => {
    await later(START_DELAY_MS);
    for (let lineIndex = 0; lineIndex < demo.lines.length; lineIndex++) {
      if (token !== run.current) return;
      const line = demo.lines[lineIndex] ?? "";
      const words = line.split(" ");
      // The voice reports how many words it has said; the transcript shows exactly those.
      await speaker.speak(demo, lineIndex, (spoken) => {
        if (token === run.current) setPartial(words.slice(0, spoken).join(" "));
      });
      if (token !== run.current) return;
      commit(demo, lineIndex, line);
      await later(SPOKEN_LINE_GAP_MS);
    }
    if (token === run.current) setStatus("ended");
  };

  const play = (demo: DemoCall) => {
    const token = ++run.current;
    clearTimers();
    voice.current?.cancel();
    setCall(demo);
    setSegments([]);
    setPartial("");
    setStatus("listening");

    if (!readAloud) {
      playTimed(demo);
      return;
    }
    const speaker = (voice.current ??= createDemoVoice());
    speaker.setMuted(false);
    // Must run synchronously inside the click so mobile browsers allow the audio that follows.
    speaker.unlock();
    speaker.prefetch(demo);
    void playSpoken(demo, speaker, token);
  };

  const stop = () => {
    run.current++;
    clearTimers();
    voice.current?.cancel();
    setPartial("");
    setStatus("ended");
  };

  const setReadAloud = (on: boolean) => {
    setReadAloudState(on);
    writeStored(READ_ALOUD_KEY, on ? "on" : "off");
    // Turning it off mid-call silences the voice; the transcript carries on.
    voice.current?.setMuted(!on);
  };

  return { status, segments, partial, call, play, stop, readAloud, setReadAloud };
}
