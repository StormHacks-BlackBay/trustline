import { AnalysingCallSession, type AnalysisDeps } from "./analysingSession";
import { createCallServer } from "./app";
import { loadConfig } from "./config";
import { EventHub } from "./hub";
import { LanguagePreferences } from "./preferences";
import { elevenLabsSpeaker } from "./speaker";
import { elevenLabsTranscriber } from "./transcriber";

try {
  process.loadEnvFile(".env");
} catch {
  // Production reads the real environment.
}

const config = loadConfig();
const elevenLabsKey = process.env.ELEVENLABS_API_KEY;
if (!elevenLabsKey) {
  console.error("ELEVENLABS_API_KEY is required to transcribe calls.");
  process.exit(1);
}
if (!config.twilioAuthToken) {
  console.warn(
    "TWILIO_AUTH_TOKEN is not set: webhook signatures are not checked (local use only).",
  );
}
if (!process.env.ANTHROPIC_API_KEY) {
  console.warn("ANTHROPIC_API_KEY is not set: calls are scored by the rules layer only.");
}

const server = createCallServer<AnalysisDeps>(
  {
    config,
    hub: new EventHub(),
    createTranscriber: elevenLabsTranscriber(elevenLabsKey),
    languages: new LanguagePreferences(),
    speaker: elevenLabsSpeaker(elevenLabsKey),
  },
  (ws, deps) => new AnalysingCallSession(ws, deps),
);

server.listen(config.port, () => {
  console.log(`TrustLine call server on :${config.port} (public URL ${config.publicUrl})`);
});
