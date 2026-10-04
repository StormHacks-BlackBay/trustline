import type { ReactNode } from "react";
import { ButtonLink } from "../../components/ButtonLink";
import { ChipList } from "../../components/Chip";
import { RiskBadge } from "../../components/RiskBadge";
import { FLAG_LABELS, ruleReason, textDirection } from "../../lib/flagText";
import type { Assessment } from "../../lib/fusion";
import type { ScoreSource } from "../../lib/schemas";
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
  /** Whether this is a live call or a pasted message; changes the wording, not the logic. */
  context?: ScoreSource;
}

const telHref = (phone: string) => `tel:+1${phone.replace(/\D/g, "").replace(/^1/, "")}`;

function contextNote(status: LlmStatus, context: ScoreSource): string | null {
  if (status === "pending")
    return context === "message" ? "Checking the message…" : "Checking the rest of the call…";
  if (status === "unavailable") return "Basic mode: warnings come from on-device rules only.";
  return null;
}

/** The one safe next step. Contact details come only from the verified directory. */
function PrimaryAction({
  organization,
  context,
}: {
  organization: DirectoryEntry | null;
  context: ScoreSource;
}) {
  if (context === "message") {
    if (organization?.phone) {
      return (
        <ButtonLink href={telHref(organization.phone)}>
          <span>
            Don't reply. Call {organization.shortName} at{" "}
            <span className="nowrap">{organization.phone}</span>
          </span>
        </ButtonLink>
      );
    }
    if (organization?.category === "bank") {
      return (
        <p className="warning__step">
          Don't reply or tap any links. Call the number on the back of your card.
        </p>
      );
    }
    return <p className="warning__step">Don't reply or tap any links in this message.</p>;
  }
  if (organization?.phone) {
    return (
      <ButtonLink href={telHref(organization.phone)}>
        {/* One text run, so the button's flex gap cannot split the sentence from the number. */}
        <span>
          Hang up and call {organization.shortName} at{" "}
          <span className="nowrap">{organization.phone}</span>
        </span>
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
  context = "call",
}: WarningHeroProps) {
  const note = contextNote(llmStatus, context);
  const heading = context === "message" ? "Message check" : "Call check";

  if (assessment.risk === "low") {
    return (
      <section className="warning warning--low" aria-labelledby="warning-heading">
        <h2 id="warning-heading" className="visually-hidden">
          {heading}
        </h2>
        <RiskBadge risk="low" />
        <p className="muted small">
          {note ??
            (context === "message"
              ? "Nothing in this message matches a known scam tactic. If you are unsure, contact the organization through its official website."
              : "TrustLine keeps checking as the call goes on.")}
        </p>
      </section>
    );
  }

  const reason = assessment.explanation ?? ruleReason(assessment.flags, language);
  const english = assessment.explanationEnglish ?? ruleReason(assessment.flags, "en");

  return (
    <section className={`warning warning--${assessment.risk}`} aria-labelledby="warning-heading">
      <h2 id="warning-heading" className="visually-hidden">
        {heading}
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
        <PrimaryAction organization={organization} context={context} />
        {share}
      </div>
      {note && <p className="warning__note">{note}</p>}
    </section>
  );
}
