import { Card } from "../../components/Card";
import type { ScoreSource } from "../../lib/schemas";
import type { DirectoryEntry, RiskLevel } from "../../lib/types";

interface CallerDetailsProps {
  entry: DirectoryEntry | null;
  report: DirectoryEntry | null;
  risk: RiskLevel;
  context?: ScoreSource;
}

/** Reference details about the organization the caller claimed to be, from the directory. */
export function CallerDetails({ entry, report, risk, context = "call" }: CallerDetailsProps) {
  if (!entry && risk === "low") return null;
  const message = context === "message";

  return (
    <Card className="stack" aria-labelledby="caller-heading">
      <h2 id="caller-heading">{message ? "About this sender" : "About this caller"}</h2>
      {entry ? (
        <>
          <p>
            {message ? "The sender" : "The caller"} says they are from{" "}
            <strong>{entry.organization}</strong>. TrustLine cannot confirm who{" "}
            {message ? "sent this" : "is calling"}, so use only these official channels.
          </p>
          <dl className="details">
            <dt>Official phone</dt>
            <dd>
              {entry.phone ??
                (entry.category === "bank"
                  ? "The number on the back of your card"
                  : "Your local police non-emergency line")}
            </dd>
            <dt>Official website</dt>
            <dd>
              <a href={entry.url} target="_blank" rel="noreferrer">
                {new URL(entry.url).hostname.replace(/^www\./, "")}
              </a>
            </dd>
          </dl>
          <p className="muted">{entry.guidance}</p>
        </>
      ) : (
        <p>
          {message ? "The sender" : "The caller"} has not named an organization. Talk to someone you
          trust before you pay or share anything.
        </p>
      )}
      {risk !== "low" && report && (
        <p className="small">
          Report the {message ? "message" : "call"} to the{" "}
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
