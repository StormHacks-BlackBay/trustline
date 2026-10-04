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

### 2026-10-04: Repo is public; pushes to main deploy automatically (Ariel)

- **What changed:** `StormHacks-BlackBay/trustline` is now public. The Vercel project `trustline-blackbay` and the Railway service `call-server` are connected to GitHub (Vercel and Railway GitHub apps installed on the org). Every push to `main` deploys the site; other branches and pull requests get Vercel preview links. New `railway.json`: the call server builds from the `Dockerfile`, redeploys only when `server/`, `api/`, `src/lib/`, `src/data/`, the `Dockerfile` or package files change, and must pass `/health` before it replaces the running server. Vercel env vars now exist for Preview as well as Production.
- **Why:** Vercel Hobby only deploys the owner's commits from private repos; collaboration is free on public repos. A secret scan of the full history (every branch, plus the actual `.env` values) found no keys.
- **What the other person needs to do:** Rishon, just push to `main`; your commits deploy too. Env var changes still go through Ariel. A push touching the call server's paths restarts it and clears in-memory call summaries, so avoid those during the demo. Your email is visible on your commits now that the repo is public.
- **Verified:** see the push that added this entry: Vercel and Railway both deployed from it.

### 2026-10-04: English is the default warning language (Rishon)

- **What changed:** the default demo user (`harpreet` in `src/data/partners.ts`) now has language `en` instead of `pa`. The live call view and message check start in English, and the call server warns in English (spoken warning and after-call text) when no `/live` page has picked a language since it started.
- **Why:** a judge calling the number with nobody on `/live` heard a Punjabi warning and got a Punjabi text.
- **What the other person needs to do:** redeploy the call server and site for it to take effect. Browsers that already picked a language keep it.
- **Verified:** `npm run check` passes.

### 2026-10-04: No advisory banner on the live call view; partners email or text members (Rishon)

- **What changed:** removed `AdvisoryBanner` (component and CSS) from the live call view. In the partner portal, each published advisory's "Send to members" now opens `SendToMembers` (`src/features/partner/SendToMembers.tsx`) with **Email members** and **Text members**. Both are demo only: nothing is sent, and the sheet says so. `PublishAdvisory` copy now says advisories go to every partner, who pass them on by email or text.
- **Why:** the banner was confusing on the live view; members hear about advisories from their own organization instead.
- **What the other person needs to do:** nothing. `useAdvisories` is still used by the partner portal.
- **Verified:** `npm run check` passes (187 tests). Not yet clicked through in a browser.

### 2026-10-04: No demo user picker; call summaries share with the Anti-Fraud Centre (Rishon)

