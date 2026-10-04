import { describe, expect, it } from "vitest";
import { DEMO_CALLS } from "../data/demoCalls";
import { demoSpeechPath, lineHash } from "./demoSpeech";

describe("lineHash", () => {
  it("is stable for the same text and changes when the text changes", () => {
    expect(lineHash("Hello there")).toBe(lineHash("Hello there"));
    expect(lineHash("Hello there")).not.toBe(lineHash("Hello there."));
  });

  it("gives every demo line a distinct hash", () => {
    const lines = DEMO_CALLS.flatMap((c) => c.lines);
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
