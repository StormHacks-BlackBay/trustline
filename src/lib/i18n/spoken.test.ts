import { describe, expect, it } from "vitest";
import { DIRECTORY } from "../../data/directory";
import { LANGUAGES } from "../types";
import { SPOKEN, spokenWarning } from "./spoken";

const entry = (id: string) => DIRECTORY.find((d) => d.id === id) ?? null;

describe("spokenWarning", () => {
  it("gives the official number from the directory", () => {
    expect(spokenWarning("en", "They asked for gift cards.", entry("ircc"))).toBe(
      "TrustLine here. They asked for gift cards. You can hang up and call IRCC yourself at 1 888 242 2100.",
    );
  });

  it("sends bank callers to the number on the card", () => {
    expect(spokenWarning("en", "x", entry("rbc"))).toContain("number on the back of your card");
  });

  it("falls back to hanging up when there is no official number", () => {
    expect(spokenWarning("en", "x", entry("police"))).toMatch(/You can hang up now\.$/);
    expect(spokenWarning("en", "x", null)).toMatch(/You can hang up now\.$/);
  });

  it.each(LANGUAGES.map((l) => l.code))("fills both placeholders in %s", (code) => {
    expect(SPOKEN[code].callOrganization).toContain("{org}");
    expect(SPOKEN[code].callOrganization).toContain("{phone}");
    const text = spokenWarning(code, "x", entry("cra"));
    expect(text).not.toMatch(/[{}]/);
    expect(text).toContain("1 800 959 8281");
  });
});
