import { describe, expect, it } from "vitest";
import { redact } from "./redact";

describe("redact", () => {
  it("removes phone numbers in common formats", () => {
    expect(redact("Call me at 604-555-0199 or (778) 555 0123 or +1 236 555 0100.")).toBe(
      "Call me at [phone] or [phone] or [phone].",
    );
  });

  it("removes emails", () => {
    expect(redact("Send it to agent.smith@example.com now")).toBe("Send it to [email] now");
  });

  it("removes card, account and SIN numbers", () => {
    expect(redact("Card 4520 1234 5678 9012 and SIN 123-456-789")).toBe(
      "Card [number] and SIN [number]",
    );
  });

  it("removes street addresses and postal codes", () => {
    expect(redact("I live at 1234 Kingsway Avenue, V5H 2A1")).toBe(
      "I live at [address], [postal code]",
    );
  });

  it("removes personal names after introductions and titles", () => {
    expect(redact("This is Officer David Miller from IRCC.")).toBe(
      "This is Officer [name] from IRCC.",
    );
    expect(redact("Am I speaking with Harpreet Singh?")).toBe("Am I speaking with [name]?");
    expect(redact("My name is Mei Chen.")).toBe("My name is [name].");
  });

  it("keeps organization names and scam wording", () => {
    const text =
      "Hello, this is Immigration, Refugees and Citizenship Canada. Pay with Google Play gift cards.";
    expect(redact(text)).toBe(text);
  });

  it("keeps short numbers such as amounts and card endings", () => {
    expect(redact("A purchase of 312 dollars on the card ending in 4821.")).toBe(
      "A purchase of 312 dollars on the card ending in 4821.",
    );
  });
});
