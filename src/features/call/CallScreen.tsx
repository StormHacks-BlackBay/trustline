import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { Link } from "../../components/Link";
import { DEMO_CALLS } from "../../data/demoCalls";
import { CallerSettings } from "./CallerSettings";
import { textDirection } from "../../lib/flagText";
import { AddTrustLine } from "./AddTrustLine";
import { AdvisoryBanner } from "./AdvisoryBanner";
import { CallAnalysis } from "./CallAnalysis";
import { Diagnostics } from "./Diagnostics";
import { useCallSource } from "./useCallSource";
import { useCaller } from "./useCaller";
import "./CallScreen.css";

const STATUS_TEXT = {
  idle: "Not listening",
  connecting: "Connecting…",
  listening: "Listening",
  ended: "Call ended",
  error: "Stopped",
} as const;

export function CallScreen() {
  const { user, language, setUser, setLanguage } = useCaller();
  const call = useCallSource(user.id, language);
  const active = call.status === "listening" || call.status === "connecting";

  return (
    <div className="call-screen stack">
      <header className="call-screen__header">
        <h1>TrustLine</h1>
        <p className="muted">
          Add TrustLine to a suspicious call, or listen to a speakerphone call on another device.
        </p>
      </header>

      <AdvisoryBanner />

      <CallerSettings
        user={user}
        language={language}
        onUserChange={setUser}
        onLanguageChange={setLanguage}
      />

      <Card className="stack" aria-labelledby="listen-heading">
        <div className="row call-screen__status">
          <h2 id="listen-heading">
            {call.mode === "phone"
              ? "Phone call"
              : call.demoCall
                ? `Demo call: ${call.demoCall.title}`
                : "Call"}
          </h2>
          <span className={`status-pill status-pill--${call.status}`}>
            {STATUS_TEXT[call.status]}
          </span>
        </div>
        {call.mode === "phone" ? (
          <p className="muted">
            {active
              ? "TrustLine is on your call. Hang up on your phone to end it."
              : "The call ended."}
          </p>
        ) : active ? (
          <Button variant="secondary" fullWidth onClick={call.stop}>
            {call.mode === "live" ? "Stop listening" : "Stop demo call"}
          </Button>
        ) : (
          <Button fullWidth onClick={call.startLive}>
            Start listening
          </Button>
        )}
        {call.error && (
          <p className="call-screen__error" role="alert">
            {call.error}
          </p>
        )}
        {call.spokenWarning && (
          <p className="spoken-warning" lang={language} dir={textDirection(language)}>
            <strong lang="en" dir="ltr">
              {call.spokenWarning.spoken ? "TrustLine said on the call: " : "TrustLine warning: "}
            </strong>
            {call.spokenWarning.text}
          </p>
        )}
        <CallAnalysis
          key={call.callNumber}
          segments={call.segments}
          partial={call.partial}
          language={language}
          user={user}
        />
      </Card>

      <AddTrustLine connected={call.phoneConnected} />

      <Card className="stack" aria-labelledby="demo-heading">
        <div>
          <h2 id="demo-heading">Demo calls</h2>
          <p className="muted small">
            Scripted calls that run through the same detection as a live call.
          </p>
        </div>
        <ul className="demo-calls">
          {DEMO_CALLS.map((demo) => (
            <li key={demo.id}>
              <Button variant="secondary" fullWidth onClick={() => call.playDemo(demo)}>
                {demo.title}
              </Button>
              <p className="muted small">{demo.description}</p>
            </li>
          ))}
        </ul>
      </Card>

      <Diagnostics />

      <footer className="call-screen__footer">
        <Link href="/partner">Partner dashboard</Link>
      </footer>
    </div>
  );
}
