import { describe, expect, it } from "vitest";
import { scribeKeyterms } from "./keyterms";

describe("scribeKeyterms", () => {
  it("stays within the Scribe limits", () => {
    const terms = scribeKeyterms();
    expect(terms.length).toBeLessThanOrEqual(50);
    expect(terms.every((t) => t.length <= 20)).toBe(true);
    expect(new Set(terms).size).toBe(terms.length);
  });

  it("includes scam vocabulary and short organization names", () => {
    expect(scribeKeyterms()).toEqual(expect.arrayContaining(["gift card", "ircc", "cra"]));
  });
});
