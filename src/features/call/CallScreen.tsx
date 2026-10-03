import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { CallerSettings } from "./CallerSettings";
import { useCaller } from "./useCaller";
import "./CallScreen.css";

export function CallScreen() {
  const { user, language, setUser, setLanguage } = useCaller();

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
        <h2 id="listen-heading">Call</h2>
        <Button fullWidth>Start listening</Button>
      </Card>
    </div>
  );
}
