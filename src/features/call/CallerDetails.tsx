import { Card } from "../../components/Card";
import type { DirectoryEntry, RiskLevel } from "../../lib/types";

interface CallerDetailsProps {
  entry: DirectoryEntry | null;
  report: DirectoryEntry | null;
  risk: RiskLevel;
}

/** Reference details about the organization the caller claimed to be, from the directory. */
export function CallerDetails({ entry, report, risk }: CallerDetailsProps) {
  if (!entry && risk === "low") return null;

  return (
    <Card className="stack" aria-labelledby="caller-heading">
      <h2 id="caller-heading">About this caller</h2>
      {entry ? (
        <>
          <p>
            The caller says they are from <strong>{entry.organization}</strong>. TrustLine cannot
            confirm who is calling, so use only these official channels.
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
          The caller has not named an organization. Talk to someone you trust before you pay or
          share anything.
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
