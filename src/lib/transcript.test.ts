import { describe, expect, it } from "vitest";
import { recentWindow, type Segment } from "./transcript";

const seg = (text: string, i: number): Segment => ({ id: String(i), text, committedAt: i });

describe("recentWindow", () => {
  it("keeps segments in order", () => {
    expect(recentWindow([seg("one", 1), seg("two", 2)])).toBe("one\ntwo");
  });

  it("drops the oldest segments first when over the limit", () => {
    const segments = [seg("a".repeat(10), 1), seg("b".repeat(10), 2), seg("c".repeat(10), 3)];
    expect(recentWindow(segments, 22)).toBe(`${"b".repeat(10)}\n${"c".repeat(10)}`);
  });

  it("always keeps the newest segment even if it is long", () => {
    expect(recentWindow([seg("x".repeat(50), 1)], 10)).toBe("x".repeat(50));
  });

  it("skips blank segments", () => {
    expect(recentWindow([seg("  ", 1), seg("hi", 2)])).toBe("hi");
  });
});
