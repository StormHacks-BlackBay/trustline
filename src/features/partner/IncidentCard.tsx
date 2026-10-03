import type { ReactNode } from "react";
import { Card } from "../../components/Card";
import { Chip, ChipList } from "../../components/Chip";
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
      <div className="row row--between">
        <div className="row">
          <RiskBadge risk={incident.risk} />
          {isNew && <Chip tone="solid">New</Chip>}
        </div>
        <p className="muted small">
          <time dateTime={incident.createdAt}>{timeAgo(incident.createdAt)}</time> · Member's
          language: {language}
        </p>
      </div>
      <h3>Caller claimed to be {incident.claimedOrg ?? "an unnamed official"}</h3>
      <ChipList label="Warning signs" items={incident.flags.map((f) => FLAG_LABELS[f])} />
      <blockquote className="incident__excerpt">{incident.redactedExcerpt}</blockquote>
      {actions && <div className="incident__actions">{actions}</div>}
    </Card>
  );
}
