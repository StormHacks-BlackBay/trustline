import { REASONS } from "./i18n/reasons";
import { LANGUAGES, type FlagId, type LanguageCode } from "./types";

/** Most serious first: the first flag present is the one the warning leads with. */
export const FLAG_PRIORITY: FlagId[] = [
  "gift_card_payment",
  "crypto_payment",
  "one_time_code",
  "remote_access",
  "wire_transfer",
  "deportation_threat",
  "arrest_threat",
  "personal_info",
  "secrecy",
  "urgency",
];

export const FLAG_LABELS: Record<FlagId, string> = {
  gift_card_payment: "Gift card payment",
  crypto_payment: "Crypto payment",
  wire_transfer: "Money transfer",
  one_time_code: "Code or PIN request",
  personal_info: "Personal details",
  remote_access: "Device access",
  secrecy: "Secrecy",
  urgency: "Pressure to act now",
  arrest_threat: "Arrest threat",
  deportation_threat: "Immigration threat",
};

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
