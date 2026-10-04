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

### 2026-10-03: Demo call voices are acted with Eleven v3 audio tags (Rishon)

- **What changed:** `DemoCall` has an optional `spoken` array: the same lines with Eleven v3 audio tags and pauses, e.g. `[sternly] If this is not resolved today, you will be detained... and deported.` The transcript, detection and sharing still use `lines`. The voice uses `spoken` through `spokenText()` in `src/lib/demoSpeech.ts`. `api/demo-speech.ts` now defaults to `eleven_v3` (override with `ELEVENLABS_DEMO_TTS_MODEL`) and logs ElevenLabs' error reason (for example `missing_permissions`) without the key.
- **What the other person needs to do:** if you edit a demo line, edit its `spoken` version too. A test checks that both have the same words, so the transcript always matches the audio. The audio regenerates automatically.
- **Verified:** CI (`npm run check`). Rishon confirmed ElevenLabs voices play locally; the v3 tagged versions are new.

### 2026-10-03: Demo calls are read aloud (Rishon)

- **What changed:** demo calls now speak each line, and the transcript words appear in time with the voice. New `api/demo-speech.ts` (GET) voices a single line of `DEMO_CALLS` with ElevenLabs text to speech. It only accepts lines that exist, checked with a hash from `src/lib/demoSpeech.ts`, and it returns cacheable mp3s, so Vercel's CDN serves repeat plays without calling ElevenLabs again. Each caller has its own stock voice, and there's a fallback voice. New `src/features/call/demoVoice.ts` plays the clips; without `ELEVENLABS_API_KEY` it falls back to the browser's speech synthesis, then to silent timing. `useReplayTranscript` gained `readAloud` / `setReadAloud`, saved in localStorage as `trustline.readDemoCallsAloud`, and the Demo calls card has a "Read demo calls aloud" checkbox, on by default. New optional env var `ELEVENLABS_DEMO_TTS_MODEL` (default `eleven_multilingual_v2`).
- **Why:** the demos were text only; hearing the caller makes them more immersive for judges.
- **What the other person needs to do:** nothing. If you change a demo line, its audio regenerates automatically because the hash in the URL changes. If you add a demo call, add its voice to `CALLER_VOICES` in `api/demo-speech.ts`, or it uses the fallback voice.
- **Verified:** new unit tests for the route (`api/_demo-speech.test.ts`, underscore so Vercel doesn't deploy it) and the URL helper. Full `npm run check` ran in CI. Not yet heard against the live ElevenLabs API or on an iPhone.

### 2026-10-03: Gemini path verified against the live API (Ariel)

- **What changed:** `eval/run.ts` now spaces Gemini requests (`EVAL_SPACING_MS`, default 4500 ms) and retries on 429 with backoff. Without this, the free tier rate-limited the eval after a few requests and it crashed. Updated the verification line in `CLAUDE-SHARED.md`.
- **Why:** first live run with a Gemini key, as `CLAUDE-SHARED.md` asked.
- **What the other person needs to do:** nothing. The Gemini key is in Ariel's local `.env` only; ask Ariel if you need one, or create your own free key in AI Studio.
- **Verified:** `npm run eval` with `gemini-3.5-flash-lite`:

  | Setup          | Warn at | Precision | Recall | False positives |
  | -------------- | ------- | --------- | ------ | --------------- |
  | Rules only     | medium+ | 100%      | 91%    | 0/6             |
  | Rules only     | high    | 100%      | 73%    | 0/6             |
  | Rules + Gemini | medium+ | 100%      | 100%   | 0/6             |
  | Rules + Gemini | high    | 100%      | 100%   | 0/6             |

  Gemini raised `immigration-interac` from low to high (the case the rules miss) and both medium cases to high. Scoring latency: median 1130 ms, p90 1362 ms. A direct request also confirmed `gemini-2.5-flash-lite` is no longer available to new users, so keep `gemini-3.5-flash-lite`.

- **Open questions:** during a live call, the app and the call server each score every phrase, so a long call could hit the free tier's per-minute limit. When that happens the app shows "Basic mode" for that phrase and the rules still warn. The cases were written alongside the rules, so treat these numbers as optimistic.

### 2026-10-03: Twilio phone call guide and a call server config fix (Ariel)

- **What changed:** added `docs/shared-plans/TrustLine-Twilio-Phone-Call-Guide.md` (Twilio account, number, verified phones, Cloudflare quick tunnel, webhook, `.env` settings, test call script, demo-day hosting options, troubleshooting). Fixed `server/config.ts`: blank `.env` lines such as `PUBLIC_URL=` are now treated as unset, and trailing slashes are removed from `PUBLIC_URL` and `APP_ORIGIN`. Before this, a blank `PUBLIC_URL` produced an empty media stream address.
- **What the other person needs to do:** pull `main`. Nothing else until we run the guide together; one phone plays the user and one plays the scammer.
- **Verified:** `npm run check` passes (110 tests, including two new config tests). The guide has not been run against Twilio yet.

### 2026-10-03: Supabase onboarding guide for Rishon (Ariel)

- **What changed:** added `docs/shared-plans/Supabase-Teammate-Onboarding.md`: what Supabase does in TrustLine, and the steps to accept the invite, install and link the CLI, configure `.env`, check it works, and make database changes.
- **What the other person needs to do:** follow the guide once Ariel sends the Supabase invite (it expires after 24 hours).
- **Verified:** documentation only; commands match the ones used to set up the project.

### 2026-10-03: Supabase project live with demo access (Ariel)

- **What changed:** created Supabase project `trustline-stormhacks` (ref `tixwegxffiuouvrjavra`, `us-east-1`, Free). Added `supabase/config.toml` (Supabase CLI, linked locally) and `supabase/migrations/0003_demo_anon_grants.sql`. Applied migrations `0001` to `0003` and the seed. Details are in `CLAUDE-SHARED.md` under "Database".
- **Why:** reports and advisories need to sync across separate devices for the demo.
- **What the other person needs to do:** to use Supabase locally, add `VITE_SUPABASE_URL=https://tixwegxffiuouvrjavra.supabase.co` and `VITE_SUPABASE_ANON_KEY` (the publishable key from Supabase, Settings, API Keys) to your `.env`. To run migrations yourself, ask Ariel for dashboard access, then `supabase login` and `supabase link --project-ref tixwegxffiuouvrjavra`. Add the same two variables in Vercel once the site is deployed.
- **Verified:** dry run, then `supabase db push --include-seed`. Through the public API: partners and all 13 directory entries readable, incident insert works, delete and update refused. Realtime is enabled for `incidents` and `advisories`, and RLS is on for all four tables. In the app, with three isolated browser profiles: a shared report reached the partner dashboard in 105 ms and the advisory reached a credit union member in 731 ms. Test rows were deleted afterwards; the database starts empty.
- **Open questions:** the anonymous demo access should be replaced by the partner sign-in (Supabase guide section 5) before any public launch.

### 2026-10-03: Rishon owns the Vercel project (Rishon)

- **What changed:** the Vercel deployment guide and `CLAUDE-SHARED.md` now name Rishon as the Vercel project owner (they previously assumed Ariel). The guide's CLI step now uses `npx vercel@latest` or Homebrew instead of a global npm install.
- **What the other person needs to do:** ask Rishon for redeploys or environment variable changes. Don't create a second Vercel project.

### 2026-10-03: Vercel deployment guide added (Ariel)

- **What changed:** added `docs/shared-plans/TrustLine-Vercel-Deployment-Guide.md`. Nothing has been deployed yet.
- **Why:** the team needs a public HTTPS link for phones, judges and Devpost. Vercel's free Hobby plan cannot deploy from a private repository owned by a GitHub organization, so the guide offers three routes: deploy from the CLI now (repo stays private, only the project owner can deploy), make the repo public and connect GitHub (free, auto-deploys from both of us), or Vercel Pro.
- **What the other person needs to do:** nothing yet. Agree on when to make the repo public; Devpost judges need to see the code anyway.
- **Verified:** the secret scan in the guide was run on the full history: no keys found. The deployment steps have not been run.
- **Open questions:** the `api/` routes import local files without extensions under `"type": "module"`, which may fail on Vercel with `ERR_MODULE_NOT_FOUND`. Check on the first preview deployment (see the guide's Troubleshooting).

### 2026-10-03: Design pass, spoken official number, keyboard fixes (Ariel)

- **What changed:**
  - Spoken warnings now end with the verified official number ("You can hang up and call IRCC yourself at 1 888 242 2100") in all five languages. No text messages: the team decided to leave SMS out. `DirectoryEntry` gained a `shortName` field, with `supabase/migrations/0002_directory_short_name.sql` and a regenerated `supabase/seed.sql`.
  - Design system: self-hosted Atkinson Hyperlegible Next (`@fontsource-variable/atkinson-hyperlegible-next`, new dependency), warmer palette, full token scale in `src/styles/global.css`, and `DESIGN.md` describing the rules. Component CSS must use tokens only.
  - New shared components in `src/components`: `AppShell` (header, navigation, skip link, page titles), `Logo`, `Chip`/`ChipList`, `Alert` (with `takeFocus` for confirmations), `Field`/`Select`/`Input`/`TextArea`, `ButtonLink`.
  - Call screen: two columns from 60rem. `WarningCard` and `VerifiedContact` were replaced by `WarningHero` (the warning with its one primary action, calling the official number, and the share action) and `CallerDetails`. `CallAnalysis` now takes a render function that returns `main` and `side` parts.
  - Partner dashboard: overview sidebar with summary numbers and published advisories. `useAdvisories` moved to `src/hooks/`.
  - Accessibility: the transcript no longer uses `scrollIntoView`, which moved Chrome's keyboard starting point past the navigation. Focus now moves to the confirmation after sharing or publishing.
- **Why:** the app only looked right on phones, looked generic, and the spoken warning promised a text message that would not be sent.
- **What the other person needs to do:** run `npm install` for the font package. Run the Supabase `0002` migration and the regenerated seed if you set up Supabase before this.
- **Verified:** `npm run check` passes (108 tests). Browser checks at 320, 390, 1280 and 1440px: no horizontal scrolling. axe-core reports no violations on every screen in light and dark themes. A keyboard-only walkthrough of both flows passes. Phone-call flow rehearsed with `npm run simulate:call` (rules only; no Gemini or ElevenLabs key here).
- **Open questions:** VoiceOver and TalkBack still need testing on a real phone.

### 2026-10-03: API setup plan revised for Gemini (Rishon)

- **What changed:** `docs/shared-plans/TrustLine-Secure-API-Setup-Plan.md` now describes Gemini instead of Claude Haiku 4.5: creating a free-tier key in AI Studio with no billing account, restricting it to the Generative Language API, `GEMINI_API_KEY` / `GEMINI_MODEL`, free-tier data use, and $0 cost capped by rate limits.
- **What the other person needs to do:** follow section 5 of the plan if you need your own key. Keys still go only in local `.env`, Vercel and the call server host, never in the repo.

### 2026-10-03: Risk scoring moved from Claude to the Gemini API free tier (Rishon)

- **What changed:** `api/_claude.ts` was replaced by `api/_gemini.ts` (`scoreTranscript()`), which calls Gemini `generateContent` over REST with a response schema and validates the result with Zod. `api/score.ts`, `server/analysingSession.ts`, `server/index.ts` and `eval/run.ts` use it. `@anthropic-ai/sdk` was removed. README, PRIVACY, SUBMISSION and `.env.example` were updated.
- **Why:** use a free API for the hackathon instead of paid Anthropic credits.
- **What the other person needs to do:** run `npm install` (the lockfile dropped the Anthropic SDK). Replace `ANTHROPIC_API_KEY` / `ANTHROPIC_MODEL` with `GEMINI_API_KEY` (free from https://aistudio.google.com/apikey) and optionally `GEMINI_MODEL` in `.env`, in Vercel, and on the call server host.
- **Verified:** code review and a standalone strict TypeScript check of `api/_gemini.ts`. CI on `main` passed (`npm run check`: typecheck, lint, tests, build; plus rules-only `npm run eval`). Not yet run against the live Gemini API (the environment could not reach Google).
- **Open questions:** run `npm run eval` with a key and record rules + LLM precision, recall and latency here. Decide whether `gemini-3.5-flash-lite` is accurate enough or whether `gemini-3.5-flash` is worth the extra latency.

### 2026-10-03: Shared context files added (Rishon)

- **What changed:** added `CLAUDE-SHARED.md` (current decisions), `CLAUDE.md` (imports it so Claude Code loads it automatically) and this log.
- **What the other person needs to do:** nothing. Assistants should read `CLAUDE-SHARED.md` at the start of a session and add entries here.
