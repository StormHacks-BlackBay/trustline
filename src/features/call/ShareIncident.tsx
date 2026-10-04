import { useState } from "react";
import { Alert } from "../../components/Alert";
import { Button } from "../../components/Button";
import { Sheet } from "../../components/Sheet";
import { PARTNERS } from "../../data/partners";
import { flagLabel, textDirection } from "../../lib/flagText";
import type { Assessment } from "../../lib/fusion";
import { fill, warningText } from "../../lib/i18n/warning";
import type { ScoreSource } from "../../lib/schemas";
import { redact } from "../../lib/redact";
import { store } from "../../lib/store";
import { recentWindow, type Segment } from "../../lib/transcript";
import type { DemoUser, LanguageCode } from "../../lib/types";

interface ShareIncidentProps {
  user: DemoUser;
  language: LanguageCode;
  segments: Segment[];
  assessment: Assessment;
  organizationName: string | null;
  context?: ScoreSource;
}

type ShareState = "idle" | "sending" | "sent" | "failed";

/** Consent first: the user sees exactly what will be sent before anything leaves the device. */
export function ShareIncident({
  user,
  language,
  segments,
  assessment,
  organizationName,
  context = "call",
}: ShareIncidentProps) {
  const t = warningText(language);
  const dir = textDirection(language);
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<ShareState>("idle");
  const partner = PARTNERS.find((p) => p.id === user.partnerId);
  const excerpt = redact(recentWindow(segments, 1500));
  const claimedOrg = organizationName ?? assessment.claimedOrg;
  const partnerName = partner?.name ?? "";

  const share = async () => {
    setState("sending");
    try {
      await store.shareIncident({
        partnerId: user.partnerId,
        risk: assessment.risk,
        flags: assessment.flags,
        claimedOrg,
        redactedExcerpt: excerpt,
        language,
      });
      setState("sent");
      setOpen(false);
    } catch {
      setState("failed");
    }
  };

  if (state === "sent") {
    return (
      <div lang={language} dir={dir}>
        <Alert tone="success" takeFocus>
          {fill(t.shared, { partner: partnerName })}
        </Alert>
      </div>
    );
  }

  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)} lang={language} dir={dir}>
        {fill(t.shareButton, { partner: partnerName })}
      </Button>
      <Sheet
        open={open}
        title={fill(t.shareTitle, { partner: partnerName })}
        onClose={() => setOpen(false)}
        lang={language}
        dir={dir}
      >
        <p>{fill(t.shareBody, { partner: partnerName })}</p>
        <dl className="share-preview">
          <dt>{context === "message" ? t.senderClaimed : t.callerClaimed}</dt>
          <dd>{claimedOrg ?? t.notStated}</dd>
          <dt>{t.warningSigns}</dt>
          <dd>{assessment.flags.map((f) => flagLabel(f, language)).join(", ") || t.none}</dd>
          <dt>{context === "message" ? t.messageRedacted : t.callerSaid}</dt>
          <dd>
            {/* The caller's or sender's own words, as they will be shared: not translated. */}
            <blockquote tabIndex={0} aria-label={t.excerptLabel} lang="en" dir="ltr">
              {excerpt}
            </blockquote>
          </dd>
        </dl>
        {state === "failed" && <Alert tone="error">{t.shareFailed}</Alert>}
        <div className="sheet__actions">
          <Button onClick={() => void share()} disabled={state === "sending"}>
            {state === "sending" ? t.sharing : t.share}
          </Button>
          <Button variant="secondary" onClick={() => setOpen(false)}>
            {t.dontShare}
          </Button>
        </div>
      </Sheet>
    </>
  );
}
