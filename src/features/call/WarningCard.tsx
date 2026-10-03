import { Card } from "../../components/Card";
import { RiskBadge } from "../../components/RiskBadge";
import { FLAG_LABELS, ruleReason, textDirection } from "../../lib/flagText";
import type { Assessment } from "../../lib/fusion";
import type { LanguageCode } from "../../lib/types";
import type { LlmStatus } from "./useRiskEngine";
import "./WarningCard.css";

interface WarningCardProps {
  assessment: Assessment;
  llmStatus: LlmStatus;
  language: LanguageCode;
}

function contextNote(status: LlmStatus): string | null {
  if (status === "pending") return "Checking the rest of the call…";
  if (status === "unavailable") return "Basic mode: warnings come from on-device rules only.";
  return null;
}

export function WarningCard({ assessment, llmStatus, language }: WarningCardProps) {
  const reason = assessment.explanation ?? ruleReason(assessment.flags, language);
  const english = assessment.explanationEnglish ?? ruleReason(assessment.flags, "en");
  const note = contextNote(llmStatus);

  return (
    <Card className={`warning warning--${assessment.risk} stack`} aria-labelledby="warning-heading">
      <h2 id="warning-heading" className="visually-hidden">
        Call check
      </h2>
      <RiskBadge risk={assessment.risk} />
      <p className="warning__reason" lang={language} dir={textDirection(language)}>
        {reason}
      </p>
      {language !== "en" && (
        <p className="muted small" lang="en">
          English: {english}
        </p>
      )}
      {assessment.flags.length > 0 && (
        <ul className="warning__flags" aria-label="Warning signs">
          {assessment.flags.map((f) => (
            <li key={f}>{FLAG_LABELS[f]}</li>
          ))}
        </ul>
      )}
      {note && <p className="muted small">{note}</p>}
    </Card>
  );
}
