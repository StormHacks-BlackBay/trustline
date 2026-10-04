import { useEffect, useMemo, useRef, useState, type FormEvent, type MouseEvent } from "react";
import { Alert } from "../../components/Alert";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { Field, TextArea } from "../../components/Field";
import { EXAMPLE_MESSAGES } from "../../data/exampleMessages";
import { findOrganization, reportingEntry } from "../../lib/directory";
import { ruleReason } from "../../lib/flagText";
import type { Segment } from "../../lib/transcript";
import type { DemoUser, LanguageCode } from "../../lib/types";
import { CallerDetails } from "../call/CallerDetails";
import { CallerSettings } from "../call/CallerSettings";
import { RiskAnnouncer } from "../call/RiskAnnouncer";
import { ShareIncident } from "../call/ShareIncident";
import { WarningHero } from "../call/WarningHero";
import { highlight } from "../call/highlight";
import { useCaller } from "../call/useCaller";
import { useRiskEngine } from "../call/useRiskEngine";
import "../call/CallScreen.css";
import "./MessageCheck.css";

export const MESSAGE_MAX = 2000;

interface MessageResultProps {
  message: string;
  /** When the user asked for the check, for the latency diagnostics. */
  checkedAt: number;
  language: LanguageCode;
  user: DemoUser;
}

/** The checked message, its warning and the sender's official contacts. Keyed per check. */
function MessageResult({ message, checkedAt, language, user }: MessageResultProps) {
  const segments = useMemo<Segment[]>(
    () => [{ id: "message", text: message, committedAt: checkedAt }],
    [message, checkedAt],
  );
  const headingRef = useRef<HTMLHeadingElement>(null);
  // Move focus to the result so keyboard and screen reader users land on it, and so it scrolls
  // into view on small screens.
  useEffect(() => headingRef.current?.focus(), []);
  const { assessment, llmStatus, transcript } = useRiskEngine(segments, language, "message");
  const organization = findOrganization(transcript, assessment.claimedOrg);
  const reason = assessment.explanation ?? ruleReason(assessment.flags, language);

  const share =
    assessment.risk === "low" ? null : (
      <ShareIncident
        user={user}
        language={language}
        segments={segments}
        assessment={assessment}
        organizationName={organization?.organization ?? null}
        context="message"
      />
    );

  return (
    <div className="call-layout">
      <div className="call-layout__main stack">
        <h2 ref={headingRef} tabIndex={-1} className="visually-hidden">
          Result
        </h2>
        <RiskAnnouncer risk={assessment.risk} reason={reason} language={language} />
        <WarningHero
          assessment={assessment}
          llmStatus={llmStatus}
          language={language}
          organization={organization}
          share={share}
          context="message"
        />
        <Card className="stack stack--tight" aria-labelledby="checked-heading">
          <h2 id="checked-heading">The message</h2>
          <p className="checked-message">
            {highlight(message, assessment.evidence).map((piece, i) =>
              piece.marked ? <mark key={i}>{piece.text}</mark> : <span key={i}>{piece.text}</span>,
            )}
          </p>
        </Card>
      </div>
      <aside className="call-layout__side stack" aria-label="Sender details">
        <CallerDetails
          entry={organization}
          report={reportingEntry()}
          risk={assessment.risk}
          context="message"
        />
      </aside>
    </div>
  );
}

/**
 * Paste a text, email or social media message and get the same evidence-backed warning as a call:
 * the rules run instantly, Gemini adds context, and contacts come only from the verified directory.
 */
export function MessageCheck() {
  const { user, language, setUser, setLanguage } = useCaller();
  const [draft, setDraft] = useState("");
  const [checked, setChecked] = useState<{ text: string; id: number; at: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  /** `at` is the event's timestamp: the same clock as performance.now(), when the user acted. */
  const check = (text: string, at: number) => {
    const trimmed = text.trim();
    if (!trimmed) {
      setError("Paste a message to check.");
      return;
    }
    setError(null);
    setChecked((prev) => ({ text: trimmed, id: (prev?.id ?? 0) + 1, at }));
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    check(draft, event.timeStamp);
  };

  const tryExample = (text: string, event: MouseEvent) => {
    setDraft(text);
    check(text, event.timeStamp);
  };

  return (
    <div className="stack">
      <header className="page-header">
        <h1>Message check</h1>
        <p className="page-header__lead">
          Got a text, email or social media message asking for money, a code or a click? Paste it
          here before you reply or tap anything.
        </p>
      </header>

      <Card className="stack">
        <form className="stack" onSubmit={submit} noValidate>
          <Field
            label="Message"
            hint={`Copy the whole message, including any links. Up to ${MESSAGE_MAX} characters. Don't tap the links to check them.`}
          >
            {(props) => (
              <TextArea
                {...props}
                rows={6}
                maxLength={MESSAGE_MAX}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                aria-invalid={error ? true : undefined}
              />
            )}
          </Field>
          {error && <Alert tone="error">{error}</Alert>}
          <CallerSettings
            user={user}
            language={language}
            onUserChange={setUser}
            onLanguageChange={setLanguage}
          />
          <div className="call-control">
            <Button type="submit">Check message</Button>
          </div>
        </form>
        <div className="stack stack--tight">
          <h2 id="examples-heading" className="small">
            Or try an example
          </h2>
          <ul className="message-examples" aria-labelledby="examples-heading">
            {EXAMPLE_MESSAGES.map((example) => (
              <li key={example.id}>
                <Button variant="secondary" onClick={(event) => tryExample(example.text, event)}>
                  {example.title}
                </Button>
              </li>
            ))}
          </ul>
        </div>
      </Card>

      {checked && (
        <MessageResult
          key={checked.id}
          message={checked.text}
          checkedAt={checked.at}
          language={language}
          user={user}
        />
      )}
    </div>
  );
}
