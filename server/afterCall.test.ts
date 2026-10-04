import type { AddressInfo } from "node:net";
import { afterEach, describe, expect, it } from "vitest";
import type { CallEvent } from "../src/lib/callEvents";
import { CallSummarySchema } from "../src/lib/callSummary";
import { AnalysingCallSession, type AnalysisDeps, type Scorer } from "./analysingSession";
import { createCallServer } from "./app";
import { CallArchive } from "./archive";
import { loadConfig } from "./config";
import { EventHub } from "./hub";
import { LanguagePreferences } from "./preferences";
import { fakeTranscriber, fakeTwilioStream, waitFor } from "./testing";

const servers: { close: () => void }[] = [];
afterEach(() => servers.splice(0).forEach((s) => s.close()));

const unavailable: Scorer = async () => ({
  ok: false,
  error: "scoring_not_configured",
  status: 503,
});

async function start(env: Record<string, string> = {}) {
  const hub = new EventHub();
  const languages = new LanguagePreferences();
  languages.set("harpreet", "en");
  const transcriber = fakeTranscriber();
  const archive = new CallArchive();
  const texts: { to: string; body: string }[] = [];
  const server = createCallServer<AnalysisDeps>(
    {
      config: loadConfig({ PORT: "0", APP_ORIGIN: "https://trustline.example.org", ...env }),
      hub,
      languages,
      createTranscriber: transcriber.factory,
      speaker: null,
      score: unavailable,
      archive,
      sms: async (to, body) => {
        texts.push({ to, body });
      },
    },
    (ws, deps) => new AnalysingCallSession(ws, deps),
  );
  servers.push(server);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const { port } = server.address() as AddressInfo;
  const events: CallEvent[] = [];
  hub.subscribe("harpreet", (e) => events.push(e));
  return { base: `http://127.0.0.1:${port}`, server, transcriber, archive, texts, events };
}

describe("after-call summary", () => {
  it("saves a warned call, serves it to the web app and texts the caller the link", async () => {
    const { base, server, transcriber, texts, events } = await start();
    const call = await fakeTwilioStream(server, "+16045550100");
    await waitFor(() => transcriber.ready());
    transcriber.say("This is the Canada Revenue Agency.");
    transcriber.say("You must pay the balance with Google Play gift cards.");
    await waitFor(() => events.some((e) => e.type === "warning"));
    call.stop();
    await waitFor(() => texts.length === 1);

    const summaryEvent = events.find((e) => e.type === "call_summary");
    expect(summaryEvent?.type).toBe("call_summary");
    const summaryId = summaryEvent?.type === "call_summary" ? summaryEvent.summaryId : "";
    expect(events.map((e) => e.type).slice(-2)).toEqual(["call_summary", "call_ended"]);

    const response = await fetch(`${base}/calls/${summaryId}`);
    expect(response.status).toBe(200);
    expect(response.headers.get("access-control-allow-origin")).toBe(
      "https://trustline.example.org",
    );
    const summary = CallSummarySchema.parse(await response.json());
    expect(summary.userId).toBe("harpreet");
    expect(summary.segments).toHaveLength(2);
    expect(summary.warning?.risk).toBe("high");

    expect(texts[0]?.to).toBe("+16045550100");
    expect(texts[0]?.body).toContain(`https://trustline.example.org/after-call/${summaryId}`);
    call.close();
  });

  it("saves a call without a warning but does not text about it", async () => {
    const { server, transcriber, texts, events } = await start();
    const call = await fakeTwilioStream(server, "+16045550100");
    await waitFor(() => transcriber.ready());
    transcriber.say("Hi, it's your dentist confirming your appointment on Tuesday.");
    call.stop();
    await waitFor(() => events.some((e) => e.type === "call_ended"));
    expect(events.some((e) => e.type === "call_summary")).toBe(true);
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(texts).toEqual([]);
    call.close();
  });

  it("does not text when the web app's address is unknown", async () => {
    const { server, transcriber, texts, events } = await start({ APP_ORIGIN: "" });
    const call = await fakeTwilioStream(server, "+16045550100");
    await waitFor(() => transcriber.ready());
    transcriber.say("Pay the fine with Google Play gift cards right now.");
    await waitFor(() => events.some((e) => e.type === "warning"));
    call.stop();
    await waitFor(() => events.some((e) => e.type === "call_ended"));
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(texts).toEqual([]);
    call.close();
  });

  it("returns 404 for unknown or malformed summary ids", async () => {
    const { base } = await start();
    expect((await fetch(`${base}/calls/does-not-exist`)).status).toBe(404);
    expect((await fetch(`${base}/calls/..%2Fsecret`)).status).toBe(404);
  });
});

describe("CallArchive", () => {
  const summary = (endedAt: string) => ({
    userId: "harpreet",
    language: "en" as const,
    startedAt: endedAt,
    endedAt,
    segments: ["Hello"],
    warning: null,
  });

  it("gives each call a different unguessable id", () => {
    const archive = new CallArchive();
    const a = archive.save(summary(new Date().toISOString()));
    const b = archive.save(summary(new Date().toISOString()));
    expect(a.id).not.toBe(b.id);
    expect(a.id).toMatch(/^[0-9a-f-]{36}$/);
    expect(archive.get(a.id)?.segments).toEqual(["Hello"]);
  });

  it("forgets calls after the time limit", () => {
    let now = Date.parse("2026-10-03T12:00:00Z");
    const archive = new CallArchive(60_000, 10, () => now);
    const saved = archive.save(summary("2026-10-03T12:00:00Z"));
    now += 61_000;
    expect(archive.get(saved.id)).toBeNull();
  });

  it("keeps only the newest calls past the limit", () => {
    const archive = new CallArchive(60 * 60_000, 2);
    const first = archive.save(summary(new Date().toISOString()));
    archive.save(summary(new Date().toISOString()));
    archive.save(summary(new Date().toISOString()));
    expect(archive.get(first.id)).toBeNull();
  });
});
