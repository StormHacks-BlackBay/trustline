import { useState } from "react";
import { Link } from "../../components/Link";
import { PARTNERS } from "../../data/partners";
import { readStored, writeStored } from "../../lib/storage";
import { store } from "../../lib/store";
import { IncidentCard } from "./IncidentCard";
import { PublishAdvisory } from "./PublishAdvisory";
import { usePartnerIncidents } from "./usePartnerIncidents";
import "./PartnerDashboard.css";

const PARTNER_KEY = "trustline.partner";

export function PartnerDashboard() {
  const [partnerId, setPartnerId] = useState(
    () => PARTNERS.find((p) => p.id === readStored(PARTNER_KEY))?.id ?? PARTNERS[0]?.id ?? "",
  );
  const partner = PARTNERS.find((p) => p.id === partnerId);
  const { incidents, latestId, error } = usePartnerIncidents(partnerId);

  const choosePartner = (id: string) => {
    setPartnerId(id);
    writeStored(PARTNER_KEY, id);
  };

  return (
    <div className="dashboard stack">
      <header className="stack dashboard__header">
        <div className="row dashboard__title">
          <h1>Partner dashboard</h1>
          <Link href="/">Open the app</Link>
        </div>
        <label className="field">
          <span className="field__label">Organization</span>
          <select value={partnerId} onChange={(e) => choosePartner(e.target.value)}>
            {PARTNERS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
        <p className="muted small">
          {store.kind === "local"
            ? "Local demo mode: reports from other tabs in this browser appear here."
            : "Live: reports from every TrustLine user linked to this organization appear here."}
        </p>
      </header>

      <section className="stack" aria-labelledby="incidents-heading">
        <h2 id="incidents-heading">Reported calls</h2>
        <div className="visually-hidden" aria-live="polite">
          {latestId ? "A new call was reported." : ""}
        </div>
        {error && (
          <p role="alert" className="call-screen__error">
            Could not load reports. Check the connection.
          </p>
        )}
        {incidents.length === 0 && !error && (
          <p className="muted">
            No calls reported to {partner?.name} yet. When a user shares a suspicious call, it
            appears here with personal details removed.
          </p>
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
  );
}
