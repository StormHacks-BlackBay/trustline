import { DIRECTORY } from "../data/directory";

// Scribe accepts at most 50 keyterms of up to 20 characters each.
const MAX_TERMS = 50;
const MAX_LENGTH = 20;

const SCAM_TERMS = [
  "gift card",
  "Google Play",
  "bitcoin",
  "bitcoin ATM",
  "crypto",
  "verification code",
  "deportation",
  "warrant",
  "Interac",
  "e-transfer",
  "social insurance",
  "AnyDesk",
];

/** Words that bias transcription toward organization names and scam vocabulary. */
export function scribeKeyterms(): string[] {
  const names = DIRECTORY.flatMap((d) => d.aliases);
  const terms = [...SCAM_TERMS, ...names].filter((t) => t.length > 1 && t.length <= MAX_LENGTH);
  return [...new Set(terms)].slice(0, MAX_TERMS);
}
