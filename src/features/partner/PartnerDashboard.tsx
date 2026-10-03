import { useState } from "react";
import { Alert } from "../../components/Alert";
import { Card } from "../../components/Card";
import { Field, Select } from "../../components/Field";
import { PARTNERS } from "../../data/partners";
import { useAdvisories } from "../../hooks/useAdvisories";
import { readStored, writeStored } from "../../lib/storage";
import { store } from "../../lib/store";
import { timeAgo } from "../../lib/time";
import { IncidentCard } from "./IncidentCard";
import { PublishAdvisory } from "./PublishAdvisory";
import { summarize } from "./summary";
import { usePartnerIncidents } from "./usePartnerIncidents";
import "./PartnerDashboard.css";

const PARTNER_KEY = "trustline.partner";

export function PartnerDashboard() {
  const [partnerId, setPartnerId] = useState(
    () => PARTNERS.find((p) => p.id === readStored(PARTNER_KEY))?.id ?? PARTNERS[0]?.id ?? "",
  );
  const partner = PARTNERS.find((p) => p.id === partnerId);
  const { incidents, latestId, error } = usePartnerIncidents(partnerId);
  const advisories = useAdvisories();
  const summary = summarize(incidents);

  const choosePartner = (id: string) => {
    setPartnerId(id);
    writeStored(PARTNER_KEY, id);
  };

  return (
    <div className="stack">
      <header className="page-header">
        <h1>Partner dashboard</h1>
        <p className="page-header__lead">
          Calls your members chose to report, with personal details removed. Publish an advisory to
          warn members of every partner organization.
        </p>
      </header>

      <div className="dashboard">
        <aside className="dashboard__side stack" aria-label="Organization overview">
          <Card className="stack">
            <Field
              label="Organization"
              hint={
                store.kind === "local"
                  ? "Local demo mode: reports from other tabs in this browser appear here."
                  : "Live: reports from every TrustLine member of this organization appear here."
              }
            >
              {(props) => (
                <Select
                  {...props}
                  value={partnerId}
                  onChange={(e) => choosePartner(e.target.value)}
                >
                  {PARTNERS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </Select>
              )}
            </Field>
            <dl className="stats">
              <div className="stats__item">
                <dt>Reported calls</dt>
                <dd>{summary.total}</dd>
              </div>
              <div className="stats__item">
                <dt>Likely scams</dt>
                <dd>{summary.likelyScams}</dd>
              </div>
              <div className="stats__item stats__item--wide">
                <dt>Most impersonated</dt>
                <dd>{summary.topClaimedOrg ?? "None yet"}</dd>
              </div>
            </dl>
          </Card>

          <Card className="stack stack--tight" aria-labelledby="advisories-heading">
            <h2 id="advisories-heading">Published advisories</h2>
            {advisories.length === 0 ? (
              <p className="muted small">None in the last 7 days.</p>
            ) : (
              <ul className="advisory-list">
                {advisories.slice(0, 5).map((a) => (
                  <li key={a.id}>
                    <p className="advisory-list__title">{a.title}</p>
                    <p className="muted small">
                      {PARTNERS.find((p) => p.id === a.publisherId)?.name ?? "A partner"} ·{" "}
                      <time dateTime={a.createdAt}>{timeAgo(a.createdAt)}</time>
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </aside>

        <section className="dashboard__main stack" aria-labelledby="incidents-heading">
          <h2 id="incidents-heading">Reported calls</h2>
          <div className="visually-hidden" aria-live="polite">
            {latestId ? "A new call was reported." : ""}
          </div>
          {error && <Alert tone="error">Could not load reports. Check the connection.</Alert>}
          {incidents.length === 0 && !error && (
            <Card>
              <p className="muted">
                No calls reported to {partner?.name} yet. When a member shares a suspicious call, it
                appears here with personal details removed.
              </p>
            </Card>
          )}
          <ol className="dashboard__list">
            {incidents.map((incident) => (
              <li key={incident.id}>
                <IncidentCard
                  incident={incident}
                  isNew={incident.id === latestId}
                  actions={partner && <PublishAdvisory incident={incident} publisher={partner} />}
                />
              </li>
            ))}
          </ol>
        </section>
      </div>
    </div>
  );
}
