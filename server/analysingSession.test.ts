import type { AddressInfo } from "node:net";
import { afterEach, describe, expect, it } from "vitest";
import type { CallEvent } from "../src/lib/callEvents";
import type { RiskAssessment } from "../src/lib/schemas";
import { AnalysingCallSession, type AnalysisDeps, type Scorer } from "./analysingSession";
import { createCallServer } from "./app";
import { loadConfig } from "./config";
import { EventHub } from "./hub";
import { LanguagePreferences } from "./preferences";
import type { Speaker } from "./speaker";
import { fakeTranscriber, fakeTwilioStream, waitFor } from "./testing";

const servers: { close: () => void }[] = [];
afterEach(() => servers.splice(0).forEach((s) => s.close()));

const unavailable: Scorer = async () => ({
  ok: false,
  error: "scoring_not_configured",
  status: 503,
});

async function start(
  options: { speaker?: Speaker | null; score?: Scorer; language?: "en" | "pa" } = {},
) {
  const hub = new EventHub();
  const languages = new LanguagePreferences();
  languages.set("harpreet", options.language ?? "en");
  const transcriber = fakeTranscriber();
  const synthesized: string[] = [];
  const speaker: Speaker = {
    synthesize: async (text) => {
      synthesized.push(text);
      return Buffer.alloc(12000, 0xff);
    },
  };
  const server = createCallServer<AnalysisDeps>(
    {
      config: loadConfig({ PORT: "0" }),
      hub,
      createTranscriber: transcriber.factory,
      languages,
      speaker: options.speaker === undefined ? speaker : options.speaker,
      score: options.score ?? unavailable,
    },
    (ws, deps) => new AnalysingCallSession(ws, deps),
  );
  servers.push(server);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const events: CallEvent[] = [];
  hub.subscribe("harpreet", (e) => events.push(e));
  const call = await fakeTwilioStream(server as { address: () => AddressInfo }, "+16045550100");
  await waitFor(() => transcriber.ready());
  return { transcriber, call, events, synthesized };
}

describe("AnalysingCallSession", () => {
  it("speaks one warning into the call as soon as the rules see a hard signal", async () => {
    const { transcriber, call, events, synthesized } = await start();
    transcriber.say("This is the Canada Revenue Agency.");
    transcriber.say("You must pay the balance with Google Play gift cards.");
    transcriber.say("Also buy bitcoin.");
    await waitFor(() => events.some((e) => e.type === "warning"));
    await waitFor(() => call.outbound.some((m) => (m as { event: string }).event === "mark"));

    const media = call.outbound.filter((m) => (m as { event: string }).event === "media");
    expect(media).toHaveLength(2); // 12000 bytes in 8000 byte chunks
    expect(synthesized).toHaveLength(1);
    expect(synthesized[0]).toContain("gift cards");
    const warning = events.find((e) => e.type === "warning");
    expect(warning).toMatchObject({ risk: "high", spoken: true });
    call.close();
  });

  it("stays silent on an ordinary call", async () => {
    const { transcriber, call, events } = await start();
    transcriber.say("Hi, this is the pharmacy. Your prescription is ready for pickup.");
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(events.some((e) => e.type === "warning")).toBe(false);
    expect(call.outbound).toHaveLength(0);
    call.close();
  });

  it("warns in the user's language", async () => {
    const { transcriber, call, synthesized } = await start({ language: "pa" });
    transcriber.say("Pay the fine with gift cards now.");
    await waitFor(() => synthesized.length === 1);
    expect(synthesized[0]).toContain("ਟਰੱਸਟਲਾਈਨ");
    call.close();
  });

  it("warns when only the LLM sees the scam", async () => {
    const assessment: RiskAssessment = {
      risk: "high",
      flags: ["wire_transfer"],
      claimedOrg: "immigration office",
      evidenceQuotes: ["send an Interac payment"],
      explanation: "They asked you to send money to keep your application open.",
      explanationEnglish: "They asked you to send money to keep your application open.",
    };
    const { transcriber, call, events } = await start({
      score: async () => ({ ok: true, assessment }),
    });
    transcriber.say("You need to send an Interac payment of eight hundred dollars to our officer.");
    await waitFor(() => events.some((e) => e.type === "warning"));
    expect(events.find((e) => e.type === "warning")).toMatchObject({
      text: expect.stringContaining("keep your application open"),
    });
    call.close();
  });

  it("still sends the warning to the app when speech is unavailable", async () => {
    const { transcriber, call, events } = await start({ speaker: null });
    transcriber.say("Read me the verification code we just texted you.");
    await waitFor(() => events.some((e) => e.type === "warning"));
    expect(events.find((e) => e.type === "warning")).toMatchObject({ spoken: false });
    expect(call.outbound).toHaveLength(0);
    call.close();
  });
});
