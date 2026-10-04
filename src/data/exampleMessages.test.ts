import { describe, expect, it } from "vitest";
import { runRules } from "../lib/rules";
import { EXAMPLE_MESSAGES } from "./exampleMessages";

const example = (id: string) => {
  const found = EXAMPLE_MESSAGES.find((m) => m.id === id);
  if (!found) throw new Error(`missing example ${id}`);
  return found.text;
};

describe("example messages", () => {
  // In basic mode (no Gemini) the rules alone must still warn on the scam examples.
  it.each(["cra-refund", "delivery-fee", "new-number"])("rules warn on %s", (id) => {
    expect(runRules(example(id)).risk).not.toBe("low");
  });

  it("keeps the appointment reminder low risk", () => {
    expect(runRules(example("appointment")).flags).toEqual([]);
  });
});
