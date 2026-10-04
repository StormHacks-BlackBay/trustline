# CLAUDE-SHARED.md

Shared context for the coding assistants (Claude or otherwise) used by both members of team Black Bay. Read this before making changes, and update it when a decision below changes.

- **Team:** Ariel Tyson (`arieltyson`) and Rishon Ghosh (`rishon-g`)
- **Repo:** `StormHacks-BlackBay/trustline`, default branch `main`
- **Vercel project owner:** Rishon (`rishon-g`). On the Hobby plan only the owner can deploy, so deployments and environment variables go through him. Guide: `docs/shared-plans/TrustLine-Vercel-Deployment-Guide.md`.
- **Public demo (hosted on Ariel's accounts):** site https://trustline-blackbay.vercel.app (Vercel project `trustline-blackbay`, team `black-bay2`); call server https://call-server-production-6115.up.railway.app (Railway project `trustline-calls`, service `call-server`, free trial, no card). The Twilio number's webhook points at Railway. The repo is public and both are connected to GitHub: a push to `main` deploys the site, and redeploys the call server when `railway.json`'s watch paths change (which clears in-memory call summaries). Env vars live in Vercel (Production and Preview) and Railway, not the repo. Rishon's `black-bay1` Vercel project is not the demo site. Guide: `docs/shared-plans/TrustLine-Public-Demo-Hosting-Guide.md`.
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
- `/api/score` takes an optional `source`: `"call"` (default, `SCORING_SYSTEM_PROMPT`) or `"message"` (`MESSAGE_SYSTEM_PROMPT`, used by the message check page). Both prompts list every flag in `FLAG_IDS`, which a test enforces.
- Error contract is unchanged: `ScoreOutcome` with `scoring_not_configured` (503), `scoring_rate_limited` (429), `scoring_aborted` (499), `scoring_unavailable` / `scoring_failed` (502/504). The browser treats 503 as "basic mode" and falls back to the rules layer.
- 8 second timeout, and stale requests are cancelled with `AbortSignal`.

Rules for assistants:

- Do not add `@anthropic-ai/sdk` back or add another provider SDK without asking. `@google/genai` is deliberately not used; REST keeps dependencies unchanged.
- Files loaded by `api/` routes (including `src/lib/schemas.ts`, `src/lib/types.ts`, `src/lib/demoSpeech.ts`, `src/data/demoCalls.ts`) must use `.js` extensions in relative imports, e.g. `from "./_http.js"`. Vercel runs them as native ES modules and crashes on extensionless imports. `api/_imports.test.ts` enforces this.
- Keys stay server-side. Never prefix them with `VITE_`. `.env` is git-ignored; never commit a key.
- Free-tier caveat: Google may use free-tier prompts to improve its products. Use scripted demo calls, not real ones, until the team moves to a paid key. This is stated in `PRIVACY.md`.
- Free-tier rate limits are per model (see AI Studio). The rules layer must keep working when Gemini is unavailable.

**Verification status:** verified end to end against the live Gemini API on 2026-10-03 with `gemini-3.5-flash-lite` (`npm run eval`: rules + LLM precision 100%, recall 100%, 0/6 false positives; median scoring latency 1130 ms, p90 1362 ms). Free-tier keys are rate limited per minute: `npm run eval` spaces its requests (`EVAL_SPACING_MS`, default 4500) and backs off on 429. Note `gemini-2.5-flash-lite` is no longer available to new users.

**Setup plan:** `docs/shared-plans/TrustLine-Secure-API-Setup-Plan.md` has been revised for Gemini (key creation, free-tier limits, env vars, costs).

### Database: Supabase project `trustline-stormhacks` (demo access, no sign-in)

- Project ref `tixwegxffiuouvrjavra`, region `us-east-1`, Free plan. URL `https://tixwegxffiuouvrjavra.supabase.co`.
- Created with **Enable Data API** on, **Automatically expose new tables** off and **Enable automatic RLS** on. Because tables are not exposed automatically, every table the browser uses needs an explicit `grant` in a migration.
- Migrations `0001` to `0004` and `supabase/seed.sql` are applied. `0004_government_partner.sql` adds the `government` partner kind and the `cafc` partner. `0003_demo_anon_grants.sql` grants the `anon` role only what `src/lib/store/supabaseStore.ts` uses: read partners and directory, read and insert incidents, read and insert advisories. Updates and deletes are refused.
- This is demo access: anyone with the site's public key can read reports and publish advisories. Use fictional demo calls only. The partner sign-in in `docs/shared-plans/Supabase-Setup-Guide.md` section 5 replaces it; renumber that migration to `0005` because `0004` is taken.
- Browser env vars: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (holds the `sb_publishable_...` key, which is public by design). Never put the database password, a `sb_secret_...` key or `service_role` key in any `VITE_` variable.
- The repo is linked with the Supabase CLI (`supabase/config.toml`). Apply new migrations with `supabase db push`; preview first with `supabase db push --dry-run`.

### Product structure: the number first, the website for partners

- The product is the TrustLine phone number. The web app's routes: `/` home page built around the number, `/after-call/:id` call summary, `/live` live call view and demo calls, `/check` message check, `/recover` recovery steps, `/partner` partner portal.
- When a merged call ends, the call server saves a `CallSummary` (`src/lib/callSummary.ts`) in memory (`server/archive.ts`, one day, max 200), emits a `call_summary` event before `call_ended`, serves it at `GET /calls/:id`, and, if the call was warned, texts the caller the summary link (`server/sms.ts`). The text needs `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER` (or `VITE_TRUSTLINE_NUMBER`) and a real `APP_ORIGIN`; without them no text is sent and nothing else breaks.
- The call summary page shares reports with the **Canadian Anti-Fraud Centre** (`cafc`, kind `government`, `AFTER_CALL_PARTNER_ID` in `src/data/partners.ts`), which appears in the partner portal's Organization dropdown. The live call view and message check still share with the demo user's own organization.
- The web app has no demo user picker: it always follows `DEMO_USERS[0]` (`harpreet`), the call server's default. Map demo phones to `harpreet` in `PHONE_LINKS`. Its default warning language is English: the call server uses it when no `/live` page has chosen a language since the server started.
- SMS reverses Ariel's earlier "no SMS" decision. Confirm with him before the demo.
- Adding a warning sign (flag): add it to `FLAG_IDS` (`src/lib/types.ts`), `FLAG_PRIORITY` (`src/lib/flagText.ts`), `FLAG_LABELS_BY_LANGUAGE` (`src/lib/i18n/warning.ts`) and `reasons.ts` in all five languages, the `FLAGS` list in `api/_scoring-prompt.ts`, `FLAG_SITUATIONS` in `src/data/recovery.ts` and, if it fits, `advisory.ts` tactics. Tests check that each list is complete. `upfront_fee` (fees for jobs, LMIAs, work permits) is the newest.

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
