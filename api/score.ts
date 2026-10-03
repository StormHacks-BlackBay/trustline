import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { RiskAssessmentSchema, ScoreRequestSchema } from "../src/lib/schemas";
import { errorResponse, json } from "./_http";
import { SCORING_SYSTEM_PROMPT, scoringUserMessage } from "./_scoring-prompt";

const MODEL = process.env.ANTHROPIC_MODEL ?? "claude-haiku-4-5";

/** Scores a window of call transcript with Claude and returns a validated RiskAssessment. */
export async function POST(request: Request): Promise<Response> {
  if (!process.env.ANTHROPIC_API_KEY) return errorResponse("scoring_not_configured", 503);

  const parsed = ScoreRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return errorResponse("invalid_request", 400);
  const { transcript, language } = parsed.data;

  const client = new Anthropic({ timeout: 8_000, maxRetries: 1 });

  try {
    const response = await client.messages.parse({
      model: MODEL,
      max_tokens: 1024,
      system: SCORING_SYSTEM_PROMPT,
      messages: [{ role: "user", content: scoringUserMessage(transcript, language) }],
      output_config: { format: zodOutputFormat(RiskAssessmentSchema) },
    });

    if (response.stop_reason === "refusal" || !response.parsed_output) {
      return errorResponse("scoring_unavailable", 502);
    }
    return json(response.parsed_output);
  } catch (error) {
    if (error instanceof Anthropic.RateLimitError)
      return errorResponse("scoring_rate_limited", 429);
    if (error instanceof Anthropic.AuthenticationError) {
      console.error("Anthropic API key was rejected");
      return errorResponse("scoring_not_configured", 503);
    }
    if (error instanceof Anthropic.APIError) {
      console.error(`Anthropic API error ${error.status}`, error.message);
      return errorResponse("scoring_failed", 502);
    }
    console.error("Scoring failed", error);
    return errorResponse("scoring_failed", 502);
  }
}
