import { findOrganization, reportingEntry } from "../../lib/directory";
import { ruleReason } from "../../lib/flagText";
import type { Segment } from "../../lib/transcript";
import type { LanguageCode } from "../../lib/types";
import { RiskAnnouncer } from "./RiskAnnouncer";
import { TranscriptView } from "./TranscriptView";
import { VerifiedContact } from "./VerifiedContact";
import { WarningCard } from "./WarningCard";
import { useRiskEngine } from "./useRiskEngine";

interface CallAnalysisProps {
  segments: Segment[];
  partial: string;
  language: LanguageCode;
}

/** Everything that depends on one call. Mounted with key={callNumber} so it resets per call. */
export function CallAnalysis({ segments, partial, language }: CallAnalysisProps) {
  const { assessment, llmStatus, transcript } = useRiskEngine(segments, language);
  const organization = findOrganization(transcript, assessment.claimedOrg);
  const reason = assessment.explanation ?? ruleReason(assessment.flags, language);

  return (
    <>
      <RiskAnnouncer risk={assessment.risk} reason={reason} language={language} />
      {segments.length > 0 && (
        <WarningCard assessment={assessment} llmStatus={llmStatus} language={language} />
      )}
      {segments.length > 0 && (
        <VerifiedContact entry={organization} report={reportingEntry()} risk={assessment.risk} />
      )}
      <TranscriptView segments={segments} partial={partial} evidence={assessment.evidence} />
    </>
  );
}
