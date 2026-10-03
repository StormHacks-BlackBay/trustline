import { ScoreRequestSchema } from "../src/lib/schemas";
import { scoreTranscript } from "./_gemini";
import { errorResponse, json } from "./_http";

/** Scores a window of call transcript with Gemini and returns a validated RiskAssessment. */
export async function POST(request: Request): Promise<Response> {
  const parsed = ScoreRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return errorResponse("invalid_request", 400);

  const outcome = await scoreTranscript(parsed.data.transcript, parsed.data.language);
  return outcome.ok ? json(outcome.assessment) : errorResponse(outcome.error, outcome.status);
}
