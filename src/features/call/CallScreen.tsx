import { Alert } from "../../components/Alert";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { Chip } from "../../components/Chip";
import { DEMO_CALLS } from "../../data/demoCalls";
import { textDirection } from "../../lib/flagText";
import { AddTrustLine } from "./AddTrustLine";
import { AdvisoryBanner } from "./AdvisoryBanner";
import { CallAnalysis } from "./CallAnalysis";
import { CallerSettings } from "./CallerSettings";
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
  const phoneActive = call.mode === "phone" && active;

  const title =
    call.mode === "phone"
      ? "Phone call"
      : call.demoCall
        ? `Demo call: ${call.demoCall.title}`
        : "Call";

  let control;
  if (phoneActive) {
    control = <p className="muted">TrustLine is on your call. Hang up on your phone to end it.</p>;
  } else if (active) {
    control = (
      <Button variant="secondary" onClick={call.stop}>
        {call.mode === "live" ? "Stop listening" : "Stop demo call"}
      </Button>
    );
  } else {
    control = <Button onClick={call.startLive}>Start listening on this device</Button>;
  }

  const demoCalls = (
    <Card className="stack" aria-labelledby="demo-heading">
      <div className="stack stack--tight">
        <h2 id="demo-heading">Demo calls</h2>
        <p className="muted small">
          Scripted calls that run through the same detection as a real call.
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
  );

  return (
    <div className="stack call-screen">
      <header className="page-header">
        <h1>Call check</h1>
        <p className="page-header__lead">
          Add TrustLine to a suspicious call, or listen to a speakerphone call on another device.
        </p>
      </header>

      <AdvisoryBanner />

      <CallAnalysis
        key={call.callNumber}
        segments={call.segments}
        partial={call.partial}
        language={language}
        user={user}
      >
        {({ main, side }) => (
          <div className="call-layout">
            <div className="call-layout__main stack">
              <Card className="stack" aria-labelledby="call-heading">
                <div className="row row--between">
                  <h2 id="call-heading">{title}</h2>
                  <Chip tone={call.status === "listening" ? "accent" : "neutral"}>
                    {STATUS_TEXT[call.status]}
                  </Chip>
                </div>
                <CallerSettings
                  user={user}
                  language={language}
                  onUserChange={setUser}
                  onLanguageChange={setLanguage}
                />
                <div className="call-control">{control}</div>
                {call.error && <Alert tone="error">{call.error}</Alert>}
              </Card>
              {call.spokenWarning && (
                <Alert tone="info">
                  <span lang="en">
                    {call.spokenWarning.spoken
                      ? "TrustLine said on the call: "
                      : "TrustLine warning: "}
                  </span>
                  <span lang={language} dir={textDirection(language)}>
                    {call.spokenWarning.text}
                  </span>
                </Alert>
              )}
              {main}
            </div>
            <aside className="call-layout__side stack" aria-label="Call tools">
              {side}
              <AddTrustLine connected={call.phoneConnected} />
              {demoCalls}
              <Diagnostics />
            </aside>
          </div>
        )}
      </CallAnalysis>
    </div>
  );
}
