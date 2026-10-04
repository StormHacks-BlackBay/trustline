import { RiskAssessmentSchema, type RiskAssessment } from "../src/lib/schemas.js";
import { FLAG_IDS, RISK_LEVELS, type LanguageCode } from "../src/lib/types.js";
import type { ScoreSource } from "../src/lib/schemas.js";
import { scoringSystemPrompt, scoringUserMessage } from "./_scoring-prompt.js";

export type ScoreOutcome =
  | { ok: true; assessment: RiskAssessment }
  | { ok: false; error: string; status: number };

const API_BASE = "https://generativelanguage.googleapis.com/v1beta";
const TIMEOUT_MS = 8_000;

/** Flash-Lite is on the Gemini API free tier and thinks minimally by default, so it stays fast. */
const MODEL = () => process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";

export const scoringConfigured = () => Boolean(process.env.GEMINI_API_KEY);

/**
 * Gemini's responseSchema (an OpenAPI subset) mirroring RiskAssessmentSchema.
 * Gemini constrains the output to this shape; Zod still validates the result.
 */
const RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    risk: { type: "STRING", enum: [...RISK_LEVELS] },
    flags: { type: "ARRAY", items: { type: "STRING", enum: [...FLAG_IDS] } },
    claimedOrg: { type: "STRING", nullable: true },
    evidenceQuotes: { type: "ARRAY", items: { type: "STRING" } },
    explanation: { type: "STRING" },
    explanationEnglish: { type: "STRING" },
  },
  required: ["risk", "flags", "claimedOrg", "evidenceQuotes", "explanation", "explanationEnglish"],
  propertyOrdering: [
    "risk",
    "flags",
    "claimedOrg",
    "evidenceQuotes",
    "explanation",
    "explanationEnglish",
  ],
} as const;

interface GenerateContentResponse {
  candidates?: { content?: { parts?: { text?: string }[] }; finishReason?: string }[];
  promptFeedback?: { blockReason?: string };
}

/**
 * Scores a call transcript window or a pasted message with Gemini. Shared by the /api/score route
 * and the call server.
 */
export async function scoreTranscript(
  transcript: string,
  language: LanguageCode,
  signal?: AbortSignal,
  source: ScoreSource = "call",
): Promise<ScoreOutcome> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return { ok: false, error: "scoring_not_configured", status: 503 };

  const timeout = AbortSignal.timeout(TIMEOUT_MS);
  const combined = signal ? AbortSignal.any([signal, timeout]) : timeout;

  let response: Response;
  try {
    response = await fetch(`${API_BASE}/models/${encodeURIComponent(MODEL())}:generateContent`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: scoringSystemPrompt(source) }] },
        contents: [
          { role: "user", parts: [{ text: scoringUserMessage(transcript, language, source) }] },
        ],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: RESPONSE_SCHEMA,
          maxOutputTokens: 1024,
          temperature: 0,
        },
      }),
      signal: combined,
    });
  } catch (error) {
    if (signal?.aborted) return { ok: false, error: "scoring_aborted", status: 499 };
    if (timeout.aborted) {
      console.error(`Gemini request timed out after ${TIMEOUT_MS} ms; using the rules layer`);
      return { ok: false, error: "scoring_failed", status: 504 };
    }
    console.error("Scoring failed", error);
    return { ok: false, error: "scoring_failed", status: 502 };
  }

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    if (response.status === 429) {
      return { ok: false, error: "scoring_rate_limited", status: 429 };
    }
    if (
      response.status === 401 ||
      response.status === 403 ||
      (response.status === 400 && detail.includes("API_KEY_INVALID"))
    ) {
      console.error("Gemini API key was rejected");
      return { ok: false, error: "scoring_not_configured", status: 503 };
    }
    console.error(`Gemini API error ${response.status}`, detail.slice(0, 500));
    return { ok: false, error: "scoring_failed", status: 502 };
  }

  try {
    const body = (await response.json()) as GenerateContentResponse;
    const candidate = body.candidates?.[0];
    const text = candidate?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";
    if (body.promptFeedback?.blockReason || !text) {
      return { ok: false, error: "scoring_unavailable", status: 502 };
    }
    const parsed = RiskAssessmentSchema.safeParse(JSON.parse(text));
    if (!parsed.success) {
      console.error("Gemini returned an invalid assessment", parsed.error.message);
      return { ok: false, error: "scoring_unavailable", status: 502 };
    }
    return { ok: true, assessment: parsed.data };
  } catch (error) {
    if (signal?.aborted) return { ok: false, error: "scoring_aborted", status: 499 };
    console.error("Could not read the Gemini response", error);
    return { ok: false, error: "scoring_unavailable", status: 502 };
  }
}
