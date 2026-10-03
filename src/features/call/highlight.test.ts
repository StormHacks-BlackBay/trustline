import { describe, expect, it } from "vitest";
import { highlight } from "./highlight";

describe("highlight", () => {
  it("marks evidence regardless of case", () => {
    expect(highlight("Buy Google Play cards now", ["google play cards"])).toEqual([
      { text: "Buy ", marked: false },
      { text: "Google Play cards", marked: true },
      { text: " now", marked: false },
    ]);
  });

  it("prefers the longest overlapping phrase", () => {
    const pieces = highlight("Pay at a bitcoin atm", ["bitcoin", "bitcoin atm"]);
    expect(pieces.filter((p) => p.marked).map((p) => p.text)).toEqual(["bitcoin atm"]);
  });

  it("escapes regex characters in evidence", () => {
    expect(highlight("Is it $2,500?", ["$2,500?"]).some((p) => p.marked)).toBe(true);
  });

  it("returns the line unchanged with no evidence", () => {
    expect(highlight("Hello", [])).toEqual([{ text: "Hello", marked: false }]);
  });
});
