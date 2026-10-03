import { createCallServer } from "./app";
import { loadConfig } from "./config";
import { EventHub } from "./hub";
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

const server = createCallServer({
  config,
  hub: new EventHub(),
  createTranscriber: elevenLabsTranscriber(elevenLabsKey),
});

server.listen(config.port, () => {
  console.log(`TrustLine call server on :${config.port} (public URL ${config.publicUrl})`);
});
