import { createCallServer } from "./app";
import { loadConfig } from "./config";

try {
  process.loadEnvFile(".env");
} catch {
  // Production reads the real environment.
}

const config = loadConfig();
if (!config.twilioAuthToken) {
  console.warn(
    "TWILIO_AUTH_TOKEN is not set: webhook signatures are not checked (local use only).",
  );
}

createCallServer(config).listen(config.port, () => {
  console.log(`TrustLine call server on :${config.port} (public URL ${config.publicUrl})`);
});
