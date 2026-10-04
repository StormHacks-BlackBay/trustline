import { describe, expect, it } from "vitest";
import { DEMO_CALLS } from "../data/demoCalls";
import { demoSpeechPath, lineHash, plainWords, spokenText } from "./demoSpeech";

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
    expect(url.searchParams.get("v")).toBe(lineHash("Some line"));
  });
});

describe("spoken scripts", () => {
  it.each(DEMO_CALLS.filter((c) => c.spoken))(
    "$id speaks the same words the transcript shows",
    (call) => {
      expect(call.spoken).toHaveLength(call.lines.length);
      call.lines.forEach((line, i) => {
        expect(plainWords(spokenText(call, i))).toEqual(plainWords(line));
      });
    },
  );

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
