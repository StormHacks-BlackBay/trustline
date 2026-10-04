import type { DemoCall } from "../data/demoCalls";

/**
 * Short, stable hash of a demo line. It is part of the audio URL, so cached audio is replaced
 * automatically when a script line changes, and the API only voices lines that exist.
 */
export function lineHash(text: string): string {
  let hash = 5381;
  for (let i = 0; i < text.length; i++) {
    hash = ((hash << 5) + hash + text.charCodeAt(i)) >>> 0;
  }
  return hash.toString(36);
}

/** URL of the spoken audio for one line of a demo call, served by `api/demo-speech.ts`. */
export function demoSpeechPath(callId: string, line: number, text: string): string {
  const params = new URLSearchParams({ call: callId, line: String(line), v: lineHash(text) });
  return `/api/demo-speech?${params}`;
}

/** The text the voice speaks for a line: the acted version if there is one, else the line itself. */
export function spokenText(call: DemoCall, line: number): string {
  return call.spoken?.[line] ?? call.lines[line] ?? "";
}

/** The words of a line with audio tags, punctuation and case removed, for comparing scripts. */
export function plainWords(text: string): string[] {
  return text
    .replace(/\[[^\]]*\]/g, " ")
    .toLowerCase()
    .replace(/[^a-z0-9']+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}
