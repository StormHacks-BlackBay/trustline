import { ruleReason } from "../../lib/flagText";
import type { Segment } from "../../lib/transcript";
import type { LanguageCode } from "../../lib/types";
import { RiskAnnouncer } from "./RiskAnnouncer";
import { TranscriptView } from "./TranscriptView";
import { WarningCard } from "./WarningCard";
import { useRiskEngine } from "./useRiskEngine";

interface CallAnalysisProps {
  segments: Segment[];
  partial: string;
  language: LanguageCode;
}

/** Everything that depends on one call. Mounted with key={callNumber} so it resets per call. */
export function CallAnalysis({ segments, partial, language }: CallAnalysisProps) {
  const { assessment, llmStatus } = useRiskEngine(segments, language);
  const reason = assessment.explanation ?? ruleReason(assessment.flags, language);

  return (
    <>
      <RiskAnnouncer risk={assessment.risk} reason={reason} language={language} />
      {segments.length > 0 && (
        <WarningCard assessment={assessment} llmStatus={llmStatus} language={language} />
      )}
      <TranscriptView segments={segments} partial={partial} evidence={assessment.evidence} />
    </>
  );
}
