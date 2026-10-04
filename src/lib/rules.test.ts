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

describe("runRules on links", () => {
  it("flags full URLs, bare domains and 'click the link'", () => {
    for (const text of [
      "Claim your refund at https://cra-refund-portal.com/claim.",
      "Pay the $1.99 fee at canadapost-redelivery.info to avoid return.",
      "Click the link below to verify your account.",
    ]) {
      expect(runRules(text).flags, text).toContain("suspicious_link");
    }
  });

  it("keeps trailing punctuation out of the evidence", () => {
    const match = runRules("Go to https://example.com/pay.").matches.find(
      (m) => m.flag === "suspicious_link",
    );
    expect(match?.text).toBe("https://example.com/pay");
  });

  it("does not flag a promise never to send links, times or decimals", () => {
    expect(runRules("We will never text you a link asking for your password.").flags).toEqual([]);
    expect(runRules("Your appointment is at 10:30 a.m. and costs $1.99.").flags).toEqual([]);
  });

  it("rates a link combined with pressure as high risk", () => {
    const result = runRules("Do not tell anyone. Pay the fine at cra-payments.net right now.");
    expect(result.flags).toEqual(expect.arrayContaining(["suspicious_link", "urgency", "secrecy"]));
    expect(result.risk).toBe("high");
  });
});
