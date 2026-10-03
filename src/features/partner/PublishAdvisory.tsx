import { useState } from "react";
import { Button } from "../../components/Button";
import { Sheet } from "../../components/Sheet";
import { ADVISORY_BODY_MAX, ADVISORY_TITLE_MAX, draftAdvisory } from "../../lib/advisory";
import { store } from "../../lib/store";
import type { Incident, Partner } from "../../lib/types";

type PublishState = "idle" | "sending" | "sent" | "failed";

export function PublishAdvisory({
  incident,
  publisher,
}: {
  incident: Incident;
  publisher: Partner;
}) {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<PublishState>("idle");
  const [draft, setDraft] = useState(() => draftAdvisory(incident));

  const publish = async () => {
    setState("sending");
    try {
      await store.publishAdvisory({
        publisherId: publisher.id,
        title: draft.title.trim(),
        body: draft.body.trim(),
        claimedOrg: incident.claimedOrg,
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
        Advisory published to users of every TrustLine partner.
      </p>
    );
  }

  return (
    <>
      <Button fullWidth onClick={() => setOpen(true)}>
        Publish advisory
      </Button>
      <Sheet open={open} title="Publish a community advisory" onClose={() => setOpen(false)}>
        <p className="muted small">
          Advisories reach users of every TrustLine partner, including banks and credit unions.
        </p>
        <label className="field">
          <span className="field__label">Title</span>
          <input
            value={draft.title}
            maxLength={ADVISORY_TITLE_MAX}
            onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
          />
        </label>
        <label className="field">
          <span className="field__label">Message</span>
          <textarea
            rows={6}
            value={draft.body}
            maxLength={ADVISORY_BODY_MAX}
            onChange={(e) => setDraft((d) => ({ ...d, body: e.target.value }))}
          />
        </label>
        {state === "failed" && (
          <p role="alert" className="call-screen__error">
            Could not publish right now. Try again.
          </p>
        )}
        <div className="stack">
          <Button
            fullWidth
            onClick={() => void publish()}
            disabled={state === "sending" || !draft.title.trim() || !draft.body.trim()}
          >
            {state === "sending" ? "Publishing…" : "Publish to all partners"}
          </Button>
          <Button variant="secondary" fullWidth onClick={() => setOpen(false)}>
            Cancel
          </Button>
        </div>
      </Sheet>
    </>
  );
}
