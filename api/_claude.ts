import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { RiskAssessmentSchema, type RiskAssessment } from "../src/lib/schemas";
import type { LanguageCode } from "../src/lib/types";
import { SCORING_SYSTEM_PROMPT, scoringUserMessage } from "./_scoring-prompt";

export type ScoreOutcome =
  { ok: true; assessment: RiskAssessment } | { ok: false; error: string; status: number };

const MODEL = () => process.env.ANTHROPIC_MODEL ?? "claude-haiku-4-5";

export const scoringConfigured = () => Boolean(process.env.ANTHROPIC_API_KEY);

/** Scores a transcript window with Claude. Shared by the /api/score route and the call server. */
export async function scoreWithClaude(
  transcript: string,
  language: LanguageCode,
  signal?: AbortSignal,
): Promise<ScoreOutcome> {
  if (!scoringConfigured()) return { ok: false, error: "scoring_not_configured", status: 503 };

  const client = new Anthropic({ timeout: 8_000, maxRetries: 1 });
  try {
    const response = await client.messages.parse(
      {
        model: MODEL(),
        max_tokens: 1024,
        system: SCORING_SYSTEM_PROMPT,
        messages: [{ role: "user", content: scoringUserMessage(transcript, language) }],
        output_config: { format: zodOutputFormat(RiskAssessmentSchema) },
      },
      { signal },
    );
    if (response.stop_reason === "refusal" || !response.parsed_output) {
      return { ok: false, error: "scoring_unavailable", status: 502 };
    }
    return { ok: true, assessment: response.parsed_output };
  } catch (error) {
    if (error instanceof Anthropic.APIUserAbortError) {
      return { ok: false, error: "scoring_aborted", status: 499 };
    }
    if (error instanceof Anthropic.RateLimitError) {
      return { ok: false, error: "scoring_rate_limited", status: 429 };
    }
    if (error instanceof Anthropic.AuthenticationError) {
      console.error("Anthropic API key was rejected");
      return { ok: false, error: "scoring_not_configured", status: 503 };
    }
    if (error instanceof Anthropic.APIError) {
      console.error(`Anthropic API error ${error.status}`, error.message);
      return { ok: false, error: "scoring_failed", status: 502 };
    }
    console.error("Scoring failed", error);
    return { ok: false, error: "scoring_failed", status: 502 };
  }
}
