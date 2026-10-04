import type { AddressInfo } from "node:net";
import { DEMO_CALLS } from "../src/data/demoCalls";
import { AnalysingCallSession, type AnalysisDeps } from "../server/analysingSession";
import { createCallServer, mediaStreamUrl } from "../server/app";
import { loadConfig, userForCaller } from "../server/config";
import { EventHub } from "../server/hub";
import { LanguagePreferences } from "../server/preferences";
import { elevenLabsSpeaker } from "../server/speaker";
import { fakeTwilioStream, waitFor } from "../server/testing";
import type { TranscriberFactory } from "../server/transcriber";

/**
 * Rehearse a merged phone call without Twilio: runs the real call server, plays the Twilio side of
 * the media stream, and "transcribes" a demo script word by word.
 *
 *   npm run simulate:call -- ircc-scam
 */
try {
  process.loadEnvFile(".env");
} catch {
  // Keys are optional here.
}

const callId = process.argv[2] ?? "ircc-scam";
const demo = DEMO_CALLS.find((c) => c.id === callId);
if (!demo) {
  console.error(`Unknown demo call "${callId}". Try: ${DEMO_CALLS.map((c) => c.id).join(", ")}`);
  process.exit(1);
}

const WORD_MS = 260;
const LINE_PAUSE_MS = 700;
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const scriptedTranscriber: TranscriberFactory = async ({ onPartial, onCommitted }) => {
  let stopped = false;
  void (async () => {
    await sleep(1500);
    for (const line of demo.lines) {
      const words = line.split(" ");
      for (let i = 1; i <= words.length && !stopped; i++) {
        onPartial(words.slice(0, i).join(" "));
        await sleep(WORD_MS);
      }
      if (stopped) return;
      onCommitted(line);
      await sleep(LINE_PAUSE_MS);
    }
  })();
  return {
    sendAudio: () => undefined,
    close: () => {
      stopped = true;
    },
  };
};

const config = loadConfig({ ...process.env, PORT: process.env.PORT ?? "8787" });
const hub = new EventHub();
const elevenLabsKey = process.env.ELEVENLABS_API_KEY;
const server = createCallServer<AnalysisDeps>(
  {
    config,
    hub,
    languages: new LanguagePreferences(),
    createTranscriber: scriptedTranscriber,
    speaker: elevenLabsKey ? elevenLabsSpeaker(elevenLabsKey) : null,
  },
  (ws, deps) => new AnalysingCallSession(ws, deps),
);

await new Promise<void>((resolve) => server.listen(config.port, resolve));
const { port } = server.address() as AddressInfo;
const from = Object.keys(config.phoneLinks)[0] ?? "+16045550100";
const userId = userForCaller(config, from);
console.log(
  `Call server on :${port}. Open the app with VITE_CALL_SERVER_URL=http://localhost:${port}`,
);
console.log(`Waiting for ${userId}'s app to connect…`);
await waitFor(() => hub.subscriberCount(userId) > 0, 120_000);

console.log(`Playing "${demo.title}" as a merged call`);
hub.subscribe(userId, (event) => {
  if (event.type === "segment") console.log(`  caller: ${event.text}`);
  if (event.type === "warning")
    console.log(`  TrustLine ${event.spoken ? "said" : "warned (silent)"}: ${event.text}`);
});
// Sign the stream like Twilio, so the simulator exercises the same signature check as a real call.
const signing = config.twilioAuthToken
  ? { authToken: config.twilioAuthToken, mediaUrl: mediaStreamUrl(config) }
  : undefined;
const call = await fakeTwilioStream(server, from, signing);
const totalMs =
  1500 + demo.lines.reduce((ms, l) => ms + l.split(" ").length * WORD_MS + LINE_PAUSE_MS, 0);
await sleep(totalMs + 3000);
const spoken = call.outbound.filter((m) => (m as { event: string }).event === "media").length;
console.log(`Sent ${spoken} audio chunks back into the call`);
call.stop();
await sleep(500);
call.close();
server.close();
