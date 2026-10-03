import type { FlagId, RiskLevel } from "./types";

export interface RuleMatch {
  flag: FlagId;
  /** The exact text that matched, as it appears in the transcript. */
  text: string;
  index: number;
}

export interface RuleResult {
  risk: RiskLevel;
  flags: FlagId[];
  matches: RuleMatch[];
}

const PATTERNS: Record<FlagId, RegExp[]> = {
  gift_card_payment: [
    /\b(gift ?cards?|google play( cards?)?|itunes cards?|apple gift cards?|steam cards?|amazon cards?|prepaid (visa|cards?)|vouchers?)\b/gi,
  ],
  crypto_payment: [
    /\b(bitcoins?|btc|crypto(currency)?|bitcoin atm|crypto atm|usdt|tether|ethereum)\b/gi,
  ],
  wire_transfer: [
    /\b(western union|moneygram|wire (the )?(money|funds|payment)|e-?transfer (it|the (money|funds|payment))|transfer (the |your )?(money|funds|savings) (to|into)|(safe|secure|protected) account)\b/gi,
  ],
  one_time_code: [
    /\b(verification code|one[- ]time (code|passcode|password)|security code|six[- ]digit code|(the )?code (we|i) (just )?(sent|texted)|read (me )?the code|passcode|pin( number)?)\b/gi,
  ],
  personal_info: [
    /\b(social insurance number|sin number|passport number|(full )?card number|online banking (password|login)|date of birth|mother'?s maiden name)\b/gi,
    /\bSIN\b/g,
  ],
  remote_access: [
    /\b(anydesk|teamviewer|remote access|(install|download) (this|an|the) app|control of your (computer|phone|screen)|share your screen)\b/gi,
  ],
  secrecy: [
    /\b((do not|don'?t) (tell|inform|speak to|talk to) (anyone|anybody|your (family|bank|friends))|keep (this|it) (confidential|secret|between us)|(do not|don'?t) hang up|stay on the line)\b/gi,
  ],
  urgency: [
    /\b(within the next (hour|\d+ (minutes|hours)|[a-z]+ (minutes|hours))|in the next (hour|\d+ minutes)|immediately|right now|act now|(the )?cards now|before the (end of the day|call ends)|(resolved|paid) today)\b/gi,
  ],
  arrest_threat: [
    /\b(warrants?|arrest(ed)?|detain(ed)?|jail|prison|lawsuit|legal action|police will)\b/gi,
  ],
  deportation_threat: [
    /\b(deport(ed|ation)?|lose your (status|visa|citizenship|permanent residence)|(visa|status|citizenship|permanent residence) (will be )?(cancell?ed|revoked|suspended)|removed from canada)\b/gi,
  ],
};

// "We will never ask for your PIN" describes a safe practice, not a request.
const NEGATED_REQUEST =
  /\b(never|won'?t|will not|would not|wouldn'?t|do not|don'?t|does not|doesn'?t) (ever )?(ask|request|need|call)\b[^.?!]*$/i;

const HARD_FLAGS: FlagId[] = [
  "gift_card_payment",
  "crypto_payment",
  "one_time_code",
  "remote_access",
];
const REQUEST_FLAGS: FlagId[] = ["wire_transfer", "personal_info"];
const PRESSURE_FLAGS: FlagId[] = ["urgency", "secrecy", "arrest_threat", "deportation_threat"];
const THREAT_FLAGS: FlagId[] = ["arrest_threat", "deportation_threat"];

export const hasHardFlag = (flags: FlagId[]) => flags.some((f) => HARD_FLAGS.includes(f));

export function riskFromFlags(flags: FlagId[]): RiskLevel {
  const has = (group: FlagId[]) => flags.some((f) => group.includes(f));
  if (has(HARD_FLAGS)) return "high";
  if (has(REQUEST_FLAGS) && has(PRESSURE_FLAGS)) return "high";
  if (has(THREAT_FLAGS) && flags.includes("urgency")) return "high";
  if (flags.length > 0) return "medium";
  return "low";
}

/** Instant, deterministic scan of the transcript for known scam tactics. */
export function runRules(transcript: string): RuleResult {
  const matches: RuleMatch[] = [];
  for (const [flag, patterns] of Object.entries(PATTERNS) as [FlagId, RegExp[]][]) {
    for (const pattern of patterns) {
      for (const match of transcript.matchAll(pattern)) {
        const before = transcript.slice(Math.max(0, match.index - 80), match.index);
        if (NEGATED_REQUEST.test(before)) continue;
        matches.push({ flag, text: match[0], index: match.index });
      }
    }
  }
  matches.sort((a, b) => a.index - b.index);
  const flags = [...new Set(matches.map((m) => m.flag))];
  return { risk: riskFromFlags(flags), flags, matches };
}
