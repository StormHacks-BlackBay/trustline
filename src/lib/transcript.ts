export interface Segment {
  id: string;
  text: string;
  /** Milliseconds since the call started, used for latency measurement. */
  committedAt: number;
}

export type SourceStatus = "idle" | "connecting" | "listening" | "ended" | "error";

/** Anything that produces a call transcript: the live microphone or a scripted replay. */
export interface TranscriptSource {
  status: SourceStatus;
  segments: Segment[];
  partial: string;
  error: string | null;
  start: () => void;
  stop: () => void;
}

/** Joins the most recent committed segments, newest last, up to roughly maxChars characters. */
export function recentWindow(segments: Segment[], maxChars = 1800): string {
  const picked: string[] = [];
  let length = 0;
  for (let i = segments.length - 1; i >= 0; i--) {
    const text = segments[i]?.text.trim();
    if (!text) continue;
    if (length + text.length > maxChars && picked.length > 0) break;
    picked.unshift(text);
    length += text.length + 1;
  }
  return picked.join("\n");
}
