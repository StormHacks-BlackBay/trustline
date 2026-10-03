import { describe, expect, it } from "vitest";
import type { Incident } from "../../lib/types";
import { summarize } from "./summary";

const incident = (risk: Incident["risk"], claimedOrg: string | null): Incident => ({
  id: Math.random().toString(),
  partnerId: "p",
  risk,
  flags: [],
  claimedOrg,
  redactedExcerpt: "",
  language: "en",
  createdAt: "2026-10-03T00:00:00Z",
});

describe("summarize", () => {
  it("counts reports, likely scams and the most impersonated organization", () => {
    expect(
      summarize([
        incident("high", "IRCC"),
        incident("medium", "CRA"),
        incident("high", "IRCC"),
        incident("low", null),
      ]),
    ).toEqual({ total: 4, likelyScams: 2, topClaimedOrg: "IRCC" });
  });

  it("handles an empty list", () => {
    expect(summarize([])).toEqual({ total: 0, likelyScams: 0, topClaimedOrg: null });
  });
});
