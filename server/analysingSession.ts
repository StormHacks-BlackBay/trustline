import type { WebSocket } from "ws";
import { scoreTranscript, type ScoreOutcome } from "../api/_gemini";
import { findOrganization } from "../src/lib/directory";
import { ruleReason } from "../src/lib/flagText";
import { fuse, type Assessment } from "../src/lib/fusion";
import { spokenWarning } from "../src/lib/i18n/spoken";
import { runRules } from "../src/lib/rules";
import { recentWindow } from "../src/lib/transcript";
import type { LanguageCode } from "../src/lib/types";
import { CallSession, type SessionDeps } from "./callSession";
import type { Speaker } from "./speaker";
import { markMessage, mediaMessage } from "./twilioProtocol";

export type Scorer = (
  transcript: string,
  language: LanguageCode,
  signal: AbortSignal,
) => Promise<ScoreOutcome>;

export interface AnalysisDeps extends SessionDeps {
  speaker: Speaker | null;
  score?: Scorer;
}

// One second of 8 kHz mu-law per media message.
const CHUNK_BYTES = 8000;

/**
 * A call session that scores the call as it happens and, the first time it looks like a scam,
 * speaks a short warning into the call in the user's language.
 */
export class AnalysingCallSession extends CallSession {
  private warned = false;
  private inFlight: AbortController | null = null;

  constructor(
    ws: WebSocket,
    private readonly analysis: AnalysisDeps,
  ) {
    super(ws, analysis);
  }

  protected override onSegment(): void {
    const transcript = this.segments.map((s) => s.text).join("\n");
    const language = this.analysis.languages.get(this.userId);
    const rules = runRules(transcript);

    // Hard rule hits warn immediately; the LLM only adds context.
    const rulesOnly = fuse({ transcript, rules, llm: null });
    if (rulesOnly.risk === "high") void this.warn(rulesOnly, language);

    this.inFlight?.abort();
    const controller = new AbortController();
    this.inFlight = controller;
    const window = recentWindow(this.segments.map((s, i) => ({ ...s, committedAt: i })));
    const score = this.analysis.score ?? scoreTranscript;

    score(window, language, controller.signal)
      .then((outcome) => {
        if (controller.signal.aborted || !outcome.ok) return;
        const combined = fuse({
          transcript,
          rules,
          llm: {
            assessment: outcome.assessment,
            coversWholeCall: window.length >= transcript.length,
          },
        });
        if (combined.risk === "high") void this.warn(combined, language);
      })
      .catch((error: unknown) => console.error(`Scoring failed on ${this.callId}`, error));
  }

  private async warn(assessment: Assessment, language: LanguageCode): Promise<void> {
    if (this.warned) return;
    this.warned = true;
    const reason = assessment.explanation ?? ruleReason(assessment.flags, language);
    const transcript = this.segments.map((s) => s.text).join("\n");
    const organization = findOrganization(transcript, assessment.claimedOrg);
    const text = spokenWarning(language, reason, organization);

    let spoken = false;
    const { speaker } = this.analysis;
    if (speaker && this.streamSid && this.ws.readyState === this.ws.OPEN) {
      try {
        const audio = await speaker.synthesize(text, language);
        for (let i = 0; i < audio.length; i += CHUNK_BYTES) {
          this.ws.send(
            mediaMessage(this.streamSid, audio.subarray(i, i + CHUNK_BYTES).toString("base64")),
          );
        }
        this.ws.send(markMessage(this.streamSid, "trustline-warning"));
        spoken = true;
      } catch (error) {
        console.error(`Could not speak warning on ${this.callId}`, error);
      }
    }
    this.warning = { risk: assessment.risk, text, spoken };
    this.emit({ type: "warning", callId: this.callId, risk: assessment.risk, text, spoken });
  }

  protected override onEnd(): void {
    this.inFlight?.abort();
  }
}
