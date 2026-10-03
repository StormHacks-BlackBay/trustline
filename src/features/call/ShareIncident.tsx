import { useState } from "react";
import { Button } from "../../components/Button";
import { Sheet } from "../../components/Sheet";
import { PARTNERS } from "../../data/partners";
import { FLAG_LABELS } from "../../lib/flagText";
import type { Assessment } from "../../lib/fusion";
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
}

type ShareState = "idle" | "sending" | "sent" | "failed";

/** Consent first: the user sees exactly what will be sent before anything leaves the device. */
export function ShareIncident({
  user,
  language,
  segments,
  assessment,
  organizationName,
}: ShareIncidentProps) {
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
      <p className="share-done" role="status">
        Shared with {partner?.name}. Thank you, this helps warn others.
      </p>
    );
  }

  return (
    <>
      <Button variant="secondary" fullWidth onClick={() => setOpen(true)}>
        Share with {partner?.name}
      </Button>
      <Sheet open={open} title={`Share with ${partner?.name}?`} onClose={() => setOpen(false)}>
        <p>
          This helps {partner?.name} warn other people about this scam. Only the details below are
          sent. Names, phone numbers, emails and account numbers are removed.
        </p>
        <dl className="share-preview">
          <dt>Caller claimed to be</dt>
          <dd>{claimedOrg ?? "Not stated"}</dd>
          <dt>Warning signs</dt>
          <dd>{assessment.flags.map((f) => FLAG_LABELS[f]).join(", ") || "None"}</dd>
          <dt>What the caller said (redacted)</dt>
          <dd>
            <blockquote tabIndex={0} aria-label="Redacted excerpt">
              {excerpt}
            </blockquote>
          </dd>
        </dl>
        {state === "failed" && (
          <p role="alert" className="call-screen__error">
            Could not share right now. Check your connection and try again.
          </p>
        )}
        <div className="stack">
          <Button fullWidth onClick={() => void share()} disabled={state === "sending"}>
            {state === "sending" ? "Sharing…" : "Share"}
          </Button>
          <Button variant="secondary" fullWidth onClick={() => setOpen(false)}>
            Don't share
          </Button>
        </div>
      </Sheet>
    </>
  );
}
