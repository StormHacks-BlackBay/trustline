import { describe, expect, it } from "vitest";
import { estimateMs, wordsSpoken } from "./demoVoice";

describe("wordsSpoken", () => {
  it("shows exactly the words whose start time has passed", () => {
    const starts = [0.2, 0.6, 1.4, 2.1];
    expect(wordsSpoken(0, 4, starts, 3)).toBe(0);
    expect(wordsSpoken(0.6, 4, starts, 3)).toBe(2);
    expect(wordsSpoken(1.5, 4, starts, 3)).toBe(3);
    expect(wordsSpoken(9, 4, starts, 3)).toBe(4);
  });

  it("paces words across the clip when there are no timings", () => {
    expect(wordsSpoken(0, 4, null, 4)).toBe(1);
    expect(wordsSpoken(2, 4, null, 4)).toBe(3);
    expect(wordsSpoken(4, 4, null, 4)).toBe(4);
  });

  it("shows nothing until the clip length is known", () => {
    expect(wordsSpoken(1, 4, null, Number.NaN)).toBe(0);
    expect(wordsSpoken(1, 4, null, 0)).toBe(0);
  });
});

describe("estimateMs", () => {
  it("scales with the number of words", () => {
    expect(estimateMs("one two three")).toBe(3 * estimateMs("one"));
  });
});
