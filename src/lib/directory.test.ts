import { describe, expect, it } from "vitest";
import { DEMO_CALLS } from "../data/demoCalls";
import { findOrganization, reportingEntry } from "./directory";

const script = (id: string) => DEMO_CALLS.find((c) => c.id === id)?.lines.join("\n") ?? "";

describe("findOrganization", () => {
  it("finds IRCC from the scam script", () => {
    expect(findOrganization(script("ircc-scam"), null)?.id).toBe("ircc");
  });

  it("finds the specific credit union rather than a generic bank", () => {
    expect(findOrganization(script("bank-alert"), null)?.id).toBe("demo-credit-union");
  });

  it("falls back to the generic bank entry", () => {
    expect(findOrganization(script("bank-ambiguous"), null)?.id).toBe("your-bank");
  });

  it("prefers the LLM's claimed organization", () => {
    expect(findOrganization("they mentioned the bank", "Canada Revenue Agency")?.id).toBe("cra");
  });

  it("does not match aliases inside other words", () => {
    expect(findOrganization("The cradle arrived", null)).toBeNull();
  });

  it("never offers the reporting centre as the caller's organization", () => {
    expect(findOrganization("I am calling from the Canadian Anti-Fraud Centre", null)).toBeNull();
    expect(reportingEntry()?.id).toBe("cafc");
  });
});
