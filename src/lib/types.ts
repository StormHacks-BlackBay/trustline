export const LANGUAGES = [
  { code: "en", label: "English", nativeLabel: "English", dir: "ltr" },
  { code: "pa", label: "Punjabi", nativeLabel: "ਪੰਜਾਬੀ", dir: "ltr" },
  { code: "zh", label: "Mandarin", nativeLabel: "中文", dir: "ltr" },
  { code: "tl", label: "Tagalog", nativeLabel: "Tagalog", dir: "ltr" },
  { code: "fa", label: "Farsi", nativeLabel: "فارسی", dir: "rtl" },
] as const;

export type LanguageCode = (typeof LANGUAGES)[number]["code"];

export const RISK_LEVELS = ["low", "medium", "high"] as const;
export type RiskLevel = (typeof RISK_LEVELS)[number];

export const FLAG_IDS = [
  "gift_card_payment",
  "crypto_payment",
  "wire_transfer",
  "one_time_code",
  "personal_info",
  "remote_access",
  "secrecy",
  "urgency",
  "arrest_threat",
  "deportation_threat",
] as const;
export type FlagId = (typeof FLAG_IDS)[number];

export type PartnerKind = "community" | "financial";

export interface Partner {
  id: string;
  name: string;
  kind: PartnerKind;
}

export interface DemoUser {
  id: string;
  name: string;
  partnerId: string;
  language: LanguageCode;
}

export type DirectoryCategory = "government" | "bank" | "reporting";

export interface DirectoryEntry {
  id: string;
  organization: string;
  /** How the organization is said aloud, e.g. "IRCC". */
  shortName: string;
  aliases: string[];
  category: DirectoryCategory;
  /** Null for banks: the trusted number is the one printed on the user's own card. */
  phone: string | null;
  url: string;
  guidance: string;
}

export interface Incident {
  id: string;
  partnerId: string;
  risk: RiskLevel;
  flags: FlagId[];
  claimedOrg: string | null;
  redactedExcerpt: string;
  language: LanguageCode;
  createdAt: string;
}

export interface Advisory {
  id: string;
  publisherId: string;
  title: string;
  body: string;
  claimedOrg: string | null;
  createdAt: string;
}