- **What changed:**
  - The live call view and message check no longer show the Harpreet/Mei picker, only the warning language. `useCaller()` always uses `DEMO_USERS[0]` (`harpreet`) and returns its `partner`.
  - `ShareIncident` and `CallAnalysis` take the partner to share with (`partner` / `shareWith`) instead of a `DemoUser`.
  - The call summary page (`/after-call/:id`, the after-call text's link) shares with a new partner, **Canadian Anti-Fraud Centre** (`cafc`, new `PartnerKind` `government`). It appears in the partner portal's Organization dropdown; for it, the "Report to the Anti-Fraud Centre" action is hidden.
  - `supabase/migrations/0004_government_partner.sql` widens `partners_kind_check` and adds the row; `supabase/seed.sql` regenerated.
- **Why:** the user picker confused people, and sending reports to the government's fraud centre strengthens the Goal 17 (public sector) story.
- **What the other person needs to do:** nothing for Supabase: `0004` is applied to `trustline-stormhacks`. Callers mapped to `mei` in `PHONE_LINKS` no longer appear on the live view.
- **Verified:** `npm run check` passes (187 tests). `supabase db push` applied `0004`; the public API lists `cafc` as a `government` partner. Not yet clicked through in a browser.

### 2026-10-04: TrustLine is hosted publicly: Vercel site and Railway call server (Ariel)

- **What changed:**
  - Web app: new Vercel project `trustline-blackbay` in Ariel's Hobby team `black-bay2`, public at https://trustline-blackbay.vercel.app. Production env vars: `GEMINI_API_KEY` and `ELEVENLABS_API_KEY` (sensitive), `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_TRUSTLINE_NUMBER`, `VITE_CALL_SERVER_URL`.
  - Call server: Railway project `trustline-calls`, service `call-server`, at https://call-server-production-6115.up.railway.app, built from the `Dockerfile`, with `APP_ORIGIN` set to the Vercel site.
  - Twilio's voice webhook for `+1 604-373-6537` now points at Railway. Calls no longer reach a laptop.
  - Both are deployed with the CLIs from a `git archive` of `main`, so local `.env` files are never uploaded. Neither is connected to GitHub: a push does not deploy. See "Current setup" in the hosting guide.
- **Why:** the demo had to work without Ariel's laptop and a quick tunnel, and the after-call text has to open on a phone. Rishon's Vercel project sits behind Vercel Authentication and only its owner can change it on the Hobby plan.
- **What the other person needs to do:** Rishon, use https://trustline-blackbay.vercel.app as the demo site; step 3 of the hosting guide is no longer needed from you. Your `black-bay1` project can stay or be deleted, but let's not demo from both. To test real calls against your own laptop, you would have to repoint the Twilio webhook; tell Ariel first.
- **Cost:** Railway is on its free trial ($5 credit, no card), so it cannot bill; it stops when the credit runs out. Vercel Hobby is free.
- **Verified:** site pages return 200 without sign-in; `POST /api/score` returned a valid Gemini assessment; the call server answers `/health`, rejects unsigned webhooks with 403, and `/events` sends `access-control-allow-origin: https://trustline-blackbay.vercel.app`; the deployed bundle points at the Railway URL.
- **Open questions:** a real phone call against the hosted setup still needs a manual test. Rishon, your public `trustline-gamma.vercel.app` (deployed 17:26 UTC) points its live calls at a Cloudflare quick tunnel, which stops working when that tunnel restarts, and Twilio now sends calls to Railway. The README and the repo homepage now use `trustline-blackbay.vercel.app`; let's agree on one site.

### 2026-10-04: Call server crash fix and a public hosting guide (Ariel)

- **What changed:**
  - `server/transcriber.ts`: the ElevenLabs SDK's `realtime.connect()` resolves before the socket opens, so the first audio chunk threw "WebSocket is not connected" and crashed the call server on every real call. It now waits for the socket to open (10 second timeout; earlier audio stays buffered in `pendingAudio`), and a dropped connection is logged once instead of throwing.
  - New `docs/shared-plans/TrustLine-Public-Demo-Hosting-Guide.md`: call server on Railway with the existing `Dockerfile`, Twilio webhook pointed at it, Vercel made public and connected with `VITE_CALL_SERVER_URL`.
- **Why:** real calls crashed the server. And the demo depended on the laptop and a quick tunnel whose address changes on restart, while the after-call text linked to `localhost`.
- **What the other person needs to do:** Rishon, please do step 3 of the hosting guide: turn off Vercel Authentication (every deployment URL currently redirects to a Vercel sign-in), set `VITE_CALL_SERVER_URL` and `VITE_TRUSTLINE_NUMBER`, redeploy, and send Ariel the production URL. Note `trustline.vercel.app` belongs to an unrelated company.
- **Verified:** `npm run check`. A live Scribe connection opened in 142 ms and streamed audio without errors. A real phone call to the Twilio number was transcribed, warned out loud, and texted the summary link.
- **Open questions:** Railway vs Fly.io for the call server (guide recommends Railway).

### 2026-10-04: TrustLine joins calls silently (Rishon)

- **What changed:** removed the spoken "TrustLine is listening" greeting from `server/twiml.ts`. TrustLine now says nothing until it warns. The home page, `PRIVACY.md`, the README and the Twilio guide are updated, and a test checks the TwiML has no `<Say>`.
- **Why:** the greeting tipped off scammers before TrustLine could hear the scam. The user who merges TrustLine in is a party to the call, which is what Canada's one-party consent rule requires.
- **What the other person needs to do:** restart the call server to pick it up. Ariel, this reverses your announce-on-join choice. Say if you object.
- **Verified:** CI.

### 2026-10-03: The number is the product; after-call text, summary page and partner portal (Rishon)

- **What changed:** the site is restructured around Goals 8 and 17.
  - `/` is a new home page built around the TrustLine number. The old call screen moved to `/live` ("Live call view").
  - The call server saves each merged call (`server/archive.ts`, in memory, one day), serves it at `GET /calls/:id`, emits a new `call_summary` SSE event, and texts the caller a link to `/after-call/:id` when the call was warned (`server/sms.ts`).
  - New call summary page (`src/features/afterCall`) with the transcript, evidence, amount asked for, recovery link and one-tap reporting.
  - The partner dashboard is now the "Partner portal": money at risk (`src/lib/money.ts`), trends by tactic and language, "Send to members", a pre-filled CAFC report, and a CSV export.
  - New warning sign `upfront_fee` for fees for jobs, LMIAs and work permits (Goal 8.8), in rules, both Gemini prompts and five languages, plus a `job-scam` demo call, a job offer example message and an eval case.
  - Hyphenated words now count as one word in demo voice sync.
- **Why:** a user had no reason to visit the website. Now the phone number does the work during the call, the website is where the user lands after it, and organizations use the portal.
- **What the other person needs to do:**
  - Ariel: SMS reverses your earlier no-SMS decision. Say if you object.
  - For the text to send, set `TWILIO_ACCOUNT_SID`, `TWILIO_PHONE_NUMBER` and a real `APP_ORIGIN` in the call server's `.env` on the laptop.
  - Rishon: set `VITE_CALL_SERVER_URL` and `VITE_TRUSTLINE_NUMBER` on Vercel and redeploy.
  - The demo now opens `/live` instead of `/`.
- **Verified:** CI (typecheck, lint, tests including `server/afterCall.test.ts`, build). Rules output checked locally for the new demo call, example and eval case. The real SMS has not been tested on a handset.
- **Open questions:** summaries are lost when the call server restarts. The recovery guide and home page are English only.

### 2026-10-03: Vercel functions fixed: .js import extensions (Rishon)

- **What changed:** on the deployed site, every `api/` route crashed on load with `ERR_MODULE_NOT_FOUND`, because `"type": "module"` makes Node require file extensions on relative imports. Live listening ("Could not start live transcription"), the ElevenLabs demo voices (fell back to browser voices) and Gemini scoring all failed in production but worked locally. Relative imports in the 10 files the routes load now end in `.js`. TypeScript, Vite and Vitest map these to the `.ts` files. New `api/_imports.test.ts` fails CI on any extensionless runtime import in that graph. Rule added to `CLAUDE-SHARED.md`.
- **What the other person needs to do:** use `.js` in relative imports in any file an `api/` route loads.
- **Verified:** CI. Needs a redeploy to confirm on Vercel.

### 2026-10-03: Light theme only (Rishon)

- **What changed:** removed the dark palette (`DARK` in `src/styles/tokens.ts`) and the `prefers-color-scheme: dark` switch in `theme.ts`. `color-scheme` is `light` and the browser theme colour is white. The app always uses the warm light palette from the README screenshots, even when the device is in dark mode. DESIGN.md and ACCESSIBILITY.md are updated.
- **What the other person needs to do:** nothing. Don't add dark-mode styles.
- **Verified:** CI (contrast tests now cover the one palette).

### 2026-10-03: The warning and share flow follow the chosen language (Rishon)

- **What changed:** new `src/lib/i18n/warning.ts` holds `WARNING_TEXT` (warning statuses, next-step sentences with `{org}` and `{phone}`, recovery link, share button, consent sheet, confirmation), `RISK_LABELS` and `FLAG_LABELS_BY_LANGUAGE` for all five languages. `WarningHero` and `ShareIncident` use them and set `lang` and `dir`, so Farsi is right to left. `RiskBadge` takes an optional `language`, `flagLabel(flag, language)` is in `flagText.ts`, and `Sheet` takes optional `lang` and `dir`. `FLAG_LABELS` (English) is unchanged for the partner dashboard. The English line and the quoted caller or message words stay English. The rest of the UI chrome is still English by design.
- **What the other person needs to do:** if you add text to the warning or share flow, add it to all five languages in `warning.ts`. A test checks completeness and matching placeholders. Non-English strings are drafted and need native review.
- **Verified:** CI.

### 2026-10-03: Plain demo voices and a simpler recovery list (Rishon)

- **What changed:** removed the acted `spoken` scripts (the `[sternly]`-style audio tags and pauses) from `src/data/demoCalls.ts`, because they didn't sound good. Voices now read `lines` exactly as written; the optional `spoken` field and its word-match test remain in case someone wants it later. The recovery guide's steps are a plain numbered list without tick boxes; the "What happened?" choices are unchanged.
- **What the other person needs to do:** nothing.
- **Verified:** CI.

### 2026-10-03: Message check, recovery guide and a suspicious link warning sign (Rishon)

- **What changed:**
  - New flag `suspicious_link` in `FLAG_IDS`. Rules catch URLs, bare domains and "click the link"; it is a request flag, so link plus pressure rates high. It has labels, an advisory tactic, `REASONS` in all five languages (non-English drafted, needs native review) and a line in both prompts. A new secrecy pattern catches "don't tell Mom/Dad/your husband". The only eval change is the grandparent scam gaining `secrecy`.
  - `/api/score` accepts `source: "call" | "message"`, default `call`. `scoreTranscript(transcript, language, signal, source)` on both server and client, and `useRiskEngine(segments, language, source)`.
  - `/check` (`src/features/message/MessageCheck.tsx`): paste a message to get the same warning, evidence highlights, verified contacts and consent sharing as a call. `WarningHero`, `CallerDetails` and `ShareIncident` take an optional `context` (`"call"` default) that only changes wording. There are example messages in `src/data/exampleMessages.ts`, and a test ensures the rules alone warn on the scam examples.
  - `/recover` (`src/features/recovery/RecoveryGuide.tsx`, content in `src/data/recovery.ts`): a checklist of what to do after paying or sharing details, following the CAFC victim guidance. A test checks that phone numbers come only from `DIRECTORY`. Medium and high warnings link to it with situations preselected (`situationsForFlags`). The guide is English only, like the rest of the UI chrome.
  - Navigation now has four items and wraps on small screens.
  - CI runs typecheck, lint, test and build as separate steps. Lint errors and failing tests show up as annotations on the commit.
- **What the other person needs to do:** pull `main`. If you add a flag, update both prompts (a test checks this), `REASONS`, `FLAG_LABELS`, the advisory `TACTICS` and, if relevant, `FLAG_SITUATIONS` in `src/data/recovery.ts`.
- **Verified:** CI green (typecheck, lint, tests, build, eval). Rules checked against the eval cases and demo calls. Not yet clicked through in a browser.

### 2026-10-03: Live Twilio number and audible simulator warnings (Ariel / Codex)

- **What changed:** approved Individual Trust Hub profile verified through Twilio. Provisioned **+1 604-373-6537** (the earlier planned number was unavailable). Ariel owns the account. The local ignored `.env` links Ariel's phone to Harpreet and sets the new number, local call server, public tunnel and 10-minute cap. Existing verified caller IDs were preserved.
- **Costs:** pricing API confirms US$1.15/month and US$0.0085/min incoming local calls. Media Streams adds US$0.0044/min per Twilio's Canada pricing page; ElevenLabs is separate. Only one number was bought, no outbound calls were placed, and no auto-recharge changes were made. Release the number after the event to stop future monthly rental.
- **Simulator:** saves warning audio as WAV and mu-law under ignored `demo/recordings/`, plays it with macOS `afplay`, and caches identical text/language/voice/model across runs. `SIMULATOR_PLAY_AUDIO=0` disables playback. Gemini was disabled for the rehearsal; one Punjabi warning was synthesized.
- **Verified:** `npm run check` passed (139 tests); public unsigned webhook returned 403, signed webhook returned valid TwiML, and the signed public WebSocket connected without starting paid transcription. Signed simulator produced the Punjabi IRCC warning and its audio file. A real handset call still needs testing; no claim of live phone transcription verification.
- **What the other person needs to do:** pull main. Local app: `http://localhost:5173`, Harpreet selected. Call the new number from Ariel's linked phone; merge with the scripted demo call. The current quick tunnel and server depend on Ariel's laptop remaining awake. A new tunnel URL requires updating both local `PUBLIC_URL` and the number's POST `/twilio/voice` webhook. Hosted Vercel configuration was not changed.

### 2026-10-03: Demo transcript synced to the voice; abandoned Gemini calls cancelled (Rishon)

- **What changed:**
  - `api/demo-speech.ts` now calls ElevenLabs `/with-timestamps` and returns JSON `{ audio, wordStarts }`, where `audio` is a base64 mp3 and `wordStarts` holds each transcript word's start time in seconds (tags skipped, see `wordStartTimes` in `src/lib/demoSpeech.ts`). If a model rejects timestamps, it returns plain audio with `wordStarts: null`. The response format is part of the URL hash (`speechHash`), so the CDN never serves the old mp3 responses.
  - `demoVoice.ts` reveals words from `audio.currentTime` every 40 ms instead of timers, so the text cannot drift from the speech. Browser voices use `onboundary` word events. `speak()` now takes a `reveal(wordCount)` callback.
  - `api/score.ts` passes `request.signal` to `scoreTranscript`, and the vite dev API aborts it when the browser disconnects. Before this, superseded scoring requests kept running against Gemini, piled up on the free tier and caused "Gemini request timed out after 8000 ms".
- **What the other person needs to do:** nothing.
- **Verified:** CI (`npm run check`, eval) on both commits. Word-timing logic checked against every demo line. Not yet listened to live after this change.

### 2026-10-03: Call server security and spending limits (Ariel)

- **What changed:** the call server now rejects the Twilio media stream (WebSocket) unless it carries a valid `X-Twilio-Signature` for the exact `wss://` URL, whenever `TWILIO_AUTH_TOKEN` is set. Before, anyone who found the server could stream audio and spend ElevenLabs and Gemini credit. Calls are also cut off after `MAX_CALL_MINUTES` (default 10). `npm run simulate:call` signs its fake stream, so it exercises the same check.
- **Twilio status:** Ariel's account is upgraded with a US$20 balance; both phones are verified caller IDs. Buying a number is blocked until Twilio approves a Trust Hub primary customer profile (error 20003; Twilio says review can take 72 hours or more). Nothing has been charged. The planned number is +1 604-337-2943 at US$1.15 a month plus US$0.0085 a minute. Until then, demo the phone flow with `npm run simulate:call`.
- **What the other person needs to do:** pull `main`. Do not run a public tunnel to the call server without `TWILIO_AUTH_TOKEN` set.
- **Verified:** 129 tests pass, including unsigned, wrongly signed and correctly signed streams and the length limit. The signed simulator ran end to end with paid APIs switched off.

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
