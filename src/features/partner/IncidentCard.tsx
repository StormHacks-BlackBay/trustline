import type { ReactNode } from "react";
import { Card } from "../../components/Card";
import { RiskBadge } from "../../components/RiskBadge";
import { FLAG_LABELS } from "../../lib/flagText";
import { timeAgo } from "../../lib/time";
import { LANGUAGES, type Incident } from "../../lib/types";

interface IncidentCardProps {
  incident: Incident;
  isNew: boolean;
  actions?: ReactNode;
}

export function IncidentCard({ incident, isNew, actions }: IncidentCardProps) {
  const language = LANGUAGES.find((l) => l.code === incident.language)?.label ?? incident.language;
  return (
    <Card className={`incident stack ${isNew ? "incident--new" : ""}`}>
      <div className="row incident__meta">
        <RiskBadge risk={incident.risk} />
        {isNew && <span className="incident__new">New</span>}
        <span className="muted small">
          <time dateTime={incident.createdAt}>{timeAgo(incident.createdAt)}</time> · Warnings in{" "}
          {language}
        </span>
      </div>
      <h3>Caller claimed to be: {incident.claimedOrg ?? "not stated"}</h3>
      {incident.flags.length > 0 && (
        <ul className="incident__flags" aria-label="Warning signs">
          {incident.flags.map((f) => (
            <li key={f}>{FLAG_LABELS[f]}</li>
          ))}
        </ul>
      )}
      <blockquote className="incident__excerpt">{incident.redactedExcerpt}</blockquote>
      {actions}
    </Card>
  );
}
