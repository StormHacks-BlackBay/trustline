import { FLAG_REASONS_EN, leadFlag } from "../../lib/flagText";
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
  const lead = leadFlag(assessment.flags);
  const reason = assessment.explanationEnglish ?? (lead ? FLAG_REASONS_EN[lead] : "");

  return (
    <>
      <RiskAnnouncer risk={assessment.risk} reason={reason} />
      {segments.length > 0 && <WarningCard assessment={assessment} llmStatus={llmStatus} />}
      <TranscriptView segments={segments} partial={partial} evidence={assessment.evidence} />
    </>
  );
}
