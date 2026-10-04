import type { DemoCall } from "../data/demoCalls.js";

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

/**
 * Response format of `api/demo-speech.ts`. It is part of the hash, so changing the format also
 * changes every URL and the CDN never serves a response in an old format.
 */
const SPEECH_FORMAT = "2";

/** Hash the API expects for a spoken line. */
export function speechHash(text: string): string {
  return lineHash(`${SPEECH_FORMAT}:${text}`);
}

/** URL of the spoken audio for one line of a demo call, served by `api/demo-speech.ts`. */
export function demoSpeechPath(callId: string, line: number, text: string): string {
  const params = new URLSearchParams({ call: callId, line: String(line), v: speechHash(text) });
  return `/api/demo-speech?${params}`;
}

/** What `api/demo-speech.ts` returns: mp3 audio and when each word of the line starts. */
export interface DemoSpeech {
  /** Base64-encoded mp3. */
  audio: string;
  /**
   * Start time in seconds of each word of the transcript line (`line.split(" ")`), or null when
   * ElevenLabs returned no usable timing and playback should be paced proportionally instead.
   */
  wordStarts: number[] | null;
}

/**
 * Turns ElevenLabs character timings into the start time of each spoken word. Audio tags such as
 * "[sternly]" are skipped whether or not ElevenLabs includes them in the alignment. Returns null
 * if the word count does not match the transcript line, so a mismatch never shows wrong timing.
 */
export function wordStartTimes(
  characters: readonly string[],
  startTimes: readonly number[],
  wordCount: number,
): number[] | null {
  const starts: number[] = [];
  let inTag = false;
  let inWord = false;
  characters.forEach((char, i) => {
    if (char === "[") {
      inTag = true;
      inWord = false;
      return;
    }
    if (inTag) {
      if (char === "]") inTag = false;
      return;
    }
    // A hyphen inside a word ("e-transfer", "twenty-eight") does not start a new word.
    const wordChar = /[A-Za-z0-9']/.test(char) || (inWord && char === "-");
    if (wordChar && !inWord) starts.push(startTimes[i] ?? 0);
    inWord = wordChar;
  });
  return starts.length === wordCount ? starts : null;
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
