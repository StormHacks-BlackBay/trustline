import { Fragment, type ReactNode } from "react";
import { ButtonLink } from "../../components/ButtonLink";
import { ChipList } from "../../components/Chip";
import { Link } from "../../components/Link";
import { RiskBadge } from "../../components/RiskBadge";
import { recoveryPath, situationsForFlags } from "../../data/recovery";
import { flagLabel, ruleReason, textDirection } from "../../lib/flagText";
import type { Assessment } from "../../lib/fusion";
import { templateParts, warningText } from "../../lib/i18n/warning";
import type { ScoreSource } from "../../lib/schemas";
import type { DirectoryEntry, LanguageCode } from "../../lib/types";
import type { LlmStatus } from "./useRiskEngine";
import "./WarningHero.css";

type WarningStrings = ReturnType<typeof warningText>;

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

function contextNote(status: LlmStatus, context: ScoreSource, t: WarningStrings): string | null {
  if (status === "pending") return context === "message" ? t.checkingMessage : t.checkingCall;
  if (status === "unavailable") return t.basicMode;
  return null;
}

/**
 * A translated sentence with the organization's name and phone number filled in. The number is
 * kept on one line and left to right, so it reads correctly in Farsi too.
 */
function CallSentence({ template, entry }: { template: string; entry: DirectoryEntry }) {
  return (
    // One text run, so the button's flex gap cannot split the sentence from the number.
    <span>
      {templateParts(template).map((part, i) => {
        if (!part.placeholder) return <Fragment key={i}>{part.text}</Fragment>;
        if (part.text === "phone") {
          return (
            <span key={i} className="nowrap" dir="ltr">
              {entry.phone}
            </span>
          );
        }
        return <Fragment key={i}>{entry.shortName}</Fragment>;
      })}
    </span>
  );
}

/** The one safe next step. Contact details come only from the verified directory. */
function PrimaryAction({
  organization,
  context,
  t,
}: {
  organization: DirectoryEntry | null;
  context: ScoreSource;
  t: WarningStrings;
}) {
  const message = context === "message";
  if (organization?.phone) {
    return (
      <ButtonLink href={telHref(organization.phone)}>
        <CallSentence
          template={message ? t.messageOrganization : t.callOrganization}
          entry={organization}
        />
      </ButtonLink>
    );
  }
  if (organization?.category === "bank") {
    return <p className="warning__step">{message ? t.messageCardNumber : t.callCardNumber}</p>;
  }
  return <p className="warning__step">{message ? t.messageNoLinks : t.hangUpAnyTime}</p>;
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
  const t = warningText(language);
  const dir = textDirection(language);
  const note = contextNote(llmStatus, context, t);
  const heading = context === "message" ? t.messageCheck : t.callCheck;

  if (assessment.risk === "low") {
    return (
      <section
        className="warning warning--low"
        aria-labelledby="warning-heading"
        lang={language}
        dir={dir}
      >
        <h2 id="warning-heading" className="visually-hidden">
          {heading}
        </h2>
        <RiskBadge risk="low" language={language} />
        <p className="muted small">{note ?? (context === "message" ? t.lowMessage : t.lowCall)}</p>
      </section>
    );
  }

  const reason = assessment.explanation ?? ruleReason(assessment.flags, language);
  const english = assessment.explanationEnglish ?? ruleReason(assessment.flags, "en");

  return (
    <section
      className={`warning warning--${assessment.risk}`}
      aria-labelledby="warning-heading"
      lang={language}
      dir={dir}
    >
      <h2 id="warning-heading" className="visually-hidden">
        {heading}
      </h2>
      <RiskBadge risk={assessment.risk} language={language} />
      <p className="warning__reason">{reason}</p>
      {language !== "en" && (
        <p className="warning__english" lang="en" dir="ltr">
          English: {english}
        </p>
      )}
      <ChipList
        label={t.warningSigns}
        items={assessment.flags.map((f) => flagLabel(f, language))}
      />
      <div className="warning__actions">
        <PrimaryAction organization={organization} context={context} t={t} />
        {share}
      </div>
      {note && <p className="warning__note">{note}</p>}
      <p className="warning__recovery">
        <Link href={recoveryPath(situationsForFlags(assessment.flags))}>{t.recovery}</Link>
      </p>
    </section>
  );
}
