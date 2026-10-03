import { useEffect, type ReactNode } from "react";
import { Card } from "../../components/Card";
import { findOrganization, reportingEntry } from "../../lib/directory";
import { ruleReason } from "../../lib/flagText";
import { recordLatency } from "../../lib/metrics";
import type { Segment } from "../../lib/transcript";
import type { DemoUser, LanguageCode } from "../../lib/types";
import { CallerDetails } from "./CallerDetails";
import { RiskAnnouncer } from "./RiskAnnouncer";
import { ShareIncident } from "./ShareIncident";
import { TranscriptView } from "./TranscriptView";
import { WarningHero } from "./WarningHero";
import { useRiskEngine } from "./useRiskEngine";

interface CallAnalysisProps {
  segments: Segment[];
  partial: string;
  language: LanguageCode;
  user: DemoUser;
  /** Lets the screen place the warning and the caller details in different columns. */
  children: (parts: { main: ReactNode; side: ReactNode }) => ReactNode;
}

/** Everything that depends on one call. Mounted with key={callNumber} so it resets per call. */
export function CallAnalysis({ segments, partial, language, user, children }: CallAnalysisProps) {
  const { assessment, llmStatus, transcript } = useRiskEngine(segments, language);
  const organization = findOrganization(transcript, assessment.claimedOrg);
  const reason = assessment.explanation ?? ruleReason(assessment.flags, language);
  const started = segments.length > 0;

  // Time from a segment being committed to the rules-based warning being on screen.
  const lastCommittedAt = segments[segments.length - 1]?.committedAt;
  useEffect(() => {
    if (lastCommittedAt !== undefined) recordLatency("rules", performance.now() - lastCommittedAt);
  }, [lastCommittedAt]);

  const share =
    assessment.risk === "low" ? null : (
      <ShareIncident
        user={user}
        language={language}
        segments={segments}
        assessment={assessment}
        organizationName={organization?.organization ?? null}
      />
    );

  const main = (
    <>
      <RiskAnnouncer risk={assessment.risk} reason={reason} language={language} />
      {started && (
        <WarningHero
          assessment={assessment}
          llmStatus={llmStatus}
          language={language}
          organization={organization}
          share={share}
        />
      )}
      <Card className="stack stack--tight" aria-labelledby="transcript-heading">
        <h2 id="transcript-heading">What the caller said</h2>
        <TranscriptView segments={segments} partial={partial} evidence={assessment.evidence} />
      </Card>
    </>
  );

  const side = started ? (
    <CallerDetails entry={organization} report={reportingEntry()} risk={assessment.risk} />
  ) : null;

  return children({ main, side });
}
