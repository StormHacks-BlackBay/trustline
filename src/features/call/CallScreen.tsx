import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { DEMO_CALLS } from "../../data/demoCalls";
import { CallerSettings } from "./CallerSettings";
import { CallAnalysis } from "./CallAnalysis";
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
  const call = useCallSource();
  const active = call.status === "listening" || call.status === "connecting";

  return (
    <div className="call-screen stack">
      <header className="call-screen__header">
        <h1>TrustLine</h1>
        <p className="muted">Put the call on speaker and start listening.</p>
      </header>

      <CallerSettings
        user={user}
        language={language}
        onUserChange={setUser}
        onLanguageChange={setLanguage}
      />

      <Card className="stack" aria-labelledby="listen-heading">
        <div className="row call-screen__status">
          <h2 id="listen-heading">
            {call.demoCall ? `Demo call: ${call.demoCall.title}` : "Call"}
          </h2>
          <span className={`status-pill status-pill--${call.status}`}>
            {STATUS_TEXT[call.status]}
          </span>
        </div>
        {active ? (
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
        <CallAnalysis
          key={call.callNumber}
          segments={call.segments}
          partial={call.partial}
          language={language}
          user={user}
        />
      </Card>

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
    </div>
  );
}
