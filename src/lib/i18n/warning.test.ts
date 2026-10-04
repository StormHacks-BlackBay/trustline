import { describe, expect, it } from "vitest";
import { FLAG_IDS, LANGUAGES, RISK_LEVELS } from "../types";
import {
  FLAG_LABELS_BY_LANGUAGE,
  fill,
  RISK_LABELS,
  templateParts,
  WARNING_TEXT,
  type WarningKey,
} from "./warning";

const codes = LANGUAGES.map((l) => l.code);
const placeholders = (text: string) => [...text.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();

describe("WARNING_TEXT", () => {
  it.each(codes)("has every string in %s, with the same placeholders as English", (code) => {
    for (const key of Object.keys(WARNING_TEXT.en) as WarningKey[]) {
      const text = WARNING_TEXT[code][key];
      expect(text.trim().length, `${code}.${key}`).toBeGreaterThan(0);
      expect(placeholders(text), `${code}.${key}`).toEqual(placeholders(WARNING_TEXT.en[key]));
    }
  });
});

describe("labels", () => {
  it.each(codes)("has a label for every flag and risk level in %s", (code) => {
    for (const flag of FLAG_IDS) expect(FLAG_LABELS_BY_LANGUAGE[code][flag].trim()).not.toBe("");
    for (const risk of RISK_LEVELS) expect(RISK_LABELS[code][risk].trim()).not.toBe("");
  });
});

describe("fill and templateParts", () => {
  it("fills placeholders and leaves unknown ones visible", () => {
    expect(fill("Share with {partner}", { partner: "Demo Credit Union" })).toBe(
      "Share with Demo Credit Union",
    );
    expect(fill("Call {org}", {})).toBe("Call {org}");
  });

  it("splits a sentence around its placeholders in any order", () => {
    expect(templateParts("挂断电话，拨打 {phone} 联系 {org}")).toEqual([
      { text: "挂断电话，拨打 ", placeholder: false },
      { text: "phone", placeholder: true },
      { text: " 联系 ", placeholder: false },
      { text: "org", placeholder: true },
    ]);
  });
});
