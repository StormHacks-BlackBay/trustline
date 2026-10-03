# TrustLine: secure, cost-conscious API setup for StormHacks

> **Revised 2026-10-03:** the team switched contextual scoring from Anthropic Claude Haiku 4.5 to the Google Gemini API free tier (`gemini-3.5-flash-lite`, `GEMINI_API_KEY`, `api/_gemini.ts`). This plan has been updated to match. See [`CLAUDE-SHARED.md`](../../CLAUDE-SHARED.md) for the current decisions.

Prepared October 3, 2026. Repository reviewed: `StormHacks-BlackBay/trustline`, commit `cc6a4a5b1a10e30934b490418a92fbf75cb1dbd9`.

This is an implementation plan, not a claim that the safeguards below have already been installed. No keys were created, purchased, or changed during this review. Prices and account entitlements must be confirmed in your own dashboard before enabling billing.

## 1. Choose the smallest setup that delivers the demo

Use the existing React/Vite application, ElevenLabs Scribe for live transcription, and the Google Gemini API free tier (`gemini-3.5-flash-lite`) for contextual scoring. Start with the existing local data store. Add Supabase only if showing collaboration across separate devices is essential. Avoid Twilio, purchased telephone numbers, a Trulioo integration, and any AI provider beyond Gemini for this weekend: the current app does not require them.

| Component                   | Needed when                                              | Recommended starting choice                                             |
| --------------------------- | -------------------------------------------------------- | ----------------------------------------------------------------------- |
| ElevenLabs API key          | Listening to a microphone live                           | Free allowance; restricted development and judging keys                 |
| Gemini API key              | Contextual scoring and generated translated explanations | Free tier from Google AI Studio, `gemini-3.5-flash-lite`, no billing    |
| ElevenLabs Agents           | An AI plays the caller                                   | Optional; use a teammate or existing transcript replay first            |
| Supabase URL and public key | Sharing between separate devices                         | Optional free project after fixing authorization                        |
| Vercel                      | HTTPS deployment for a phone                             | Use an eligible free deployment; confirm account/repository eligibility |

The zero-provider-cost fallback is already available: scripted transcript replay, rules-based detection, and the local partner dashboard in two tabs of the same browser. It does not provide live transcription or Gemini explanations. Preserve it for judging.

**Security boundary:** long-lived ElevenLabs and Gemini keys must never reach the browser. A single-use Scribe token necessarily reaches the browser in the current design, and Supabase's public key is intentionally public. Those are different from exposing your provider credentials. No system can guarantee that a credential is never compromised; this plan minimizes exposure and limits the damage if it occurs.

## 2. Understand what the repository already does

- `.gitignore` excludes `.env`, `.env.*`, and `.vercel/`, while keeping `.env.example`.
- `api/scribe-token.ts` reads `ELEVENLABS_API_KEY` on the server and returns a single-use token.
- `src/features/call/useLiveTranscript.ts` uses that token with `scribe_v2_realtime`.
- `api/score.ts` calls `api/_gemini.ts`, which reads `GEMINI_API_KEY` server-side and defaults to `gemini-3.5-flash-lite` (override with `GEMINI_MODEL`).
- `vite.config.ts` includes a development API middleware. Consequently, this particular project's `npm run dev` serves the API handlers as well as the UI; a separate API server is not required.
- `scripts/create-demo-agents.ts` reads `.env` and creates two demo agents. These are optional.

The important gaps are:

1. Both provider-backed API routes lack authentication and application rate limits. Someone could consume quota through your server without learning your key.
2. Scribe and scoring error paths can log raw provider errors. Replace these with controlled metadata.
3. `useRiskEngine.ts` scores every committed segment. Aborting the browser request does not guarantee cancellation of the upstream paid request.
4. The Supabase migration explicitly permits anonymous incident reads and anonymous advisory writes. An exposed public key plus these policies grants those operations to anyone.

## 3. Assign ownership and set a budget before generating keys

