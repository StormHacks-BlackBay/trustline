import { DEMO_USERS } from "../src/data/partners";
import type { LanguageCode } from "../src/lib/types";

/** The warning language each user last chose in the app. */
export class LanguagePreferences {
  private languages = new Map<string, LanguageCode>();

  set(userId: string, language: LanguageCode): void {
    this.languages.set(userId, language);
  }

  get(userId: string): LanguageCode {
    return this.languages.get(userId) ?? DEMO_USERS.find((u) => u.id === userId)?.language ?? "en";
  }
}
