import { useState } from "react";
import { Card } from "../../components/Card";
import {
  isSituationId,
  PROTECT_STEPS,
  REPORT_STEPS,
  SITUATIONS,
  urgentSteps,
  type Contact,
  type RecoveryStep,
  type SituationId,
} from "../../data/recovery";
import "./RecoveryGuide.css";

const telHref = (phone: string) => `tel:+1${phone.replace(/\D/g, "").replace(/^1/, "")}`;

/** Situations named in the URL, e.g. /recover?situations=gift_cards,identity. */
function situationsFromUrl(): SituationId[] {
  const raw = new URLSearchParams(window.location.search).get("situations") ?? "";
  return raw.split(",").filter(isSituationId);
}

function ContactLine({ contact }: { contact: Contact }) {
  if (contact.phone) {
    return (
      <li>
        {contact.label}:{" "}
        <a className="nowrap" href={telHref(contact.phone)}>
          {contact.phone}
        </a>
      </li>
    );
  }
  if (contact.url) {
    return (
      <li>
        <a href={contact.url} target="_blank" rel="noreferrer">
          {contact.label}
        </a>
      </li>
    );
  }
  return <li>{contact.label}</li>;
}

interface StepListProps {
  id: string;
  title: string;
  intro?: string;
  steps: RecoveryStep[];
}

/** One numbered section of the guide. */
function StepList({ id, title, intro, steps }: StepListProps) {
  return (
    <Card className="stack" aria-labelledby={id}>
      <h2 id={id}>{title}</h2>
      {intro && <p className="muted">{intro}</p>}
      <ol className="recovery-steps">
        {steps.map((step) => (
          <li key={step.id} className="recovery-step">
            <h3 className="recovery-step__title">{step.title}</h3>
            <p>{step.detail}</p>
            {step.contacts && step.contacts.length > 0 && (
              <ul className="recovery-contacts">
                {step.contacts.map((contact) => (
                  <ContactLine key={contact.label} contact={contact} />
                ))}
              </ul>
            )}
          </li>
        ))}
      </ol>
    </Card>
  );
}

/**
 * What to do after paying a scammer or sharing details: the urgent steps for what happened,
 * then reporting and protecting yourself. Contacts come only from the verified directory and the
 * Canadian Anti-Fraud Centre's guidance, never from a caller.
 */
export function RecoveryGuide() {
  const [selected, setSelected] = useState<SituationId[]>(situationsFromUrl);

  const toggleSituation = (id: SituationId) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));

  const urgent = urgentSteps(selected);

  return (
    <div className="stack">
      <header className="page-header">
        <h1>If you already paid or shared details</h1>
        <p className="page-header__lead">
          Act quickly, but you are not alone. Choose what happened and TrustLine lists what to do,
          in order. Use only the contacts shown here, never ones a caller or message gave you.
        </p>
      </header>

      <Card className="stack">
        <fieldset className="recovery-situations">
          <legend>What happened? Choose all that apply.</legend>
          {SITUATIONS.map((situation) => (
            <div key={situation.id} className="recovery-situation">
              <input
                id={`situation-${situation.id}`}
                type="checkbox"
                checked={selected.includes(situation.id)}
                onChange={() => toggleSituation(situation.id)}
              />
              <label htmlFor={`situation-${situation.id}`}>{situation.label}</label>
            </div>
          ))}
        </fieldset>
      </Card>

      {urgent.length > 0 ? (
        <StepList id="recovery-now" title="1. Do this now" steps={urgent} />
      ) : (
        <p className="muted" role="status">
          Choose what happened above to see the first steps for your situation.
        </p>
      )}
      <StepList
        id="recovery-report"
        title={urgent.length > 0 ? "2. Report it" : "Report it"}
        intro="Reports help the police and the Canadian Anti-Fraud Centre warn other people."
        steps={REPORT_STEPS}
      />
      <StepList
        id="recovery-protect"
        title={urgent.length > 0 ? "3. Protect yourself next" : "Protect yourself next"}
        steps={PROTECT_STEPS}
      />
      <p className="muted small">
        Based on the Canadian Anti-Fraud Centre's advice for fraud victims. Demo data: check
        official contacts before real-world use.
      </p>
    </div>
  );
}
