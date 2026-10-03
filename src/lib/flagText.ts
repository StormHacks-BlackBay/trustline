import type { FlagId } from "./types";

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

export const FLAG_REASONS_EN: Record<FlagId, string> = {
  gift_card_payment:
    "They asked for payment in gift cards. Government agencies and banks never accept gift cards.",
  crypto_payment:
    "They asked for payment in cryptocurrency. Government agencies and banks never ask for this.",
  one_time_code:
    "They asked for a verification code or PIN. Your bank will never ask you to read one out.",
  remote_access:
    "They asked to control your phone or computer. Real organizations do not ask for this on a call.",
  wire_transfer:
    "They asked you to move money. Real organizations never ask you to move money to protect it.",
  deportation_threat:
    "They threatened your immigration status. IRCC does not threaten deportation over the phone.",
  arrest_threat:
    "They threatened arrest. Police and government agencies do not take payment to cancel a warrant.",
  personal_info: "They asked for personal details. Check who is calling before you share anything.",
  secrecy:
    "They told you to keep this secret or stay on the line. You can always hang up and check.",
  urgency: "They are rushing you. Real organizations give you time to check.",
};

export function leadFlag(flags: FlagId[]): FlagId | null {
  return FLAG_PRIORITY.find((f) => flags.includes(f)) ?? null;
}
