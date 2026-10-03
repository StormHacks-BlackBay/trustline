import { describe, expect, it } from "vitest";
import { draftAdvisory } from "./advisory";
import type { Incident } from "./types";

const incident = (overrides: Partial<Incident>): Incident => ({
  id: "1",
  partnerId: "demo-newcomer-society",
  risk: "high",
  flags: [],
  claimedOrg: null,
  redactedExcerpt: "",
  language: "pa",
  createdAt: new Date().toISOString(),
  ...overrides,
});

describe("draftAdvisory", () => {
  it("names the organization and the most serious tactics first", () => {
    const draft = draftAdvisory(
      incident({
        claimedOrg: "Immigration, Refugees and Citizenship Canada (IRCC)",
        flags: ["urgency", "gift_card_payment", "deportation_threat"],
      }),
    );
    expect(draft.title).toBe(
      "Scam calls pretending to be Immigration, Refugees and Citizenship Canada (IRCC)",
    );
    expect(draft.body).toContain(
      "The caller asks for payment in gift cards, threatens deportation and pressures people to act right away.",
    );
  });

  it("works without an organization or flags", () => {
    const draft = draftAdvisory(incident({}));
    expect(draft.title).toBe("Scam calls reported in our community");
    expect(draft.body).not.toContain("The caller");
  });
});
