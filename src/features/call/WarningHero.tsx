import type { ReactNode } from "react";
import { ButtonLink } from "../../components/ButtonLink";
import { ChipList } from "../../components/Chip";
import { RiskBadge } from "../../components/RiskBadge";
import { FLAG_LABELS, ruleReason, textDirection } from "../../lib/flagText";
import type { Assessment } from "../../lib/fusion";
import type { DirectoryEntry, LanguageCode } from "../../lib/types";
import type { LlmStatus } from "./useRiskEngine";
import "./WarningHero.css";

interface WarningHeroProps {
  assessment: Assessment;
  llmStatus: LlmStatus;
  language: LanguageCode;
  organization: DirectoryEntry | null;
  /** The secondary action: sharing the call with the user's organization. */
  share: ReactNode;
}

const telHref = (phone: string) => `tel:+1${phone.replace(/\D/g, "").replace(/^1/, "")}`;

function contextNote(status: LlmStatus): string | null {
  if (status === "pending") return "Checking the rest of the call…";
  if (status === "unavailable") return "Basic mode: warnings come from on-device rules only.";
  return null;
}

/** The one safe next step. Contact details come only from the verified directory. */
function PrimaryAction({ organization }: { organization: DirectoryEntry | null }) {
  if (organization?.phone) {
    return (
      <ButtonLink href={telHref(organization.phone)}>
        Hang up and call {organization.shortName} at{" "}
        <span className="nowrap">{organization.phone}</span>
      </ButtonLink>
    );
  }
  if (organization?.category === "bank") {
    return <p className="warning__step">Hang up and call the number on the back of your card.</p>;
  }
  return <p className="warning__step">You can hang up at any time.</p>;
}

/**
 * The focal point of the call screen. Low risk is a quiet status line; medium and high risk take
 * over with the reason in the listener's language, the evidence, and one primary action.
 */
export function WarningHero({
  assessment,
  llmStatus,
  language,
  organization,
  share,
}: WarningHeroProps) {
  const note = contextNote(llmStatus);

  if (assessment.risk === "low") {
    return (
      <section className="warning warning--low" aria-labelledby="warning-heading">
        <h2 id="warning-heading" className="visually-hidden">
          Call check
        </h2>
        <RiskBadge risk="low" />
        <p className="muted small">{note ?? "TrustLine keeps checking as the call goes on."}</p>
      </section>
    );
  }

  const reason = assessment.explanation ?? ruleReason(assessment.flags, language);
  const english = assessment.explanationEnglish ?? ruleReason(assessment.flags, "en");

  return (
    <section className={`warning warning--${assessment.risk}`} aria-labelledby="warning-heading">
      <h2 id="warning-heading" className="visually-hidden">
        Call check
      </h2>
      <RiskBadge risk={assessment.risk} />
      <p className="warning__reason" lang={language} dir={textDirection(language)}>
        {reason}
      </p>
      {language !== "en" && (
        <p className="warning__english" lang="en">
          English: {english}
        </p>
      )}
      <ChipList label="Warning signs" items={assessment.flags.map((f) => FLAG_LABELS[f])} />
      <div className="warning__actions">
        <PrimaryAction organization={organization} />
        {share}
      </div>
      {note && <p className="warning__note">{note}</p>}
    </section>
  );
}
