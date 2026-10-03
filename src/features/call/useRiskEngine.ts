import { useEffect, useMemo, useState } from "react";
import { ApiError } from "../../lib/api";
import { fuse } from "../../lib/fusion";
import { runRules } from "../../lib/rules";
import type { RiskAssessment } from "../../lib/schemas";
import { scoreTranscript } from "../../lib/scoring";
import { recentWindow, type Segment } from "../../lib/transcript";
import type { LanguageCode } from "../../lib/types";

export type LlmStatus = "idle" | "pending" | "ready" | "unavailable";

export interface LlmResult {
  assessment: RiskAssessment;
  /** Number of committed segments the assessment was computed from. */
  segmentCount: number;
  /** True when the scored window contained the whole call so far. */
  coversWholeCall: boolean;
  language: LanguageCode;
}

// Once the server says scoring is not configured, stop asking for the rest of the session.
let scoringConfigured = true;

/**
 * Runs the rules layer on every new transcript (it is cheap) and the LLM once per committed
 * segment. A newer segment cancels the in-flight LLM request, so a slow response can never
 * replace a fresher one. Mount it with a key per call so state resets between calls.
 */
export function useRiskEngine(segments: Segment[], language: LanguageCode) {
  const transcript = useMemo(() => segments.map((s) => s.text).join("\n"), [segments]);
  const rules = useMemo(() => runRules(transcript), [transcript]);

  const [llm, setLlm] = useState<LlmResult | null>(null);
  const [failedCount, setFailedCount] = useState<number | null>(null);

  useEffect(() => {
    if (segments.length === 0 || !scoringConfigured) return;
    const controller = new AbortController();
    const window = recentWindow(segments);
    const segmentCount = segments.length;
    const coversWholeCall = window.length >= transcript.length;

    scoreTranscript(window, language, controller.signal)
      .then((assessment) => setLlm({ assessment, segmentCount, coversWholeCall, language }))
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        if (error instanceof ApiError && error.status === 503) scoringConfigured = false;
        setFailedCount(segmentCount);
      });

    return () => controller.abort();
  }, [segments, transcript, language]);

  let llmStatus: LlmStatus = "idle";
  if (!scoringConfigured) llmStatus = "unavailable";
  else if (segments.length === 0) llmStatus = "idle";
  else if (llm?.segmentCount === segments.length && llm.language === language) llmStatus = "ready";
  else if (failedCount === segments.length) llmStatus = "unavailable";
  else llmStatus = "pending";

  // An explanation in another language is stale after the listener switches language.
  const usableLlm = llm && llm.language === language ? llm : null;
  const assessment = useMemo(
    () => fuse({ transcript, rules, llm: usableLlm }),
    [transcript, rules, usableLlm],
  );

  return { transcript, rules, llm, llmStatus, assessment };
}
