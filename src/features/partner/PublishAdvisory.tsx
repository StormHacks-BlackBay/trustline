import { useState } from "react";
import { Alert } from "../../components/Alert";
import { Button } from "../../components/Button";
import { Field, Input, TextArea } from "../../components/Field";
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
    return <Alert tone="success">Advisory published to users of every TrustLine partner.</Alert>;
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>Publish advisory</Button>
      <Sheet open={open} title="Publish a community advisory" onClose={() => setOpen(false)}>
        <p className="muted">
          Advisories reach users of every TrustLine partner, including banks and credit unions.
        </p>
        <Field label="Title">
          {(props) => (
            <Input
              {...props}
              value={draft.title}
              maxLength={ADVISORY_TITLE_MAX}
              onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
            />
          )}
        </Field>
        <Field label="Message" hint={`Up to ${ADVISORY_BODY_MAX} characters.`}>
          {(props) => (
            <TextArea
              {...props}
              rows={6}
              value={draft.body}
              maxLength={ADVISORY_BODY_MAX}
              onChange={(e) => setDraft((d) => ({ ...d, body: e.target.value }))}
            />
          )}
        </Field>
        {state === "failed" && <Alert tone="error">Could not publish right now. Try again.</Alert>}
        <div className="sheet__actions">
          <Button
            onClick={() => void publish()}
            disabled={state === "sending" || !draft.title.trim() || !draft.body.trim()}
          >
            {state === "sending" ? "Publishing…" : "Publish to all partners"}
          </Button>
          <Button variant="secondary" onClick={() => setOpen(false)}>
            Cancel
          </Button>
        </div>
      </Sheet>
    </>
  );
}