1. One teammate owns provider billing and deployment; the other owns the UI and verification checklist. Use individual provider logins and MFA where available.
2. Create a dedicated TrustLine project/workspace where supported. Do not reuse keys from another project.
3. Keep credentials in a password manager. Do not paste them into chat, GitHub issues, Devpost, screen recordings, or AI prompts.
4. Give each developer a separately revocable key if both need local live access. If account permissions do not support this affordably, let one teammate operate the live backend and let the other develop using replay. Do not buy team seats solely to share a key.
5. Adopt a suggested weekend target of **US$5 in actual API usage**, with manual review before increasing it. A provider's minimum credit purchase may exceed actual usage; confirm checkout before paying.
6. Disable automatic top-ups and optional overage billing initially. Configure provider-enforced limits where offered, and distinguish those from email alerts, which do not stop spending.

## 4. Create the ElevenLabs key

1. Sign in through the [ElevenLabs website](https://elevenlabs.io/).
2. Open account/workspace API key settings. Create a key named `trustline-dev-yourname`.
3. Restrict it to the capabilities needed for speech-to-text and single-use Scribe token creation. Dashboard scope labels can change: use the narrowest settings that successfully mint a `realtime_scribe` token and start a stream. Do not enable every permission to fix a failed request.
4. Set a small credit quota and an expiry that extends beyond judging. Record the expiry time without recording the key in this document.
5. Store the secret in your password manager, then place it in the local `.env` file privately using the procedure below.
6. Later, create a separate `trustline-judging` key for the deployed backend, with its own quota. Do not reuse your development key.
7. Do not apply a home-IP allowlist to a Vercel key unless you have verified stable outbound IPs. Buying static egress for this demo would add unnecessary cost.

ElevenLabs documents endpoint restrictions, key quotas, expiry, and rotation in its [API key guide](https://elevenlabs.io/docs/overview/administration/workspaces/api-keys). The browser-token endpoint is documented under [Create Single Use Token](https://elevenlabs.io/docs/api-reference/tokens/create).

**Optional demo callers:** the deployed app does not need permission to create Agents. Prefer creating the callers manually in the dashboard. If using `npm run demo:agents`, use a temporary setup key with Agents creation permission locally; revoke it after creation, and restore the restricted transcription key. Never deploy the setup key. A teammate reading a fictional script avoids Agent usage entirely.

## 5. Create the Gemini key

1. Open [Google AI Studio](https://aistudio.google.com/apikey) and sign in with the Google account that will own TrustLine's key.
2. Create the key in a dedicated Google Cloud project named for TrustLine. Do not reuse a project or key from other work.
3. Stay on the free tier: do not attach a billing account. Without billing, usage is capped by the free-tier rate limits and cannot generate a bill. Check the limits for your model on the [AI Studio rate-limit page](https://aistudio.google.com/rate-limit).
4. In the Google Cloud console, restrict the key to the Generative Language API so a leaked key cannot call other Google APIs.
5. Create `trustline-dev-yourname` for local work and a separate `trustline-judging` key for Vercel and the call server, so each can be revoked on its own.
6. Keep the default `gemini-3.5-flash-lite` (leave `GEMINI_MODEL` blank). It is the low-latency free-tier option; try `gemini-3.5-flash` only if `npm run eval` shows the explanations are not good enough.
7. **Free-tier data use:** Google's terms allow free-tier prompts to be used to improve its products. Send only synthetic, scripted calls until the team moves to a paid key. `PRIVACY.md` says this.

See [Gemini API pricing](https://ai.google.dev/gemini-api/docs/pricing) and [rate limits](https://ai.google.dev/gemini-api/docs/rate-limits).

## 6. Configure local development without leaking secrets

Run the following from your actual TrustLine checkout. Do not run the copy command over an existing `.env`; preserve the existing file instead.

```sh
npm ci
cp -n .env.example .env
chmod 600 .env
git check-ignore .env
git ls-files -- .env '.env.*'
```

Expected: `.env` is ignored; only `.env.example` appears among tracked environment files. Gitignore does not protect a file already committed. If a real key was committed previously, revoke it even if the file has since been deleted.

Privately edit `.env` in your editor. Use this structure; replace placeholders only in the ignored local file:

```dotenv
ELEVENLABS_API_KEY=YOUR_LOCAL_SECRET
GEMINI_API_KEY=YOUR_LOCAL_SECRET
GEMINI_MODEL=
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

- Never rename provider variables to `VITE_ELEVENLABS_API_KEY` or `VITE_GEMINI_API_KEY`. Browser-prefixed variables are not secret storage.
- Never place keys in URLs, shell command arguments, `curl` examples, localStorage, React props, source files, or screenshots. Commands entered in a terminal may be saved in history.
- Do not display `.env`, `printenv`, or full environment dumps while sharing your screen. Close the secret file before presenting.
- Keep `.env.example` blank of actual values. A private GitHub repository is not a credential vault.
- Avoid a cloud-synced checkout for local secret files where practical. File permissions do not prevent cloud backup or access by software running as your user.

Start locally:

```sh
npm run dev
```

Use localhost on the development laptop. Do not expose the Vite development server to the hackathon network. Use a deployed HTTPS URL for phone tests; microphone access and concurrent phone-call microphone behavior must be tested on the actual device.

## 7. Protect paid routes before publishing a live demo

These are proposed code changes, not features currently present.

**Simplest deployment arrangement:** keep a public replay-only deployment with no provider keys, and a separate protected live deployment for team-operated judging. This protects your budget without making judges create provider accounts. Confirm access on the exact production, preview, and deployment URLs: Vercel's available protection differs by plan and configuration. See [Deployment Protection](https://vercel.com/docs/deployment-protection).

If you want judges to operate the live site themselves, implement the following before adding production keys:

1. Add a small server-side demo login. Keep a high-entropy demo passphrase or its secure hash in a server-only environment variable; never use a provider API key as the passphrase.
2. On successful login, issue a signed, short-lived session in a `Secure`, `HttpOnly`, `SameSite=Strict` cookie. Keep the signing secret server-side. Do not embed a static bearer credential in JavaScript. Rate-limit the login route itself.
3. Require that session in both `api/scribe-token.ts` and `api/score.ts` before contacting either provider. Missing or expired sessions must return `401` without provider usage.
4. Reject unsupported methods; validate body size, schema, transcript length, and language before making a scoring request. Retain the existing Zod validation. Add same-origin/CSRF protection for cookie-authenticated writes; CORS alone is not authentication.
5. Enforce rate limits server-side. Suggested starting policy: 3 token mints per minute per session; 12 scores per minute per session; 1 in-flight score per session; a 5-minute demo session. Tune against a real rehearsal.
6. Use shared, atomic counters if deployed to serverless instances. An in-memory Map is not a reliable global spending limit across Vercel invocations. Do not add paid infrastructure just for this if a protected team-operated deployment suffices.
7. Bound provider usage separately with key/workspace quotas. A client-side five-minute stop is useful UX, but it cannot prevent a modified client from keeping a direct Scribe connection open.
8. Add server-side kill switches, such as `LIVE_TRANSCRIPTION_ENABLED` and `LLM_SCORING_ENABLED`. Implement checks before provider calls, document their defaults, and test them. Merely setting these new variables will not affect the current code.
9. Replace raw error logging with an allowlist: provider name, HTTP status, internal error code, and request ID. Exclude keys, headers, tokens, prompts, transcripts, request bodies, and entire SDK error objects.
10. Keep the existing `Cache-Control: no-store` on token and scoring responses. Keep temporary tokens in memory and use them immediately; exclude them from analytics and recordings.

If this implementation cannot be completed in time, use replay publicly and protected live judging on your own device. Hiding the live button does not protect the underlying API.

## 8. Reduce scoring and transcription costs

1. Keep rules-based warnings immediate; they cost no provider tokens.
2. Change `useRiskEngine.ts` so new committed segments update rules immediately but LLM scoring runs at most once every five seconds when new text exists. Queue the latest window while a request is running; do not create a paid request per segment and repeatedly cancel it.
3. Deduplicate identical transcript-window and language combinations within the session. Keep any cache private to the session and short-lived.
4. Retain the bounded recent transcript window and schema validation. Measure actual input/output tokens; do not repeatedly send the entire call.
5. Keep the existing 1,024 output-token ceiling initially. Lower it only after testing valid structured responses across the supported languages. Truncated JSON and retries can erase the savings.
6. Stop the microphone stream when the user ends or leaves the call; test unmount and navigation cleanup. Do not leave a rehearsal running while discussing the UI.
7. The Scribe client sends `keyterms`. Confirm whether this option adds cost or has plan restrictions before estimating the total. Remove it only after comparing recognition of the institution names used in your demo.
8. Run most UI checks on replay with both provider keys absent. Enable paid scoring only for focused integration tests and evaluation.

Current published reference prices:

| Service                | Published reference                                               | Practical interpretation                                                                       |
| ---------------------- | ----------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Scribe v2 Realtime     | Free / Pay as you go table lists 2h30 included and $0.39/hour     | Check your actual allowance and add-ons; 30 billable minutes at the base rate is about $0.20   |
| ElevenLabs Agents      | Free plan lists 15 call minutes; model usage is additional        | Optional; avoid repeated Agent rehearsals                                                      |
| Gemini API (free tier) | $0 with no billing account; usage capped by per-model rate limits | Rehearsals cost nothing, but a busy demo can hit the rate limit; the rules layer keeps working |

These are illustrations, not measured TrustLine costs or a guaranteed bill. ElevenLabs product allowances may draw on account credits; do not assume every advertised product allowance is additive. Taxes, add-ons, retries, and credit-purchase minimums can change the total. Sources: [ElevenAPI pricing](https://elevenlabs.io/pricing/api), [Agents pricing](https://elevenlabs.io/pricing/agents), [Gemini API pricing](https://ai.google.dev/gemini-api/docs/pricing).

## 9. Decide whether Supabase is worth adding

**Lowest-cost default:** leave both Supabase variables blank. Demonstrate reporting and publishing with two tabs at the same origin in one browser. This local store does not synchronize a laptop and a phone.

If separate devices are essential:

1. Create a dedicated Supabase project and use synthetic demo incidents only.
2. Obtain its project URL and publishable key from project settings. The existing code calls the public-key variable `VITE_SUPABASE_ANON_KEY`; confirm the installed client accepts the chosen publishable key, or use the legacy anon key if required for compatibility. Never insert a secret or `service_role` key there.
3. Before public access, replace the migration's unrestricted anonymous incident-read and advisory-insert policies. Enabling RLS by itself does not make the current permissive policies safe.
4. Authenticate partner users, map each account to permitted partner IDs in trusted database records, and restrict incident reads to those memberships. Enforce advisory authorship from the authenticated identity, not a caller-supplied publisher ID.
5. Protect incident submission with authenticated session access, validation, and quotas. Public advisory reads can remain intentional. Test two separate partner accounts and a logged-out browser, including direct database requests.
6. Apply the revised migration and seed data only to the dedicated demo project. Add the URL/public key to local and deployment settings, then rebuild.

A public key being visible in DevTools is expected. Supabase authorization must remain correct even when that key is copied. If implementing and testing these policies takes too long, keep the local-store demo. [Supabase API key guidance](https://supabase.com/docs/guides/getting-started/api-keys)

## 10. Deploy and configure secrets privately

1. Review the code and safeguards before deploying. From the checkout, run `npm run check` and replay the main scenario.
2. Create/import the Vercel project and confirm the plan supports your use. Because the repository is organization-owned, verify Git integration eligibility before relying on a free import. Do not make the repository public simply to work around a deployment restriction. If necessary, use a permitted CLI deployment from the trusted checkout or team-operated localhost judging.
3. Configure the Vite build (`npm run build`, output `dist`) and verify the repository's `/api` functions are deployed. Test them on the hosted build; a static-only host is insufficient for live mode.
4. In project Settings → Environment Variables, add `ELEVENLABS_API_KEY`, `GEMINI_API_KEY`, and optionally `GEMINI_MODEL`. Mark secrets Sensitive where supported. Add any session/kill-switch variables only after their checks are implemented.
5. Scope judging keys to the intended deployment environment. Keep public replay deployments and untrusted previews without paid keys. Separate Vercel projects are easier to reason about than relying on branch conventions alone.
6. Redeploy after environment changes. Existing deployment artifacts and browser-prefixed values may retain earlier configuration. Test the new URL and disable obsolete live deployments where possible.
7. Use the provider dashboard for usage monitoring. Do not add real keys to GitHub Actions merely to run ordinary CI. Mock provider calls for CI tests.

Vercel references: [environment variables](https://vercel.com/docs/environment-variables), [Sensitive variables](https://vercel.com/docs/environment-variables/sensitive-environment-variables), [Hobby eligibility](https://vercel.com/docs/plans/hobby).

## 11. Verify before testing with others

Perform this privately, before recording or screen sharing:

- [ ] `git status --short` and the staged diff contain no credentials or private environment files.
- [ ] Scan repository history and working files with a secret scanner configured to redact findings. Never paste matching secret values into issue reports. A clean scan is evidence, not a guarantee.
- [ ] Build the project and inspect browser output/source maps for accidentally bundled secrets. If checking exact key values, load them from the environment in a local script and print only pass/fail and filenames—never put them in command arguments or print matches.
- [ ] In browser Network tools, `/api/scribe-token` returns only a temporary token; no long-lived ElevenLabs key appears in client requests, storage, or responses.
- [ ] `/api/score` returns a validated assessment, never a Gemini key or raw provider error.
- [ ] Logged-out requests to protected paid endpoints are rejected without increasing provider usage. Oversized requests fail before a provider call. Rate-limit tests use mocked provider calls.
- [ ] A missing/revoked key, quota error, or disabled live feature produces a useful fallback without exposing diagnostics containing secrets.
- [ ] No raw transcripts or tokens appear in application/provider-error logs generated by your code. Provider-side data processing is separate: review retention settings if you later handle real calls.
- [ ] The UI still works in replay/rules-only mode without provider keys.
- [ ] HTTPS microphone capture works on the actual judging device. Demonstrate a laptop playing fictional audio into the phone microphone if ordinary on-device cellular calls prevent simultaneous microphone access.
- [ ] If Supabase is enabled, unauthorized accounts cannot read incidents or publish advisories, even through direct requests.

## 12. Judging-day procedure

1. Use synthetic names, numbers, and scripted calls. Get participants' agreement before sending their voices to transcription.
2. Close `.env`, provider dashboards, cloud settings, DevTools, terminal history, and password-manager windows. Share the app window only.
3. Open the protected live app on the team's device and sign in before presenting. Do not expose session cookies or share deployment bypass links publicly.
4. Rehearse one short live call, check remaining ElevenLabs credits and Gemini rate-limit headroom, then stop the stream. Keep the public replay URL ready.
5. Demonstrate the warning → trusted contact → consent → partner advisory flow. Explain when a result uses live AI versus rules/replay.
6. Do not publish credentials or a live-demo passphrase in Devpost. If judges require unattended access, supply a narrowly scoped, expiring app login through the approved private judging channel—not a provider credential.
7. If live services fail, switch to replay and state that clearly. Keep provider configuration off the presentation screen.

## 13. Cleanup and incident response

After judging, revoke the judging and temporary setup keys, disable live endpoints or leave only replay, remove unused agents, and review usage. Delete synthetic incident data when no longer needed. Remove secrets from obsolete deployments and verify old live URLs no longer create paid requests. If keeping the portfolio live, retain the public replay version until proper ongoing authorization and budgets are in place.

If a long-lived key appears in Git, a screenshot, a video, logs, or chat:

1. Revoke it immediately at the provider; disable the affected feature.
2. Review usage and billing, then create a new restricted key.
3. Update private local/deployment settings and redeploy.
4. Remove the leaked material where possible and clean repository history if needed. Deleting the latest file or rewriting history does not invalidate copies of the old key.
5. Re-test the secret boundary and access controls before enabling live mode again.

## Completion criteria

The setup is ready when the live demo works on the judging device, no long-lived provider key reaches the client or repository, unauthorized requests cannot invoke paid services, spending is bounded at the provider, optional database access is enforced by policy, and the no-key replay remains usable. The cheapest reliable route is to use the integrations already written, buy only the usage you need, and avoid adding telephony or database infrastructure unless it materially improves the demonstration.
