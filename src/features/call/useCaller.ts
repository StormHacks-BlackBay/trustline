import { useState } from "react";
import { DEMO_USERS, PARTNERS } from "../../data/partners";
import { readStored, writeStored } from "../../lib/storage";
import { LANGUAGES, type LanguageCode } from "../../lib/types";

const LANGUAGE_KEY = "trustline.language";

const isLanguage = (value: string | null): value is LanguageCode =>
  LANGUAGES.some((l) => l.code === value);

/**
 * The demo user on this device and the language their warnings are shown in. The web app always
 * follows the first demo user, the call server's default, so there is no user to pick.
 */
export function useCaller() {
  const user = DEMO_USERS[0];
  if (!user) throw new Error("DEMO_USERS must not be empty");
  const partner = PARTNERS.find((p) => p.id === user.partnerId);
  if (!partner) throw new Error(`No partner ${user.partnerId}`);
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    const stored = readStored(LANGUAGE_KEY);
    return isLanguage(stored) ? stored : user.language;
  });

  const setLanguage = (code: string) => {
    if (!isLanguage(code)) return;
    setLanguageState(code);
    writeStored(LANGUAGE_KEY, code);
  };

  return { user, partner, language, setLanguage };
}
