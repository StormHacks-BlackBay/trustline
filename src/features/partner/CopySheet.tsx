import { useState, type ReactNode } from "react";
import { Alert } from "../../components/Alert";
import { Button } from "../../components/Button";
import { Sheet } from "../../components/Sheet";

interface CopySheetProps {
  /** Label of the button that opens the sheet. */
  label: string;
  title: string;
  intro: ReactNode;
  text: string;
  /** Extra actions, such as a link to the place the text is pasted. */
  actions?: ReactNode;
  variant?: "primary" | "secondary";
}

type CopyState = "idle" | "copied" | "failed";

/** Shows text a partner sends through its own channels, with a one-tap copy. Nothing is sent. */
export function CopySheet({
  label,
  title,
  intro,
  text,
  actions,
  variant = "secondary",
}: CopySheetProps) {
  const [open, setOpen] = useState(false);
  const [copy, setCopy] = useState<CopyState>("idle");

  const copyText = () => {
    navigator.clipboard
      .writeText(text)
      .then(() => setCopy("copied"))
      .catch(() => setCopy("failed"));
  };

  const close = () => {
    setOpen(false);
    setCopy("idle");
  };

  return (
    <>
      <Button variant={variant} onClick={() => setOpen(true)}>
        {label}
      </Button>
      <Sheet open={open} title={title} onClose={close}>
        <div className="muted">{intro}</div>
        <pre className="copy-sheet__text" tabIndex={0}>
          {text}
        </pre>
        {copy === "copied" && <Alert tone="success">Copied.</Alert>}
        {copy === "failed" && (
          <Alert tone="error">Could not copy. Select the text above and copy it instead.</Alert>
        )}
        <div className="sheet__actions">
          <Button onClick={copyText}>Copy text</Button>
          {actions}
          <Button variant="secondary" onClick={close}>
            Close
          </Button>
        </div>
      </Sheet>
    </>
  );
}
