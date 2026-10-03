import { describe, expect, it } from "vitest";
import { formatPhone, trustLineVCard } from "./callServer";

describe("formatPhone", () => {
  it("formats North American numbers", () => {
    expect(formatPhone("+16045550123")).toBe("+1 604-555-0123");
  });

  it("leaves other numbers alone", () => {
    expect(formatPhone("+442071234567")).toBe("+442071234567");
  });
});

describe("trustLineVCard", () => {
  it("builds a contact named TrustLine", () => {
    const card = trustLineVCard("+16045550123");
    expect(card).toContain("FN:TrustLine");
    expect(card).toContain("TEL;TYPE=CELL:+16045550123");
  });
});
