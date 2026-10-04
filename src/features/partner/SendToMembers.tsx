import { useState } from "react";
import { Alert } from "../../components/Alert";
import { Button } from "../../components/Button";
import { Sheet } from "../../components/Sheet";

interface SendToMembersProps {
  partnerName: string;
  text: string;
}

type Channel = "email" | "text";

const SENT: Record<Channel, string> = {
  email: "Emailed to your members.",
  text: "Texted to your members.",
};

/**
 * Lets a partner email or text an advisory to its members. Demo only: nothing is actually sent,
 * which the sheet says plainly.
 */
export function SendToMembers({ partnerName, text }: SendToMembersProps) {
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState<Channel | null>(null);

  const close = () => {
    setOpen(false);
    setSent(null);
  };

  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        Send to members
      </Button>
      <Sheet open={open} title="Send this alert to your members" onClose={close}>
        <p className="muted">
          {partnerName} members get this message by email or text. Demo: no messages are actually
          sent.
        </p>
        <pre className="copy-sheet__text" tabIndex={0}>
          {text}
        </pre>
        {sent && (
          <Alert key={sent} tone="success" takeFocus>
            {SENT[sent]} (Demo)
          </Alert>
        )}
        <div className="sheet__actions">
          <Button onClick={() => setSent("email")}>Email members</Button>
          <Button onClick={() => setSent("text")}>Text members</Button>
          <Button variant="secondary" onClick={close}>
            Close
          </Button>
        </div>
      </Sheet>
    </>
  );
}
