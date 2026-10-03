import { describe, expect, it } from "vitest";
import { percentile, recordLatency, summary } from "./metrics";

describe("metrics", () => {
  it("computes percentiles", () => {
    expect(percentile([5, 1, 3, 2, 4], 50)).toBe(3);
    expect(percentile([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 90)).toBe(10);
    expect(percentile([], 50)).toBeNull();
  });

  it("ignores invalid samples", () => {
    recordLatency("rules", Number.NaN);
    recordLatency("rules", -5);
    recordLatency("rules", 12);
    expect(summary("rules")).toEqual({ count: 1, median: 12, p90: 12 });
  });
});
