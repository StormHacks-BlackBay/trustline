import { describe, expect, it } from "vitest";
import type { Incident } from "../../lib/types";
import { summarize } from "./summary";

const incident = (
  risk: Incident["risk"],
  claimedOrg: string | null,
  overrides: Partial<Incident> = {},
): Incident => ({
  id: Math.random().toString(),
  partnerId: "p",
  risk,
  flags: [],
  claimedOrg,
  redactedExcerpt: "",
  language: "en",
  createdAt: "2026-10-03T00:00:00Z",
  ...overrides,
});

describe("summarize", () => {
  it("counts reports, likely scams and the most impersonated organization", () => {
    const summary = summarize([
      incident("high", "IRCC"),
      incident("medium", "CRA"),
      incident("high", "IRCC"),
      incident("low", null),
    ]);
    expect(summary.total).toBe(4);
    expect(summary.likelyScams).toBe(2);
    expect(summary.topClaimedOrg).toBe("IRCC");
  });

  it("adds up the money asked for in warned-about reports only", () => {
    const summary = summarize([
      incident("high", "IRCC", { redactedExcerpt: "Pay two thousand five hundred dollars." }),
      incident("medium", "CRA", { redactedExcerpt: "There is a $300 balance." }),
      incident("low", null, { redactedExcerpt: "Your $50 refund is ready." }),
    ]);
    expect(summary.moneyAtRisk).toBe(2800);
  });

  it("ranks tactics and member languages", () => {
    const summary = summarize([
      incident("high", null, { flags: ["gift_card_payment", "urgency"], language: "pa" }),
      incident("high", null, { flags: ["gift_card_payment"], language: "pa" }),
      incident("high", null, { flags: ["urgency", "crypto_payment"], language: "zh" }),
    ]);
    expect(summary.tactics.map((t) => [t.key, t.count])).toEqual([
      ["gift_card_payment", 2],
      ["urgency", 2],
      ["crypto_payment", 1],
    ]);
    expect(summary.languages.map((l) => [l.label, l.count])).toEqual([
      ["Punjabi", 2],
      ["Mandarin", 1],
    ]);
  });

  it("handles an empty list", () => {
    expect(summarize([])).toEqual({
      total: 0,
      likelyScams: 0,
      topClaimedOrg: null,
      moneyAtRisk: 0,
      tactics: [],
      languages: [],
    });
  });
});
