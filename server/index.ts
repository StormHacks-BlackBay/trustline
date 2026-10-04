import { AnalysingCallSession, type AnalysisDeps } from "./analysingSession";
import { CallArchive } from "./archive";
import { createCallServer } from "./app";
import { loadConfig } from "./config";
import { EventHub } from "./hub";
import { LanguagePreferences } from "./preferences";
import { twilioSms } from "./sms";
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
if (!process.env.GEMINI_API_KEY) {
  console.warn("GEMINI_API_KEY is not set: calls are scored by the rules layer only.");
}

const sms =
  config.twilioAccountSid && config.twilioAuthToken && config.smsFrom
    ? twilioSms(config.twilioAccountSid, config.twilioAuthToken, config.smsFrom)
    : null;
if (!sms) {
  console.warn(
    "After-call texts are off: set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN and TWILIO_PHONE_NUMBER.",
  );
} else if (config.appOrigin === "*") {
  console.warn("After-call texts are off: set APP_ORIGIN to the web app's URL for the link.");
}

const server = createCallServer<AnalysisDeps>(
  {
    config,
    hub: new EventHub(),
    createTranscriber: elevenLabsTranscriber(elevenLabsKey),
    languages: new LanguagePreferences(),
    speaker: elevenLabsSpeaker(elevenLabsKey),
    archive: new CallArchive(),
    sms,
  },
  (ws, deps) => new AnalysingCallSession(ws, deps),
);

server.listen(config.port, () => {
  console.log(`TrustLine call server on :${config.port} (public URL ${config.publicUrl})`);
});
