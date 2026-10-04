import { useCallback, useState } from "react";
import type { DemoCall } from "../../data/demoCalls";
import type { LanguageCode } from "../../lib/types";
import { useLiveTranscript } from "./useLiveTranscript";
import { usePhoneCall } from "./usePhoneCall";
import { useReplayTranscript } from "./useReplayTranscript";

type Mode = "live" | "replay" | "phone";

/**
 * Picks the transcript the screen follows: the microphone, a scripted replay, or a phone call
 * TrustLine was merged into. A merged phone call takes over the screen as soon as it starts.
 */
export function useCallSource(userId: string, language: LanguageCode) {
  const live = useLiveTranscript();
  const replay = useReplayTranscript();
  const [mode, setMode] = useState<Mode>("live");
  const [callNumber, setCallNumber] = useState(0);

  const { stop: stopLive, status: liveStatus } = live;
  const { stop: stopReplay } = replay;
  const onPhoneCall = useCallback(() => {
    if (liveStatus === "listening" || liveStatus === "connecting") stopLive();
    stopReplay();
    setMode("phone");
    setCallNumber((n) => n + 1);
  }, [liveStatus, stopLive, stopReplay]);
  const phone = usePhoneCall(userId, language, onPhoneCall);

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

  const source = mode === "live" ? live : mode === "replay" ? replay : phone;
  const stop = mode === "live" ? live.stop : replay.stop;

  return {
    mode,
    status: source.status,
    segments: source.segments,
    partial: source.partial,
    error: mode === "live" ? live.error : null,
    demoCall: mode === "replay" ? replay.call : null,
    /** Whether demo calls are read aloud, and the switch for it. */
    readAloud: replay.readAloud,
    setReadAloud: replay.setReadAloud,
    phoneConnected: phone.connected,
    spokenWarning: mode === "phone" ? phone.warning : null,
    /** The after-call summary of the last phone call, once it has ended. */
    summaryId: mode === "phone" && phone.status === "ended" ? phone.summaryId : null,
    /** Increments whenever a new call starts, so per-call state can reset. */
    callNumber,
    startLive,
    playDemo,
    stop,
  };
}
