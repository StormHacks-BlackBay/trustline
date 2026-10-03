import { useState } from "react";
import { DEMO_USERS } from "../../data/partners";
import { readStored, writeStored } from "../../lib/storage";
import { LANGUAGES, type DemoUser, type LanguageCode } from "../../lib/types";

const USER_KEY = "trustline.user";
const LANGUAGE_KEY = "trustline.language";

const isLanguage = (value: string | null): value is LanguageCode =>
  LANGUAGES.some((l) => l.code === value);

function initialUser(): DemoUser {
  const stored = readStored(USER_KEY);
  const fallback = DEMO_USERS[0];
  if (!fallback) throw new Error("DEMO_USERS must not be empty");
  return DEMO_USERS.find((u) => u.id === stored) ?? fallback;
}

/** The demo user on this phone and the language their warnings are shown in. */
export function useCaller() {
  const [user, setUserState] = useState(initialUser);
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    const stored = readStored(LANGUAGE_KEY);
    return isLanguage(stored) ? stored : user.language;
  });

  const setUser = (id: string) => {
    const next = DEMO_USERS.find((u) => u.id === id);
    if (!next) return;
    setUserState(next);
    setLanguageState(next.language);
    writeStored(USER_KEY, next.id);
    writeStored(LANGUAGE_KEY, next.language);
  };

  const setLanguage = (code: string) => {
    if (!isLanguage(code)) return;
    setLanguageState(code);
    writeStored(LANGUAGE_KEY, code);
  };

  return { user, language, setUser, setLanguage };
}
