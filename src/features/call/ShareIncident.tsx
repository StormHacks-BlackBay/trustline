import { useState } from "react";
import { Alert } from "../../components/Alert";
import { Button } from "../../components/Button";
import { Sheet } from "../../components/Sheet";
import { PARTNERS } from "../../data/partners";
import { FLAG_LABELS } from "../../lib/flagText";
import type { Assessment } from "../../lib/fusion";
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
  const party = context === "message" ? "Sender" : "Caller";
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<ShareState>("idle");
  const partner = PARTNERS.find((p) => p.id === user.partnerId);
  const excerpt = redact(recentWindow(segments, 1500));
  const claimedOrg = organizationName ?? assessment.claimedOrg;

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
      <Alert tone="success" takeFocus>
        Shared with {partner?.name}. Thank you, this helps warn others.
      </Alert>
    );
  }

  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        Share with {partner?.name}
      </Button>
      <Sheet open={open} title={`Share with ${partner?.name}?`} onClose={() => setOpen(false)}>
        <p>
          This helps {partner?.name} warn other people about this scam. Only the details below are
          sent. Names, phone numbers, emails and account numbers are removed.
        </p>
        <dl className="share-preview">
          <dt>{party} claimed to be</dt>
          <dd>{claimedOrg ?? "Not stated"}</dd>
          <dt>Warning signs</dt>
          <dd>{assessment.flags.map((f) => FLAG_LABELS[f]).join(", ") || "None"}</dd>
          <dt>
            {context === "message" ? "The message (redacted)" : "What the caller said (redacted)"}
          </dt>
          <dd>
            <blockquote tabIndex={0} aria-label="Redacted excerpt">
              {excerpt}
            </blockquote>
          </dd>
        </dl>
        {state === "failed" && (
          <Alert tone="error">
            Could not share right now. Check your connection and try again.
          </Alert>
        )}
        <div className="sheet__actions">
          <Button onClick={() => void share()} disabled={state === "sending"}>
            {state === "sending" ? "Sharing…" : "Share"}
          </Button>
          <Button variant="secondary" onClick={() => setOpen(false)}>
            Don't share
          </Button>
        </div>
      </Sheet>
    </>
  );
}
