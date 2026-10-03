import { Card } from "../../components/Card";
import type { DirectoryEntry, RiskLevel } from "../../lib/types";
import "./VerifiedContact.css";

interface VerifiedContactProps {
  entry: DirectoryEntry | null;
  report: DirectoryEntry | null;
  risk: RiskLevel;
}

const telHref = (phone: string) => `tel:+1${phone.replace(/\D/g, "").replace(/^1/, "")}`;

function Channel({ entry }: { entry: DirectoryEntry }) {
  return (
    <div className="stack contact__channel">
      {entry.phone ? (
        <a className="contact__phone" href={telHref(entry.phone)}>
          Call {entry.phone}
        </a>
      ) : (
        <p className="contact__phone">
          {entry.category === "bank"
            ? "Call the number on the back of your card"
            : "Call your local police non-emergency line"}
        </p>
      )}
      <a href={entry.url} target="_blank" rel="noreferrer">
        Official website
      </a>
    </div>
  );
}

/** The trusted next step. Contact details come only from the directory, never from the caller. */
export function VerifiedContact({ entry, report, risk }: VerifiedContactProps) {
  if (risk === "low" && !entry) return null;

  const heading = risk === "low" ? "Want to double-check?" : "Hang up and contact them yourself";

  return (
    <Card className="stack contact" aria-labelledby="contact-heading">
      <h2 id="contact-heading">{heading}</h2>
      {entry ? (
        <>
          <p>
            The caller says they are from <strong>{entry.organization}</strong>. Use this official
            contact instead of any number the caller gives you.
          </p>
          <Channel entry={entry} />
          <p className="muted small">{entry.guidance}</p>
        </>
      ) : (
        <p>
          You can hang up at any time. Talk to someone you trust before you pay or share anything.
        </p>
      )}
      {risk !== "low" && report && (
        <p className="small">
          Report the call to the{" "}
          <a href={report.url} target="_blank" rel="noreferrer">
            {report.organization}
          </a>
          {report.phone ? ` (${report.phone})` : ""}.
        </p>
      )}
      <p className="muted small">Demo data: verify official contacts before real-world use.</p>
    </Card>
  );
}
