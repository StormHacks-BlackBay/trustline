import type { WebSocket } from "ws";
import type { CallEvent } from "../src/lib/callEvents";
import { afterCallPath, type CallSummary } from "../src/lib/callSummary";
import { AFTER_CALL_SMS } from "../src/lib/i18n/afterCall";
import { fill } from "../src/lib/i18n/warning";
import type { CallArchive } from "./archive";
import { summaryLink, userForCaller, type ServerConfig } from "./config";
import type { EventHub } from "./hub";
import type { LanguagePreferences } from "./preferences";
import type { Transcriber, TranscriberFactory } from "./transcriber";
import type { SmsSender } from "./sms";
import { TwilioMessageSchema } from "./twilioProtocol";

export interface SessionDeps {
  config: ServerConfig;
  hub: EventHub;
  languages: LanguagePreferences;
  createTranscriber: TranscriberFactory;
  /** Keeps finished calls for the after-call page. Without it, calls are not saved. */
  archive?: CallArchive;
  /** Texts the after-call link to the caller after a warned call. */
  sms?: SmsSender | null;
}

export interface Segment {
  id: string;
  text: string;
}

/**
 * One merged phone call: Twilio media in, Scribe transcript out, events to the user's app.
 */
export class CallSession {
  protected streamSid: string | null = null;
  protected callId = "";
  protected userId = "";
  protected readonly segments: Segment[] = [];
  /** Set by the analysing session when it warns, so the summary and text can include it. */
  protected warning: CallSummary["warning"] = null;
  private from: string | null = null;
  private startedAt = "";
  private transcriber: Transcriber | null = null;
  private pendingAudio: string[] = [];
  private ended = false;
  private limit: ReturnType<typeof setTimeout> | null = null;

  constructor(
    protected readonly ws: WebSocket,
    protected readonly deps: SessionDeps,
  ) {
    ws.on("message", (raw) => this.handleMessage(raw.toString()));
    ws.on("close", () => this.end());
    ws.on("error", () => this.end());
  }

  protected emit(event: CallEvent): void {
    this.deps.hub.publish(this.userId, event);
  }

  private handleMessage(raw: string): void {
    let json: unknown;
    try {
      json = JSON.parse(raw);
    } catch {
      return;
    }
    const parsed = TwilioMessageSchema.safeParse(json);
    if (!parsed.success) return;
    const message = parsed.data;

    switch (message.event) {
      case "start":
        void this.start(
          message.streamSid,
          message.start.callSid,
          message.start.customParameters?.from ?? null,
        );
        break;
      case "media":
        if (message.media.track && message.media.track !== "inbound") return;
        if (this.transcriber) this.transcriber.sendAudio(message.media.payload);
        else if (this.pendingAudio.length < 500) this.pendingAudio.push(message.media.payload);
        break;
      case "stop":
        this.end();
        break;
      default:
        break;
    }
  }

  private async start(streamSid: string, callSid: string, from: string | null): Promise<void> {
    this.streamSid = streamSid;
    this.callId = callSid;
    this.from = from;
    this.startedAt = new Date().toISOString();
    this.userId = userForCaller(this.deps.config, from);
    this.limit = setTimeout(() => {
      console.warn(`Call ${callSid} reached the length limit; closing the stream`);
      this.ws.close();
      this.end();
    }, this.deps.config.maxCallMs);
    this.emit({ type: "call_started", callId: callSid, at: this.startedAt });

    try {
      const transcriber = await this.deps.createTranscriber({
        onPartial: (text) => this.emit({ type: "partial", callId: this.callId, text }),
        onCommitted: (text) => this.handleCommitted(text),
        onError: (error) => console.error(`Transcriber error on ${this.callId}`, error),
      });
      if (this.ended) {
        transcriber.close();
        return;
      }
      this.transcriber = transcriber;
      this.pendingAudio.forEach((payload) => transcriber.sendAudio(payload));
      this.pendingAudio = [];
    } catch (error) {
      console.error(`Could not start transcription for ${callSid}`, error);
    }
  }

  private handleCommitted(text: string): void {
    const trimmed = text.trim();
    if (!trimmed) return;
    const segment = { id: `${this.callId}-${this.segments.length}`, text: trimmed };
    this.segments.push(segment);
    this.emit({ type: "segment", callId: this.callId, ...segment });
    this.onSegment(segment);
  }

  /** Called for each committed segment. Overridden by the analysing session. */
  protected onSegment(segment: Segment): void {
    void segment;
  }

  protected end(): void {
    if (this.ended) return;
    this.ended = true;
    if (this.limit) clearTimeout(this.limit);
    this.transcriber?.close();
    const summary = this.saveSummary();
    if (this.userId) {
      if (summary) this.emit({ type: "call_summary", callId: this.callId, summaryId: summary.id });
      this.emit({ type: "call_ended", callId: this.callId });
    }
    this.onEnd();
    if (summary && this.warning) void this.textSummary(summary);
  }

  /** Saves what was said for the after-call page, when there is something to show. */
  private saveSummary(): CallSummary | null {
    const { archive, languages } = this.deps;
    if (!archive || !this.userId || this.segments.length === 0) return null;
    return archive.save({
      userId: this.userId,
      language: languages.get(this.userId),
      startedAt: this.startedAt,
      endedAt: new Date().toISOString(),
      segments: this.segments.map((s) => s.text),
      warning: this.warning,
    });
  }

  /** After a warned call, texts the caller a link to what was said and what to do next. */
  private async textSummary(summary: CallSummary): Promise<void> {
    const { sms, config } = this.deps;
    const link = summaryLink(config, afterCallPath(summary.id));
    if (!sms || !this.from || !link) return;
    try {
      await sms(this.from, fill(AFTER_CALL_SMS[summary.language], { link }));
    } catch (error) {
      console.error(`Could not text the summary for ${this.callId}`, error);
    }
  }

  protected onEnd(): void {}
}
