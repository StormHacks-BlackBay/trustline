import { describe, expect, it } from "vitest";
import { fuse } from "./fusion";
import { runRules } from "./rules";
import type { RiskAssessment } from "./schemas";

const llm = (overrides: Partial<RiskAssessment>, coversWholeCall = true) => ({
  assessment: {
    risk: "low",
    flags: [],
    claimedOrg: null,
    evidenceQuotes: [],
    explanation: "x",
    explanationEnglish: "x",
    ...overrides,
  } satisfies RiskAssessment,
  coversWholeCall,
});

describe("fuse", () => {
  it("uses the rules alone until the LLM answers", () => {
    const transcript = "Pay with bitcoin now.";
    const result = fuse({ transcript, rules: runRules(transcript), llm: null });
    expect(result.risk).toBe("high");
    expect(result.source).toBe("rules");
    expect(result.evidence).toContain("bitcoin");
  });

  it("never lets the LLM lower a hard signal", () => {
    const transcript = "Please buy gift cards.";
    const result = fuse({ transcript, rules: runRules(transcript), llm: llm({ risk: "low" }) });
    expect(result.risk).toBe("high");
  });

  it("lets the LLM lower a soft signal when it read the whole call", () => {
    const transcript = "Your pharmacy order is ready, please pick it up immediately.";
    const rules = runRules(transcript);
    expect(rules.risk).toBe("medium");
    const result = fuse({ transcript, rules, llm: llm({ risk: "low" }) });
    expect(result.risk).toBe("low");
    expect(result.explanation).toBeNull();
  });

  it("does not lower when the LLM only saw part of the call", () => {
    const transcript = "Act now, this is urgent.";
    const result = fuse({
      transcript,
      rules: runRules(transcript),
      llm: llm({ risk: "low" }, false),
    });
    expect(result.risk).toBe("medium");
  });

  it("lets the LLM raise risk the rules missed", () => {
    const transcript = "We need you to move your savings somewhere safer for us.";
    const result = fuse({
      transcript,
      rules: runRules(transcript),
      llm: llm({ risk: "high", flags: ["wire_transfer"], evidenceQuotes: ["move your savings"] }),
    });
    expect(result.risk).toBe("high");
    expect(result.flags).toContain("wire_transfer");
    expect(result.evidence).toContain("move your savings");
  });

  it("drops quotes that do not appear in the transcript", () => {
    const transcript = "Hello there.";
    const result = fuse({
      transcript,
      rules: runRules(transcript),
      llm: llm({ risk: "medium", evidenceQuotes: ["send money now"] }),
    });
    expect(result.evidence).toEqual([]);
  });
});
