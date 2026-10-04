import { describe, expect, it } from "vitest";
import { DIRECTORY } from "./directory";
import {
  PROTECT_STEPS,
  recoveryPath,
  REPORT_STEPS,
  SITUATIONS,
  situationsForFlags,
  urgentSteps,
} from "./recovery";

const directoryPhones = new Set(DIRECTORY.map((d) => d.phone).filter(Boolean));

describe("recovery guide content", () => {
  const allSteps = [...SITUATIONS.flatMap((s) => s.steps), ...REPORT_STEPS, ...PROTECT_STEPS];

  it("only shows phone numbers from the verified directory", () => {
    for (const step of allSteps) {
      for (const contact of step.contacts ?? []) {
        if (contact.phone) expect(directoryPhones, step.id).toContain(contact.phone);
      }
    }
  });

  it("links only to https pages", () => {
    for (const step of allSteps) {
      for (const contact of step.contacts ?? []) {
        if (contact.url) expect(contact.url, step.id).toMatch(/^https:\/\//);
      }
    }
  });

  it("gives every situation at least one urgent step", () => {
    for (const situation of SITUATIONS) expect(situation.steps.length).toBeGreaterThan(0);
  });

  it("starts reporting by gathering evidence and includes the Anti-Fraud Centre", () => {
    expect(REPORT_STEPS[0]?.id).toBe("gather");
    expect(REPORT_STEPS.map((s) => s.id)).toContain("cafc");
  });
});

describe("urgentSteps", () => {
  it("shows a step shared by several situations once", () => {
    const steps = urgentSteps(["money_transfer", "card_or_bank", "codes_or_passwords"]);
    const ids = steps.map((s) => s.id);
    expect(ids.filter((id) => id === "call-bank")).toHaveLength(1);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("keeps the order of the situations list, not the order they were ticked", () => {
    const steps = urgentSteps(["identity", "gift_cards"]);
    expect(steps[0]?.id).toBe("call-card-company");
  });

  it("returns nothing when no situation is chosen", () => {
    expect(urgentSteps([])).toEqual([]);
  });
});

describe("situationsForFlags", () => {
  it("maps warning signs to the situations they lead to, once each", () => {
    expect(situationsForFlags(["gift_card_payment", "urgency", "deportation_threat"])).toEqual([
      "gift_cards",
    ]);
    expect(situationsForFlags(["one_time_code", "suspicious_link", "personal_info"])).toEqual([
      "codes_or_passwords",
      "identity",
    ]);
  });
});

describe("recoveryPath", () => {
  it("adds the situations to preselect", () => {
    expect(recoveryPath()).toBe("/recover");
    expect(recoveryPath(["gift_cards", "crypto"])).toBe("/recover?situations=gift_cards,crypto");
  });
});
