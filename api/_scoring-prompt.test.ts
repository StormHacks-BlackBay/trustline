// Prefixed with an underscore so Vercel does not deploy this test as a function.
import { describe, expect, it } from "vitest";
import { ScoreRequestSchema } from "../src/lib/schemas";
import { FLAG_IDS } from "../src/lib/types";
import {
  MESSAGE_SYSTEM_PROMPT,
  SCORING_SYSTEM_PROMPT,
  scoringSystemPrompt,
  scoringUserMessage,
} from "./_scoring-prompt";

describe("scoring prompts", () => {
  it("uses the call prompt by default and the message prompt for messages", () => {
    expect(scoringSystemPrompt()).toBe(SCORING_SYSTEM_PROMPT);
    expect(scoringSystemPrompt("call")).toBe(SCORING_SYSTEM_PROMPT);
    expect(scoringSystemPrompt("message")).toBe(MESSAGE_SYSTEM_PROMPT);
  });

  it.each([SCORING_SYSTEM_PROMPT, MESSAGE_SYSTEM_PROMPT])("lists every flag id", (prompt) => {
    for (const flag of FLAG_IDS) expect(prompt).toContain(`- ${flag}:`);
  });

  it("names the reader for messages and the listener for calls", () => {
    expect(scoringUserMessage("hi", "pa", "message")).toMatch(/^Reader's language: Punjabi/);
    expect(scoringUserMessage("hi", "en")).toMatch(/^Listener's language: English/);
  });
});

describe("ScoreRequestSchema", () => {
  it("defaults to scoring a call so existing clients keep working", () => {
    const parsed = ScoreRequestSchema.parse({ transcript: "hello", language: "en" });
    expect(parsed.source).toBe("call");
  });

  it("accepts messages and rejects unknown sources", () => {
    const base = { transcript: "hello", language: "en" };
    expect(ScoreRequestSchema.parse({ ...base, source: "message" }).source).toBe("message");
    expect(ScoreRequestSchema.safeParse({ ...base, source: "fax" }).success).toBe(false);
  });
});
