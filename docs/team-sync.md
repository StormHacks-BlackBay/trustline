# Team sync log

A running log so each teammate's coding assistant knows what the other person changed. Newest entries go at the top. The current state of decisions lives in [`CLAUDE-SHARED.md`](../CLAUDE-SHARED.md); this file records how it got there.

Add an entry when a change affects the other person: a new dependency or env var, an API or schema change, a moved file, a provider or model change, or anything an assistant would otherwise get wrong.

## Entry template

```md
### YYYY-MM-DD: short title (author)

- **What changed:** files and behaviour
- **Why:**
- **What the other person needs to do:** e.g. add an env var, run npm install, or nothing
- **Verified:** what was run (npm run check, npm run eval, manual test) and the result
- **Open questions:**
```

---

### 2026-10-03: Risk scoring moved from Claude to the Gemini API free tier (Rishon)

- **What changed:** `api/_claude.ts` was replaced by `api/_gemini.ts` (`scoreTranscript()`), which calls Gemini `generateContent` over REST with a response schema and validates the result with Zod. `api/score.ts`, `server/analysingSession.ts`, `server/index.ts` and `eval/run.ts` use it. `@anthropic-ai/sdk` was removed. README, PRIVACY, SUBMISSION and `.env.example` were updated.
- **Why:** use a free API for the hackathon instead of paid Anthropic credits.
- **What the other person needs to do:** run `npm install` (the lockfile dropped the Anthropic SDK). Replace `ANTHROPIC_API_KEY` / `ANTHROPIC_MODEL` with `GEMINI_API_KEY` (free from https://aistudio.google.com/apikey) and optionally `GEMINI_MODEL` in `.env`, in Vercel, and on the call server host.
- **Verified:** code review and a standalone strict TypeScript check of `api/_gemini.ts`. Not yet run against the live Gemini API or through `npm run check` (the environment could not reach Google or npm). CI will run the checks on `main`.
- **Open questions:** run `npm run eval` with a key and record rules + LLM precision, recall and latency here. Decide whether `gemini-3.5-flash-lite` is accurate enough or whether `gemini-3.5-flash` is worth the extra latency.

### 2026-10-03: Shared context files added (Rishon)

- **What changed:** added `CLAUDE-SHARED.md` (current decisions), `CLAUDE.md` (imports it so Claude Code loads it automatically) and this log.
- **What the other person needs to do:** nothing. Assistants should read `CLAUDE-SHARED.md` at the start of a session and add entries here.
