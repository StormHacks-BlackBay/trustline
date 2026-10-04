import type { DemoCall } from "../../data/demoCalls";
import { demoSpeechPath } from "../../lib/demoSpeech";

/** Pace used when the real length of the speech is unknown (browser voices, muted playback). */
const MS_PER_WORD = 360;
/** How long to wait for an ElevenLabs clip before using the browser's voice instead. */
const CLIP_TIMEOUT_MS = 8_000;
/** Some browsers never fire speech events; give up waiting after this much extra time. */
const SPEECH_GRACE_MS = 3_000;

export function estimateMs(text: string): number {
  return Math.max(1, text.split(" ").length) * MS_PER_WORD;
}

/**
 * Reads demo call lines aloud. Prefers ElevenLabs audio from `/api/demo-speech`, falls back to
 * the browser's speech synthesis, and falls back again to silent timing, so a demo always runs.
 */
export interface DemoVoice {
  /** Call synchronously inside the click that starts a demo, so mobile browsers allow audio. */
  unlock: () => void;
  /** Starts fetching every line of a call so playback does not wait between lines. */
  prefetch: (call: DemoCall) => void;
  /**
   * Speaks one line. `onStart` receives the expected length in milliseconds once speech begins.
   * Resolves when the line finishes, fails or is cancelled.
   */
  speak: (call: DemoCall, line: number, onStart: (durationMs: number) => void) => Promise<void>;
  setMuted: (muted: boolean) => void;
  cancel: () => void;
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

export function createDemoVoice(): DemoVoice {
  let audio: HTMLAudioElement | null = null;
  let silence: string | null = null;
  let muted = false;
  let elevenLabsAvailable = true;
  let generation = 0;
  let stopCurrent: (() => void) | null = null;
  const clips = new Map<string, Promise<string | null>>();
  const hasSpeech = () => typeof window !== "undefined" && "speechSynthesis" in window;

  const element = () => (audio ??= new Audio());

  const clip = (call: DemoCall, line: number): Promise<string | null> => {
    if (!elevenLabsAvailable) return Promise.resolve(null);
    const path = demoSpeechPath(call.id, line, call.lines[line] ?? "");
    const cached = clips.get(path);
    if (cached) return cached;
    const pending = fetch(path)
      .then(async (response) => {
        if (response.status === 503) elevenLabsAvailable = false;
        return response.ok ? URL.createObjectURL(await response.blob()) : null;
      })
      .catch(() => null);
    clips.set(path, pending);
    void pending.then((url) => {
      if (!url) clips.delete(path);
    });
    return pending;
  };

  const withTimeout = <T>(promise: Promise<T>, ms: number, fallback: T) =>
    Promise.race([promise, wait(ms).then(() => fallback)]);

  const playClip = (url: string, text: string, onStart: (ms: number) => void) =>
    new Promise<boolean>((resolve) => {
      const el = element();
      const finish = (ok: boolean) => {
        el.onended = null;
        el.onerror = null;
        stopCurrent = null;
        resolve(ok);
      };
      el.onended = () => finish(true);
      el.onerror = () => finish(false);
      stopCurrent = () => {
        el.pause();
        finish(true);
      };
      el.src = url;
      el.play().then(
        () => onStart(Number.isFinite(el.duration) ? el.duration * 1000 : estimateMs(text)),
        () => finish(false),
      );
    });

  const speakWithBrowser = (text: string, onStart: (ms: number) => void) =>
    new Promise<void>((resolve) => {
      const estimate = estimateMs(text);
      let started = false;
      let done = false;
      const begin = () => {
        if (started) return;
        started = true;
        onStart(estimate);
      };
      const finish = () => {
        if (done) return;
        done = true;
        stopCurrent = null;
        resolve();
      };
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-CA";
      utterance.onstart = begin;
      utterance.onend = finish;
      utterance.onerror = finish;
      stopCurrent = () => {
        window.speechSynthesis.cancel();
        finish();
      };
      window.speechSynthesis.speak(utterance);
      // If the browser has no voice or never reports progress, keep the transcript moving.
      void wait(1_500).then(begin);
      void wait(estimate + SPEECH_GRACE_MS).then(finish);
    });

  const silently = async (text: string, onStart: (ms: number) => void) => {
    const ms = estimateMs(text);
    onStart(ms);
    await new Promise<void>((resolve) => {
      const timer = window.setTimeout(resolve, ms);
      stopCurrent = () => {
        window.clearTimeout(timer);
        resolve();
      };
    });
    stopCurrent = null;
  };

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

    async speak(call, line, onStart) {
      const text = call.lines[line] ?? "";
      const current = generation;
      if (muted) return silently(text, onStart);

      const url = await withTimeout(clip(call, line), CLIP_TIMEOUT_MS, null);
      if (current !== generation) return;
      if (url && !muted && (await playClip(url, text, onStart))) return;
      if (current !== generation) return;
      if (hasSpeech() && !muted) return speakWithBrowser(text, onStart);
      return silently(text, onStart);
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
