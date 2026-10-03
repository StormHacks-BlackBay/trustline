import { hasHardFlag, type RuleResult } from "./rules";
import type { RiskAssessment } from "./schemas";
import { RISK_LEVELS, type FlagId, type RiskLevel } from "./types";

export interface FusionInput {
  transcript: string;
  rules: RuleResult;
  llm: { assessment: RiskAssessment; coversWholeCall: boolean } | null;
}

export interface Assessment {
  risk: RiskLevel;
  flags: FlagId[];
  /** Exact substrings of the transcript to highlight. */
  evidence: string[];
  claimedOrg: string | null;
  /** LLM explanation in the listener's language, or null when only the rules have run. */
  explanation: string | null;
  explanationEnglish: string | null;
  source: "rules" | "combined";
}

const rank = (risk: RiskLevel) => RISK_LEVELS.indexOf(risk);
const maxRisk = (a: RiskLevel, b: RiskLevel) => (rank(a) >= rank(b) ? a : b);

/**
 * Combines the instant rules result with the slower LLM assessment.
 *
 * Rules raise risk immediately. The LLM may lower it only when it has read the whole call and the
 * rules found no hard signal (gift cards, crypto, one-time codes, remote access): those are never
 * legitimate, whatever the context.
 */
export function fuse({ transcript, rules, llm }: FusionInput): Assessment {
  const ruleEvidence = rules.matches.map((m) => m.text);

  if (!llm) {
    return {
      risk: rules.risk,
      flags: rules.flags,
      evidence: unique(ruleEvidence),
      claimedOrg: null,
      explanation: null,
      explanationEnglish: null,
      source: "rules",
    };
  }

  const { assessment } = llm;
  const canLower = llm.coversWholeCall && !hasHardFlag(rules.flags);
  const risk = canLower ? assessment.risk : maxRisk(rules.risk, assessment.risk);
  const lowered = rank(risk) < rank(rules.risk);

  // Quotes the model returned are kept only if they really occur in the transcript.
  const haystack = transcript.toLowerCase();
  const llmEvidence = assessment.evidenceQuotes.filter(
    (q) => q.trim().length > 2 && haystack.includes(q.toLowerCase()),
  );

  return {
    risk,
    flags: lowered ? assessment.flags : unique([...rules.flags, ...assessment.flags]),
    evidence: lowered ? llmEvidence : unique([...ruleEvidence, ...llmEvidence]),
    claimedOrg: assessment.claimedOrg,
    explanation: risk === "low" ? null : assessment.explanation,
    explanationEnglish: risk === "low" ? null : assessment.explanationEnglish,
    source: "combined",
  };
}

function unique<T>(values: T[]): T[] {
  return [...new Set(values)];
}
