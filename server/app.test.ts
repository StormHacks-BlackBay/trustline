import type { AddressInfo } from "node:net";
import twilio from "twilio";
import { afterEach, describe, expect, it } from "vitest";
import { createCallServer } from "./app";
import { loadConfig, userForCaller } from "./config";
import { connectStreamTwiml } from "./twiml";

const servers: { close: () => void }[] = [];
afterEach(() => servers.splice(0).forEach((s) => s.close()));

async function start(env: Record<string, string>) {
  const config = loadConfig({ PORT: "0", ...env });
  const server = createCallServer(config);
  servers.push(server);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const { port } = server.address() as AddressInfo;
  return { base: `http://127.0.0.1:${port}`, config };
}

describe("connectStreamTwiml", () => {
  it("escapes the caller number and opens a stream", () => {
    const xml = connectStreamTwiml("wss://example.org/twilio/media", '+1604"<x>');
    expect(xml).toContain('<Stream url="wss://example.org/twilio/media">');
    expect(xml).toContain('value="+1604&quot;&lt;x&gt;"');
  });
});

describe("userForCaller", () => {
  it("maps linked numbers and falls back to the default user", () => {
    const config = loadConfig({ PHONE_LINKS: '{"+16045550100":"mei"}' });
    expect(userForCaller(config, "+16045550100")).toBe("mei");
    expect(userForCaller(config, "+17785550199")).toBe(config.defaultUserId);
  });
});

describe("POST /twilio/voice", () => {
  it("returns TwiML that streams to the public wss URL", async () => {
    const { base } = await start({ PUBLIC_URL: "https://calls.example.org" });
    const response = await fetch(`${base}/twilio/voice`, {
      method: "POST",
      body: new URLSearchParams({ From: "+16045550100", CallSid: "CA1" }),
    });
    const xml = await response.text();
    expect(response.status).toBe(200);
    expect(xml).toContain('url="wss://calls.example.org/twilio/media"');
    expect(xml).toContain('value="+16045550100"');
  });

  it("rejects requests with a bad signature when an auth token is set", async () => {
    const { base } = await start({ TWILIO_AUTH_TOKEN: "secret" });
    const response = await fetch(`${base}/twilio/voice`, {
      method: "POST",
      headers: { "x-twilio-signature": "forged" },
      body: new URLSearchParams({ From: "+16045550100" }),
    });
    expect(response.status).toBe(403);
  });

  it("accepts requests signed by Twilio", async () => {
    const publicUrl = "https://calls.example.org";
    const { base } = await start({ TWILIO_AUTH_TOKEN: "secret", PUBLIC_URL: publicUrl });
    const params = { From: "+16045550100", CallSid: "CA1" };
    const signature = twilio.getExpectedTwilioSignature(
      "secret",
      `${publicUrl}/twilio/voice`,
      params,
    );
    const response = await fetch(`${base}/twilio/voice`, {
      method: "POST",
      headers: { "x-twilio-signature": signature },
      body: new URLSearchParams(params),
    });
    expect(response.status).toBe(200);
  });
});
