import { useState } from "react";
import type { DemoCall } from "../../data/demoCalls";
import { useLiveTranscript } from "./useLiveTranscript";
import { useReplayTranscript } from "./useReplayTranscript";

type Mode = "live" | "replay";

/** Picks between the live microphone and a scripted replay; whichever started last is active. */
export function useCallSource() {
  const live = useLiveTranscript();
  const replay = useReplayTranscript();
  const [mode, setMode] = useState<Mode>("live");
  const [callNumber, setCallNumber] = useState(0);

  const startLive = () => {
    replay.stop();
    setMode("live");
    setCallNumber((n) => n + 1);
    live.start();
  };

  const playDemo = (call: DemoCall) => {
    if (live.status === "listening" || live.status === "connecting") live.stop();
    setMode("replay");
    setCallNumber((n) => n + 1);
    replay.play(call);
  };

  const source = mode === "live" ? live : replay;
  const stop = mode === "live" ? live.stop : replay.stop;

  return {
    mode,
    status: source.status,
    segments: source.segments,
    partial: source.partial,
    error: mode === "live" ? live.error : null,
    demoCall: mode === "replay" ? replay.call : null,
    /** Increments whenever a new call starts, so per-call state can reset. */
    callNumber,
    startLive,
    playDemo,
    stop,
  };
}
