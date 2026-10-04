import type { DemoCall } from "../../data/demoCalls";
import { demoSpeechPath, spokenText, type DemoSpeech } from "../../lib/demoSpeech";

/** Pace used when the real length of the speech is unknown (browser voices, muted playback). */
const MS_PER_WORD = 360;
/** How long to wait for an ElevenLabs clip before using the browser's voice instead. */
const CLIP_TIMEOUT_MS = 10_000;
/** Some browsers never fire speech events; give up waiting after this much extra time. */
const SPEECH_GRACE_MS = 3_000;
/** How often the transcript checks the audio's position. Fast enough to look instant. */
const TICK_MS = 40;

export function estimateMs(text: string): number {
  return Math.max(1, text.split(" ").length) * MS_PER_WORD;
}

/** Number of words that should be visible `elapsed` seconds into a line. */
export function wordsSpoken(
  elapsed: number,
  wordCount: number,
  wordStarts: readonly number[] | null,
  duration: number,
): number {
  if (wordStarts) return wordStarts.filter((start) => start <= elapsed).length;
  if (!(duration > 0)) return 0;
  return Math.min(wordCount, Math.floor((elapsed / duration) * wordCount) + 1);
}

/**
 * Reads demo call lines aloud and keeps the transcript in step with the voice. Prefers ElevenLabs
 * audio with word timings from `/api/demo-speech`, falls back to the browser's speech synthesis,
 * and falls back again to silent timing, so a demo always runs.
 */
export interface DemoVoice {
  /** Call synchronously inside the click that starts a demo, so mobile browsers allow audio. */
  unlock: () => void;
  /** Starts fetching every line of a call so playback does not wait between lines. */
  prefetch: (call: DemoCall) => void;
  /**
   * Speaks one line and calls `reveal` with how many of its words have been said so far.
   * Resolves when the line finishes, fails or is cancelled.
   */
  speak: (call: DemoCall, line: number, reveal: (words: number) => void) => Promise<void>;
  setMuted: (muted: boolean) => void;
  cancel: () => void;
}

interface Clip {
  url: string;
  wordStarts: number[] | null;
}

const wait = (ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms));

/** A tenth of a second of silence, played on the first click to unlock audio on iOS Safari. */
function silentWavUrl(): string {
  const samples = 800;
  const buffer = new ArrayBuffer(44 + samples);
  const view = new DataView(buffer);
  const ascii = (offset: number, text: string) =>
    [...text].forEach((c, i) => view.setUint8(offset + i, c.charCodeAt(0)));
  ascii(0, "RIFF");
  view.setUint32(4, 36 + samples, true);
  ascii(8, "WAVE");
  ascii(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, 8000, true); // sample rate
  view.setUint32(28, 8000, true); // byte rate
  view.setUint16(32, 1, true); // block align
  view.setUint16(34, 8, true); // bits per sample
  ascii(36, "data");
  view.setUint32(40, samples, true);
  for (let i = 0; i < samples; i++) view.setUint8(44 + i, 128);
  return URL.createObjectURL(new Blob([buffer], { type: "audio/wav" }));
}

function mp3Url(base64: string): string {
  const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
  return URL.createObjectURL(new Blob([bytes], { type: "audio/mpeg" }));
}

