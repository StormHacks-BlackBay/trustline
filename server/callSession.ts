import type { WebSocket } from "ws";
import type { CallEvent } from "../src/lib/callEvents";
import { userForCaller, type ServerConfig } from "./config";
import type { EventHub } from "./hub";
import type { Transcriber, TranscriberFactory } from "./transcriber";
import { TwilioMessageSchema } from "./twilioProtocol";

export interface SessionDeps {
  config: ServerConfig;
  hub: EventHub;
  createTranscriber: TranscriberFactory;
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
  private transcriber: Transcriber | null = null;
  private pendingAudio: string[] = [];
  private ended = false;

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
    this.userId = userForCaller(this.deps.config, from);
    this.emit({ type: "call_started", callId: callSid, at: new Date().toISOString() });

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
    this.transcriber?.close();
    if (this.userId) this.emit({ type: "call_ended", callId: this.callId });
    this.onEnd();
  }

  protected onEnd(): void {}
}
