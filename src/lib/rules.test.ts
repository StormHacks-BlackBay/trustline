import { describe, expect, it } from "vitest";
import { DEMO_CALLS } from "../data/demoCalls";
import { riskFromFlags, runRules } from "./rules";

const script = (id: string) => {
  const call = DEMO_CALLS.find((c) => c.id === id);
  if (!call) throw new Error(`missing demo call ${id}`);
  return call.lines.join("\n");
};

describe("runRules on the demo calls", () => {
  it("rates the IRCC impersonation call as high risk with the expected tactics", () => {
    const result = runRules(script("ircc-scam"));
    expect(result.risk).toBe("high");
    expect(result.flags).toEqual(
      expect.arrayContaining([
        "gift_card_payment",
        "crypto_payment",
        "arrest_threat",
        "deportation_threat",
        "urgency",
        "secrecy",
      ]),
    );
  });

  it("keeps the real bank fraud alert low risk despite mentioning a PIN and a code", () => {
    const result = runRules(script("bank-alert"));
    expect(result.flags).toEqual([]);
    expect(result.risk).toBe("low");
  });

  it("rates the unclear bank call as medium risk because it asks for personal details", () => {
    const result = runRules(script("bank-ambiguous"));
    expect(result.flags).toContain("personal_info");
    expect(result.risk).toBe("medium");
  });
});

describe("runRules details", () => {
  it("returns the exact matched text for highlighting", () => {
    const text = "Please buy Google Play cards today.";
    const [match] = runRules(text).matches;
    expect(match?.text).toBe("Google Play cards");
    expect(text.slice(match?.index, (match?.index ?? 0) + (match?.text.length ?? 0))).toBe(
      "Google Play cards",
    );
  });

  it("does not treat 'sin' inside other words as a SIN request", () => {
    expect(runRules("We are closing the business since Monday.").flags).toEqual([]);
  });

  it("flags a request to read out a code", () => {
    expect(runRules("Can you read me the code we just sent?").flags).toContain("one_time_code");
  });
});

describe("riskFromFlags", () => {
  it("treats a threat with urgency as high risk", () => {
    expect(riskFromFlags(["deportation_threat", "urgency"])).toBe("high");
  });

  it("treats a single soft signal as medium risk", () => {
    expect(riskFromFlags(["urgency"])).toBe("medium");
  });

  it("treats no flags as low risk", () => {
    expect(riskFromFlags([])).toBe("low");
  });
});