export function createDemoVoice(): DemoVoice {
  let audio: HTMLAudioElement | null = null;
  let silence: string | null = null;
  let muted = false;
  let elevenLabsAvailable = true;
  let generation = 0;
  let stopCurrent: (() => void) | null = null;
  const clips = new Map<string, Promise<Clip | null>>();
  const hasSpeech = () => typeof window !== "undefined" && "speechSynthesis" in window;

  const element = () => (audio ??= new Audio());

  const clip = (call: DemoCall, line: number): Promise<Clip | null> => {
    if (!elevenLabsAvailable) return Promise.resolve(null);
    const path = demoSpeechPath(call.id, line, spokenText(call, line));
    const cached = clips.get(path);
    if (cached) return cached;
    const pending = fetch(path)
      .then(async (response): Promise<Clip | null> => {
        if (response.status === 503) elevenLabsAvailable = false;
        if (!response.ok) return null;
        const speech = (await response.json()) as DemoSpeech;
        return { url: mp3Url(speech.audio), wordStarts: speech.wordStarts };
      })
      .catch(() => null);
    clips.set(path, pending);
    void pending.then((result) => {
      if (!result) clips.delete(path);
    });
    return pending;
  };

  const withTimeout = <T>(promise: Promise<T>, ms: number, fallback: T) =>
    Promise.race([promise, wait(ms).then(() => fallback)]);

  /** Plays an ElevenLabs clip, revealing each word as the audio reaches it. */
  const playClip = (found: Clip, wordCount: number, reveal: (words: number) => void) =>
    new Promise<boolean>((resolve) => {
      const el = element();
      let ticker = 0;
      let shown = -1;
      const update = () => {
        const words = wordsSpoken(el.currentTime, wordCount, found.wordStarts, el.duration);
        if (words !== shown) {
          shown = words;
          reveal(words);
        }
      };
      const finish = (ok: boolean) => {
        window.clearInterval(ticker);
        el.onended = null;
        el.onerror = null;
        stopCurrent = null;
        if (ok) reveal(wordCount);
        resolve(ok);
      };
      el.onended = () => finish(true);
      el.onerror = () => finish(false);
      stopCurrent = () => {
        el.pause();
        finish(true);
      };
      el.src = found.url;
      el.play().then(
        () => {
          update();
          ticker = window.setInterval(update, TICK_MS);
        },
        () => finish(false),
      );
    });

  /** The browser's own voice. Word boundary events keep the transcript in step where supported. */
  const speakWithBrowser = (text: string, wordCount: number, reveal: (words: number) => void) =>
    new Promise<void>((resolve) => {
      const estimate = estimateMs(text);
      const timers: number[] = [];
      let boundaries = false;
      let started = false;
      let done = false;
      const paced = () => {
        if (started) return;
        started = true;
        for (let i = 0; i < wordCount; i++) {
          const at = (estimate / wordCount) * i;
          timers.push(window.setTimeout(() => boundaries || reveal(i + 1), at));
        }
      };
      const finish = () => {
        if (done) return;
        done = true;
        timers.forEach((t) => window.clearTimeout(t));
        stopCurrent = null;
        reveal(wordCount);
        resolve();
      };
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-CA";
      utterance.onstart = paced;
      utterance.onboundary = (event) => {
        if (event.name !== "word") return;
        boundaries = true;
        reveal(text.slice(0, event.charIndex).split(" ").filter(Boolean).length + 1);
      };
      utterance.onend = finish;
      utterance.onerror = finish;
      stopCurrent = () => {
        window.speechSynthesis.cancel();
        finish();
      };
      window.speechSynthesis.speak(utterance);
      // If the browser has no voice or never reports progress, keep the transcript moving.
      void wait(1_500).then(paced);
      void wait(estimate + SPEECH_GRACE_MS).then(finish);
    });

  const silently = (text: string, wordCount: number, reveal: (words: number) => void) =>
    new Promise<void>((resolve) => {
      const perWord = estimateMs(text) / wordCount;
      const timers: number[] = [];
      const finish = () => {
        timers.forEach((t) => window.clearTimeout(t));
        stopCurrent = null;
        reveal(wordCount);
        resolve();
      };
      for (let i = 0; i < wordCount; i++) {
        timers.push(window.setTimeout(() => reveal(i + 1), perWord * i));
      }
      timers.push(window.setTimeout(finish, perWord * wordCount));
      stopCurrent = finish;
    });

  return {
    unlock() {
      silence ??= silentWavUrl();
      const el = element();
      el.src = silence;
      el.play().catch(() => undefined);
      if (hasSpeech()) window.speechSynthesis.speak(new SpeechSynthesisUtterance(""));
    },

    prefetch(call) {
      if (muted) return;
      call.lines.forEach((_, line) => void clip(call, line));
    },

    async speak(call, line, reveal) {
      const text = call.lines[line] ?? "";
      const wordCount = Math.max(1, text.split(" ").length);
      const current = generation;
      if (muted) return silently(text, wordCount, reveal);

      const found = await withTimeout(clip(call, line), CLIP_TIMEOUT_MS, null);
      if (current !== generation) return;
      if (found && !muted && (await playClip(found, wordCount, reveal))) return;
      if (current !== generation) return;
      if (hasSpeech() && !muted) return speakWithBrowser(text, wordCount, reveal);
      return silently(text, wordCount, reveal);
    },

    setMuted(value) {
      muted = value;
      if (value) {
        // Ends the line being spoken; the rest of the call continues silently.
        stopCurrent?.();
        audio?.pause();
        if (hasSpeech()) window.speechSynthesis.cancel();
      }
    },

    cancel() {
      generation++;
      stopCurrent?.();
      stopCurrent = null;
      audio?.pause();
      if (hasSpeech()) window.speechSynthesis.cancel();
    },
  };
}
