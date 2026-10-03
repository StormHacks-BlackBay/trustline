import { describe, expect, it } from "vitest";
import { FLAG_IDS, LANGUAGES } from "../types";
import { REASONS } from "./reasons";

describe("REASONS", () => {
  it.each(LANGUAGES.map((l) => l.code))("has non-empty text for every flag in %s", (code) => {
    for (const key of [...FLAG_IDS, "none"] as const) {
      expect(REASONS[code][key].trim().length).toBeGreaterThan(0);
    }
  });
});
