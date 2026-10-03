import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { CallerSettings } from "./CallerSettings";
import { TranscriptView } from "./TranscriptView";
import { useCaller } from "./useCaller";
import { useLiveTranscript } from "./useLiveTranscript";
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
  const live = useLiveTranscript();
  const active = live.status === "listening" || live.status === "connecting";

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
          <h2 id="listen-heading">Call</h2>
          <span className={`status-pill status-pill--${live.status}`}>
            {STATUS_TEXT[live.status]}
          </span>
        </div>
        {active ? (
          <Button variant="secondary" fullWidth onClick={live.stop}>
            Stop listening
          </Button>
        ) : (
          <Button fullWidth onClick={live.start}>
            Start listening
          </Button>
        )}
        {live.error && (
          <p className="call-screen__error" role="alert">
            {live.error}
          </p>
        )}
        <TranscriptView segments={live.segments} partial={live.partial} />
      </Card>
    </div>
  );
}
