import { readError } from "./api";
import { RiskAssessmentSchema, type RiskAssessment, type ScoreSource } from "./schemas";
import type { LanguageCode } from "./types";

/**
 * Sends a call transcript window or a pasted message to the scoring route. Throws ApiError when
 * scoring is unavailable.
 */
export async function scoreTranscript(
  transcript: string,
  language: LanguageCode,
  signal: AbortSignal,
  source: ScoreSource = "call",
): Promise<RiskAssessment> {
  const response = await fetch("/api/score", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ transcript, language, source }),
    signal,
  });
  if (!response.ok) throw await readError(response);
  // Validate again on the client: the UI only ever renders a well-formed assessment.
  return RiskAssessmentSchema.parse(await response.json());
}
