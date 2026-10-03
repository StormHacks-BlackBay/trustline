# CLAUDE-SHARED.md

Shared context for the coding assistants (Claude or otherwise) used by both members of team Black Bay. Read this before making changes, and update it when a decision below changes.

- **Team:** Ariel Tyson (`arieltyson`) and Rishon Ghosh (`rishon-g`)
- **Repo:** `StormHacks-BlackBay/trustline`, default branch `main`
- **Running log of changes:** [`docs/team-sync.md`](docs/team-sync.md). Add an entry there after any change your teammate's assistant should know about.

## Current decisions (source of truth)

### LLM provider: Google Gemini API (preferred path)

Risk scoring and translated explanations now run on **Google Gemini**, not Anthropic Claude. This replaced the earlier Claude Haiku 4.5 integration on October 3, 2026.

| What           | Now                                                                  | Before (do not reintroduce)            |
| -------------- | -------------------------------------------------------------------- | -------------------------------------- |
| Scoring module | `api/_gemini.ts` → `scoreTranscript()`                               | `api/_claude.ts` → `scoreWithClaude()` |
| Transport      | Plain `fetch` to `generateContent` (REST), no SDK                    | `@anthropic-ai/sdk`                    |
| Default model  | `gemini-3.5-flash-lite` (free tier, low latency)                     | `claude-haiku-4-5`                     |
| Env vars       | `GEMINI_API_KEY`, optional `GEMINI_MODEL`                            | `ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL` |
| Key source     | Free key from [Google AI Studio](https://aistudio.google.com/apikey) | Anthropic Console                      |

How it works:

- Gemini is asked for JSON constrained by a `responseSchema` that mirrors `RiskAssessmentSchema` in `src/lib/schemas.ts`. **If you change `RiskAssessmentSchema`, update `RESPONSE_SCHEMA` in `api/_gemini.ts` to match.** Zod still validates every response.
- The prompt is unchanged and provider-neutral: `api/_scoring-prompt.ts`.
- Callers: `api/score.ts` (Vercel route), `server/analysingSession.ts` (call server), `eval/run.ts` (via `/api/score`).
- Error contract is unchanged: `ScoreOutcome` with `scoring_not_configured` (503), `scoring_rate_limited` (429), `scoring_aborted` (499), `scoring_unavailable` / `scoring_failed` (502/504). The browser treats 503 as "basic mode" and falls back to the rules layer.
- 8 second timeout, and stale requests are cancelled with `AbortSignal`.

Rules for assistants:

- Do not add `@anthropic-ai/sdk` back or add another provider SDK without asking. `@google/genai` is deliberately not used; REST keeps dependencies unchanged.
- Keys stay server-side. Never prefix them with `VITE_`. `.env` is git-ignored; never commit a key.
- Free-tier caveat: Google may use free-tier prompts to improve its products. Use scripted demo calls, not real ones, until the team moves to a paid key. This is stated in `PRIVACY.md`.
- Free-tier rate limits are per model (see AI Studio). The rules layer must keep working when Gemini is unavailable.

**Verification status:** CI passes on `main`, but the Gemini path has not yet been run end to end against the live API (the environment that made the change could not reach Google). First person with a key: run `npm run check` and `npm run eval` with `GEMINI_API_KEY` in `.env`, record the result in `docs/team-sync.md`, and update this line.

**Superseded:** `docs/shared-plans/TrustLine-Secure-API-Setup-Plan.md` was written for the Claude setup. Its security advice (server-only keys, spending caps, kill switch) still applies; its provider, model and env var names do not.

## Project conventions (quick reference)

Full details are in `README.md`, `PRIVACY.md`, `ACCESSIBILITY.md` and `DESIGN.md`.

- React + TypeScript (strict) on Vite; serverless routes in `api/`; long-running call server in `server/`.
- Feature folders (`src/features/call`, `src/features/partner`); shared logic in `src/lib`.
- Design values come from tokens; reuse shared components in `src/components`.
- WCAG 2.2 AA is a requirement, not a stretch goal.
- Before pushing: `npm run check` (typecheck, lint, tests, build). CI also runs `npm run eval`.
- Commits use Conventional Commit style, e.g. `feat(scoring): …`, `fix(a11y): …`.

## How to use this file and the log

1. At the start of a session, read this file and the newest entries in `docs/team-sync.md`.
2. After a change that affects the other person (new dependency, env var, API contract, file move, provider or model change, anything in this file), add an entry to `docs/team-sync.md`.
3. If a decision above changes, edit it here too, so this file always describes the current state.
