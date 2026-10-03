import type { AddressInfo } from "node:net";
import WebSocket from "ws";
import type { Transcriber, TranscriberFactory, TranscriberHandlers } from "./transcriber";

/** A transcriber the test drives directly: say(text) commits a segment. */
export function fakeTranscriber() {
  let handlers: TranscriberHandlers | null = null;
  const received: string[] = [];
  let closed = false;
  const factory: TranscriberFactory = async (h) => {
    handlers = h;
    const transcriber: Transcriber = {
      sendAudio: (payload) => received.push(payload),
      close: () => {
        closed = true;
      },
    };
    return transcriber;
  };
  return {
    factory,
    received,
    isClosed: () => closed,
    say: (text: string) => handlers?.onCommitted(text),
    partial: (text: string) => handlers?.onPartial(text),
    ready: () => handlers !== null,
  };
}

/** Plays the Twilio side of a media stream against the server. */
export async function fakeTwilioStream(
  server: { address: () => AddressInfo | string | null },
  from: string,
) {
  const { port } = server.address() as AddressInfo;
  const ws = new WebSocket(`ws://127.0.0.1:${port}/twilio/media`);
  const outbound: unknown[] = [];
  ws.on("message", (raw) => outbound.push(JSON.parse(raw.toString())));
  await new Promise((resolve) => ws.once("open", resolve));
  const streamSid = "MZ-test";
  ws.send(JSON.stringify({ event: "connected" }));
  ws.send(
    JSON.stringify({
      event: "start",
      streamSid,
      start: { callSid: "CA-test", customParameters: { from } },
    }),
  );
  return {
    outbound,
    media: (payload: string) =>
      ws.send(JSON.stringify({ event: "media", streamSid, media: { track: "inbound", payload } })),
    stop: () => ws.send(JSON.stringify({ event: "stop", streamSid })),
    close: () => ws.close(),
  };
}

export const waitFor = async (check: () => boolean, timeoutMs = 2000) => {
  const started = Date.now();
  while (!check()) {
    if (Date.now() - started > timeoutMs) throw new Error("Timed out waiting for condition");
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
};
