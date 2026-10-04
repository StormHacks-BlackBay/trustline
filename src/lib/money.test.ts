import { describe, expect, it } from "vitest";
import { DEMO_CALLS } from "../data/demoCalls";
import { amountsMentioned, formatDollars, largestAmount, wordsToNumber } from "./money";

describe("wordsToNumber", () => {
  it.each([
    ["two thousand five hundred", 2500],
    ["eighteen hundred", 1800],
    ["three hundred and twelve", 312],
    ["fifty", 50],
    ["one million", 1_000_000],
    ["twenty-eight", 28],
  ])("reads %s as %d", (words, value) => {
    expect(wordsToNumber(words)).toBe(value);
  });

  it("rejects phrases with other words", () => {
    expect(wordsToNumber("a fine of")).toBeNull();
  });
});

describe("amountsMentioned", () => {
  it("finds digits with a dollar sign or the word dollars", () => {
    expect(amountsMentioned("Pay $2,500 now, or 300 dollars today, or $1.99.")).toEqual([
      2500, 1.99, 300,
    ]);
  });

  it("finds spelled-out amounts inside a sentence", () => {
    expect(amountsMentioned("You must pay a fine of two thousand five hundred dollars.")).toEqual([
      2500,
    ]);
  });

  it("ignores numbers that are not money", () => {
    expect(amountsMentioned("Your card ending in 4821 and case number 77.")).toEqual([]);
  });
});

describe("largestAmount", () => {
  it("finds what the IRCC demo scammer asks for", () => {
    const ircc = DEMO_CALLS.find((c) => c.id === "ircc-scam");
    expect(largestAmount(ircc?.lines.join("\n") ?? "")).toBe(2500);
  });

  it("returns null when no money is mentioned", () => {
    expect(largestAmount("Hello, how are you?")).toBeNull();
  });
});

describe("formatDollars", () => {
  it("formats whole and fractional amounts", () => {
    expect(formatDollars(2500)).toBe("$2,500");
    expect(formatDollars(1.99)).toBe("$1.99");
  });
});
