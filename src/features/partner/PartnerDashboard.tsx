import { useState } from "react";
import { Alert } from "../../components/Alert";
import { Button } from "../../components/Button";
import { ButtonLink } from "../../components/ButtonLink";
import { Card } from "../../components/Card";
import { Field, Select } from "../../components/Field";
import { PARTNERS } from "../../data/partners";
import { useAdvisories } from "../../hooks/useAdvisories";
import { readStored, writeStored } from "../../lib/storage";
import { store } from "../../lib/store";
import { formatDollars } from "../../lib/money";
import { timeAgo } from "../../lib/time";
import type { Incident } from "../../lib/types";
import { CopySheet } from "./CopySheet";
import { IncidentCard } from "./IncidentCard";
import { PublishAdvisory } from "./PublishAdvisory";
import { SendToMembers } from "./SendToMembers";
import { CAFC_REPORT_URL, cafcSummary, incidentsCsv, memberAlert } from "./partnerReports";
import { summarize, type Count } from "./summary";
import { usePartnerIncidents } from "./usePartnerIncidents";
import "./PartnerDashboard.css";

const PARTNER_KEY = "trustline.partner";

/** Saves the anonymized reports as a CSV file. */
function downloadCsv(incidents: Incident[], partnerName: string) {
  const blob = new Blob([incidentsCsv(incidents)], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `trustline-reports-${partnerName.toLowerCase().replace(/\W+/g, "-")}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

/** A ranked list with a bar for each count, relative to the largest. */
function TrendList<K extends string>({ label, items }: { label: string; items: Count<K>[] }) {
  const max = items[0]?.count ?? 1;
  return (
    <ul className="trend-list" aria-label={label}>
      {items.slice(0, 5).map((item) => (
        <li key={item.key}>
          <div className="trend-list__row">
            <span>{item.label}</span>
            <span>{item.count}</span>
          </div>
          <div
            className="trend-list__bar"
            style={{ inlineSize: `${Math.max(8, (item.count / max) * 100)}%` }}
            aria-hidden="true"
          />
        </li>
      ))}
    </ul>
  );
}

export function PartnerDashboard() {
  const [partnerId, setPartnerId] = useState(
    () => PARTNERS.find((p) => p.id === readStored(PARTNER_KEY))?.id ?? PARTNERS[0]?.id ?? "",
  );
  const partner = PARTNERS.find((p) => p.id === partnerId);
  // The Anti-Fraud Centre receives reports itself, so it has nothing to forward to the Centre.
  const isGovernment = partner?.kind === "government";
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
        <h1>Partner portal</h1>
        <p className="page-header__lead">
          Scams your members reported after TrustLine warned them, with personal details removed.
          Warn every partner's members, pass alerts on through your own channels, and send reports
          to the Canadian Anti-Fraud Centre.
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
                <dt>Money at risk</dt>
                <dd>{formatDollars(summary.moneyAtRisk)}</dd>
                <p className="stats__note">
                  What scammers asked for in the calls members reported.
                </p>
              </div>
              <div className="stats__item stats__item--wide">
                <dt>Most impersonated</dt>
                <dd>{summary.topClaimedOrg ?? "None yet"}</dd>
              </div>
            </dl>
          </Card>

          <Card className="stack" aria-labelledby="trends-heading">
            <h2 id="trends-heading">Trends</h2>
            {summary.tactics.length === 0 ? (
              <p className="muted small">Trends appear once members report calls.</p>
            ) : (
              <>
                <h3 className="small">Most common tactics</h3>
                <TrendList label="Most common tactics" items={summary.tactics} />
                <h3 className="small">Members' languages</h3>
                <TrendList label="Members' languages" items={summary.languages} />
              </>
            )}
            <Button
              variant="secondary"
              disabled={incidents.length === 0}
              onClick={() => downloadCsv(incidents, partner?.name ?? "partner")}
            >
              Download anonymized data (CSV)
            </Button>
            <p className="muted small">
              No excerpts or personal details: date, risk, claimed organization, tactics, amount and
              language only.
            </p>
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
                    {partner && (
                      <div className="advisory-list__actions">
                        <SendToMembers partnerName={partner.name} text={memberAlert(a, partner)} />
                      </div>
                    )}
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
                No calls reported to {partner?.name} yet. When someone shares a suspicious call, it
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
                  actions={
                    partner && (
                      <>
                        <PublishAdvisory incident={incident} publisher={partner} />
                        {!isGovernment && (
                          <CopySheet
                            label="Report to the Anti-Fraud Centre"
                            title="Report to the Canadian Anti-Fraud Centre"
                            intro="Copy this summary into the Centre's online report. The member's identity is not included."
                            text={cafcSummary(incident, partner)}
                            actions={
                              <ButtonLink
                                variant="secondary"
                                href={CAFC_REPORT_URL}
                                target="_blank"
                                rel="noreferrer"
                              >
                                Open the reporting site
                              </ButtonLink>
                            }
                          />
                        )}
                      </>
                    )
                  }
                />
              </li>
            ))}
          </ol>
        </section>
      </div>
    </div>
  );
}
