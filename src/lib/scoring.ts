import { readError } from "./api";
import { RiskAssessmentSchema, type RiskAssessment } from "./schemas";
import type { LanguageCode } from "./types";

/** Sends a transcript window to the scoring route. Throws ApiError when scoring is unavailable. */
export async function scoreTranscript(
  transcript: string,
  language: LanguageCode,
  signal: AbortSignal,
): Promise<RiskAssessment> {
  const response = await fetch("/api/score", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ transcript, language }),
    signal,
  });
  if (!response.ok) throw await readError(response);
  // Validate again on the client: the UI only ever renders a well-formed assessment.
  return RiskAssessmentSchema.parse(await response.json());
}
