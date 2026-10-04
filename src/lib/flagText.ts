import { REASONS } from "./i18n/reasons";
import { FLAG_LABELS_BY_LANGUAGE } from "./i18n/warning";
import { LANGUAGES, type FlagId, type LanguageCode } from "./types";

/** Most serious first: the first flag present is the one the warning leads with. */
export const FLAG_PRIORITY: FlagId[] = [
  "gift_card_payment",
  "crypto_payment",
  "one_time_code",
  "remote_access",
  "wire_transfer",
  "upfront_fee",
  "suspicious_link",
  "deportation_threat",
  "arrest_threat",
  "personal_info",
  "secrecy",
  "urgency",
];

/** English labels, used by the partner dashboard. */
export const FLAG_LABELS: Record<FlagId, string> = FLAG_LABELS_BY_LANGUAGE.en;

/** A warning sign's label in the listener's language. */
export function flagLabel(flag: FlagId, language: LanguageCode): string {
  return FLAG_LABELS_BY_LANGUAGE[language][flag];
}

export function leadFlag(flags: FlagId[]): FlagId | null {
  return FLAG_PRIORITY.find((f) => flags.includes(f)) ?? null;
}

/** The rules-only warning sentence for the most serious flag, in the given language. */
export function ruleReason(flags: FlagId[], language: LanguageCode): string {
  return REASONS[language][leadFlag(flags) ?? "none"];
}

export function textDirection(language: LanguageCode): "ltr" | "rtl" {
  return LANGUAGES.find((l) => l.code === language)?.dir ?? "ltr";
}
