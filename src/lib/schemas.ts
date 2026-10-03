import { z } from "zod";
import { FLAG_IDS, LANGUAGES, RISK_LEVELS } from "./types";

const languageCodes = LANGUAGES.map((l) => l.code) as [
  (typeof LANGUAGES)[number]["code"],
  ...(typeof LANGUAGES)[number]["code"][],
];

export const LanguageCodeSchema = z.enum(languageCodes);

export const ScoreRequestSchema = z.object({
  transcript: z.string().min(1).max(6000),
  language: LanguageCodeSchema,
});
export type ScoreRequest = z.infer<typeof ScoreRequestSchema>;

/** Shape the LLM must return. Also validated again on the client before it reaches the UI. */
export const RiskAssessmentSchema = z.object({
  risk: z.enum(RISK_LEVELS),
  flags: z.array(z.enum(FLAG_IDS)),
  claimedOrg: z.string().nullable(),
  evidenceQuotes: z.array(z.string()),
  explanation: z.string(),
  explanationEnglish: z.string(),
});
export type RiskAssessment = z.infer<typeof RiskAssessmentSchema>;

export const ScribeTokenResponseSchema = z.object({ token: z.string().min(1) });

export const ApiErrorSchema = z.object({ error: z.string() });
