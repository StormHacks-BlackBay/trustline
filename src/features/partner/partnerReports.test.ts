import { describe, expect, it } from "vitest";
import type { Advisory, Incident, Partner } from "../../lib/types";
import { cafcSummary, incidentsCsv, memberAlert } from "./partnerReports";

const society: Partner = { id: "s", name: "Demo Newcomer Society", kind: "community" };
const creditUnion: Partner = { id: "c", name: "Demo Credit Union", kind: "financial" };

const incident: Incident = {
  id: "i1",
  partnerId: "s",
  risk: "high",
  flags: ["gift_card_payment", "deportation_threat"],
  claimedOrg: "Immigration, Refugees and Citizenship Canada",
  redactedExcerpt: 'Pay two thousand five hundred dollars in "gift cards", now.',
  language: "pa",
  createdAt: "2026-10-03T22:00:00Z",
};

const advisory: Advisory = {
  id: "a1",
  publisherId: "s",
  title: "Calls claiming to be IRCC",
  body: "Callers ask for gift cards to cancel a warrant.",
  claimedOrg: "IRCC",
  createdAt: "2026-10-03T22:05:00Z",
};

describe("memberAlert", () => {
  it("passes on the advisory with advice suited to the sender", () => {
    expect(memberAlert(advisory, creditUnion)).toMatch(
      /^Demo Credit Union scam alert: Calls claiming to be IRCC\. Callers ask/,
    );
    expect(memberAlert(advisory, creditUnion)).toContain("back of your card");
    expect(memberAlert(advisory, society)).toContain("official number");
  });
});

describe("cafcSummary", () => {
  it("includes the claimed organization, tactics, amount and excerpt but not the member", () => {
    const text = cafcSummary(incident, society);
    expect(text).toContain("Caller claimed to be: Immigration, Refugees and Citizenship Canada");
    expect(text).toContain("Tactics: Gift card payment, Immigration threat");
    expect(text).toContain("Amount demanded: $2,500");
    expect(text).toContain("Member's language: Punjabi");
    expect(text).toContain("identity withheld");
    expect(text).toContain(incident.redactedExcerpt);
  });
});

describe("incidentsCsv", () => {
  it("exports anonymized columns without the free-text excerpt", () => {
    const csv = incidentsCsv([incident]);
    const [header, row] = csv.split("\n");
    expect(header).toBe("reported_at,risk,claimed_org,tactics,amount_demanded_cad,member_language");
    expect(row).toBe(
      '2026-10-03T22:00:00Z,high,"Immigration, Refugees and Citizenship Canada",gift_card_payment deportation_threat,2500,pa',
    );
    expect(csv).not.toContain("gift cards");
  });
});
