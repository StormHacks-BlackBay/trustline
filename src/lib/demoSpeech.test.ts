import { describe, expect, it } from "vitest";
import { DEMO_CALLS } from "../data/demoCalls";
import {
  demoSpeechPath,
  lineHash,
  plainWords,
  speechHash,
  spokenText,
  wordStartTimes,
} from "./demoSpeech";

describe("lineHash", () => {
  it("is stable for the same text and changes when the text changes", () => {
    expect(lineHash("Hello there")).toBe(lineHash("Hello there"));
    expect(lineHash("Hello there")).not.toBe(lineHash("Hello there."));
  });

  it("gives every spoken demo line a distinct hash", () => {
    const lines = DEMO_CALLS.flatMap((c) => c.lines.map((_, i) => spokenText(c, i)));
    expect(new Set(lines.map(lineHash)).size).toBe(lines.length);
  });
});

describe("demoSpeechPath", () => {
  it("builds the API path with the call, line and hash", () => {
    const path = demoSpeechPath("ircc-scam", 2, "Some line");
    const url = new URL(path, "http://local");
    expect(url.pathname).toBe("/api/demo-speech");
    expect(url.searchParams.get("call")).toBe("ircc-scam");
    expect(url.searchParams.get("line")).toBe("2");
    expect(url.searchParams.get("v")).toBe(speechHash("Some line"));
  });
});

describe("spoken scripts", () => {
  it("speaks the same words the transcript shows", () => {
    for (const call of DEMO_CALLS) {
      if (call.spoken) expect(call.spoken).toHaveLength(call.lines.length);
      call.lines.forEach((line, i) => {
        expect(plainWords(spokenText(call, i)), `${call.id} line ${i}`).toEqual(plainWords(line));
      });
    }
  });

  it("falls back to the transcript line when a call has no acted script", () => {
    const call = { id: "x", title: "", description: "", lines: ["Plain line."] };
    expect(spokenText(call, 0)).toBe("Plain line.");
  });

  it("strips audio tags and punctuation when comparing", () => {
    expect(plainWords("[sternly] Detained... and deported.")).toEqual([
      "detained",
      "and",
      "deported",
    ]);
  });
});

describe("wordStartTimes", () => {
  const timed = (text: string) => {
    const characters = [...text];
    return wordStartTimes(
      characters,
      characters.map((_, i) => i),
      text
        .replace(/\[[^\]]*\]/g, "")
        .trim()
        .split(/\s+/).length,
    );
  };

  it("returns the start of each word and skips audio tags", () => {
    expect(timed("[sternly] Pay now... or else.")).toEqual([10, 14, 21, 24]);
  });

  it("keeps contractions and numbers as single words", () => {
    expect(timed("We'll call 4821.")).toEqual([0, 6, 11]);
  });

  it("returns null when the word count does not match the transcript", () => {
    expect(wordStartTimes([..."one two"], [0, 1, 2, 3, 4, 5, 6], 3)).toBeNull();
  });

  it("times every transcript word of every demo line", () => {
    for (const call of DEMO_CALLS) {
      call.lines.forEach((line, i) => {
        const characters = [...spokenText(call, i)];
        const starts = wordStartTimes(
          characters,
          characters.map((_, j) => j),
          line.split(" ").length,
        );
        expect(starts, `${call.id} line ${i}`).not.toBeNull();
      });
    }
  });
});
