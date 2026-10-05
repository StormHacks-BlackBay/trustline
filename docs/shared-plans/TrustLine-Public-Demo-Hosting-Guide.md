# TrustLine: hosting the demo publicly

Written October 4, 2026 for team Black Bay. This guide moves TrustLine off the laptop so anyone can call the number and open the site, with addresses that stay the same until the event is over.

Until now, phone calls only worked while Ariel's laptop ran the call server and a Cloudflare quick tunnel. A quick tunnel's address changes every time it restarts, so each restart meant updating `PUBLIC_URL`, the Twilio webhook and `APP_ORIGIN`. The after-call text also linked to `localhost`, which does not open on a phone.

## Shut down after StormHacks (October 5, 2026)

To stop all charges, the hosted demo was taken down:

- **Twilio:** the number +1 604-373-6537 was released. The account has no numbers.
- **Railway:** the `trustline-calls` project was deleted (final removal on October 7).
- **Vercel:** `GEMINI_API_KEY`, `ELEVENLABS_API_KEY`, `VITE_CALL_SERVER_URL` and `VITE_TRUSTLINE_NUMBER` were removed from Production and Preview. The site at https://trustline-blackbay.vercel.app stays up for free in basic mode (rules only, browser voice, no phone calls). Only the public Supabase values remain.

To bring it back, follow steps 1 to 4 below with new keys and a new Twilio number. The section after this one records how it was set up during the event.

## Setup during the event (October 4, 2026)

Steps 1 to 3 below are done, all on Ariel's accounts. The repo is public and both hosts deploy automatically from `main`:

| Piece       | Where                                                                                                         | Notes                                                                                                                                                                      |
| ----------- | ------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Web app     | https://trustline-blackbay.vercel.app (Vercel project `trustline-blackbay`, team `black-bay2`, Hobby)         | Public. Connected to GitHub: every push to `main` deploys production, and other branches and pull requests get preview links                                               |
| Call server | https://call-server-production-6115.up.railway.app (Railway project `trustline-calls`, service `call-server`) | Connected to GitHub: a push to `main` redeploys it only when `railway.json`'s watch paths change (`server/`, `api/`, `src/lib/`, `src/data/`, `Dockerfile`, package files) |
| Twilio      | `+1 604-373-6537` → `POST https://call-server-production-6115.up.railway.app/twilio/voice`                    | Calls no longer reach the laptop. To develop locally with real calls, point the webhook back at a tunnel and set it back afterwards                                        |

**Cost:** Railway is on the free trial ($5 of credit, no card on file), so it cannot bill; when the credit runs out the server stops. Watch it with `railway usage`. Do not add a card unless the team decides to pay. Vercel Hobby is free. Twilio, ElevenLabs and Gemini usage is unchanged from local testing.

**Deploying:** push to `main`. Anyone with push access can deploy, because Vercel Hobby allows collaborators on public repos. Watch progress in the Vercel and Railway dashboards, or with `vercel ls --scope black-bay2` and `railway service status --service call-server`. Railway checks `/health` before switching to a new build, so a broken build does not replace a working server.

Environment variables are not in the repo. Vercel has them for Production and Preview; Railway has them on the `call-server` service. Changing one needs Ariel or Ariel's assistant (with `vercel env` or `railway variable set`), then a redeploy.

To deploy without a push (for example after changing a variable): `vercel deploy --prod --scope black-bay2` from a checkout, and `railway service redeploy --service call-server`.

Call summaries are kept in the call server's memory, so a call server redeploy clears them. Avoid pushing changes under `server/`, `api/`, `src/lib/` or `src/data/` during the demo.

## What runs where

```
Caller's phone ──▶ Twilio number +1 604-373-6537
                        │ POST /twilio/voice, then live audio over /twilio/media
                        ▼
               Call server on Railway (always on)        https://<call-server>.up.railway.app
                 Scribe transcribes, rules and Gemini score,
                 ElevenLabs speaks the warning, Twilio texts the summary link
                        │ /events (live updates), /calls/:id (summaries)
                        ▼
               Web app on Vercel                         https://<vercel production URL>
                 /live, /after-call/:id, /partner, /check, /recover
```

| Piece       | Host                   | Why                                                                                                                                                                                |
| ----------- | ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Web app     | Vercel (Rishon's team) | Already deployed there                                                                                                                                                             |
| Call server | Railway (recommended)  | Holds Twilio's WebSocket open for the whole call, so it cannot run on Vercel functions. Deploys the existing `Dockerfile` from GitHub and gives a fixed `*.up.railway.app` address |
| Database    | Supabase (unchanged)   | Already hosted                                                                                                                                                                     |

Other call server hosts:

- **Fly.io** works the same way with the `Dockerfile`. Turn off auto-stop (`auto_stop_machines = "off"`, `min_machines_running = 1`), or the first call after a quiet period fails.
- **Render's free tier is not suitable.** It sleeps when idle and takes much longer to wake than Twilio waits for the webhook, so callers would hear an error.
- **A named Cloudflare tunnel** gives the laptop a permanent address, but needs a domain on Cloudflare and the laptop has to stay on and awake for the whole event.

Check each host's current pricing before you sign up. At the time of writing, Railway's Hobby plan is about US$5 a month, which covers a server this size.

## Before you start

- The call server fix `fix(server): wait for Scribe to connect before sending call audio` must be on `main`. Without it, the server crashes on the first call.
- Have the values from the laptop's `.env` ready. Do not paste keys into chat, issues or commits.
- Only the Vercel project owner (Rishon) can change Vercel settings on the Hobby plan, so step 3 is his.

## Step 1: deploy the call server on Railway (Ariel)

1. Sign in at [railway.com](https://railway.com) with GitHub and create a project: **Deploy from GitHub repo** → `StormHacks-BlackBay/trustline`. Railway finds the `Dockerfile` and builds it. Give it access to the repo if asked.
2. Open the service → **Variables** and add:

   | Variable              | Value                                                                                         |
   | --------------------- | --------------------------------------------------------------------------------------------- |
   | `PORT`                | `8787`                                                                                        |
   | `ELEVENLABS_API_KEY`  | Same as `.env`                                                                                |
   | `GEMINI_API_KEY`      | Same as `.env`                                                                                |
   | `TWILIO_ACCOUNT_SID`  | Same as `.env`                                                                                |
   | `TWILIO_AUTH_TOKEN`   | Same as `.env`. Required on a public server: it rejects calls and streams Twilio did not sign |
   | `TWILIO_PHONE_NUMBER` | `+16043736537` (the number the after-call text comes from)                                    |
   | `PHONE_LINKS`         | Same as `.env`, e.g. `{"+16045550100":"harpreet"}`                                            |
   | `MAX_CALL_MINUTES`    | `10`                                                                                          |
   | `PUBLIC_URL`          | Fill in after step 3 below, e.g. `https://trustline-calls.up.railway.app`. No trailing slash  |
   | `APP_ORIGIN`          | Fill in after step 3, the Vercel production URL. No trailing slash                            |

3. **Settings → Networking → Generate Domain**, target port `8787`. Copy the address into `PUBLIC_URL`.
4. Redeploy if Railway does not do it on its own after the variable change, then check:

   ```bash
   curl https://<call-server>.up.railway.app/health   # prints ok
   ```

   The deploy log should show `TrustLine call server on :8787 (public URL https://<call-server>.up.railway.app)`.

`PUBLIC_URL` must match the address exactly. Twilio signs each request with the URL it called, and a mismatch rejects every call with a 403.

## Step 2: point Twilio at the hosted server (Ariel)

1. Twilio console → **Phone Numbers → Manage → Active numbers** → `+1 604-373-6537` → **Configure**.
2. **A call comes in**: Webhook, `https://<call-server>.up.railway.app/twilio/voice`, **HTTP POST**. Leave the backup URL empty. Save.

From now on calls do not touch the laptop. Stop the local `npm run server` and `cloudflared` so there is only one server.

## Step 3: make the Vercel site public and connect it (Rishon)

1. **Settings → Deployment Protection → Vercel Authentication: off** (or "Only Preview Deployments", which keeps previews private and opens production). Today every deployment URL redirects visitors to a Vercel sign-in page, including the repo's homepage link.
2. **Settings → Domains**: note the production URL. Do not use `trustline.vercel.app`: that name belongs to an unrelated company. Share the URL with Ariel for `APP_ORIGIN`.
3. **Settings → Environment Variables** (Production):

   | Variable                                      | Value                                  |
   | --------------------------------------------- | -------------------------------------- |
   | `VITE_CALL_SERVER_URL`                        | `https://<call-server>.up.railway.app` |
   | `VITE_TRUSTLINE_NUMBER`                       | `+16043736537`                         |
   | `GEMINI_API_KEY`, `ELEVENLABS_API_KEY`        | Same keys as the call server           |
   | `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` | Check they are already set             |

4. **Redeploy production.** `VITE_` values are fixed at build time, so the change does nothing until the next build.
5. Update the repo homepage to the production URL:

   ```bash
   gh repo edit StormHacks-BlackBay/trustline --homepage "https://<vercel production URL>"
   ```

Then Ariel sets `APP_ORIGIN` on Railway to the production URL. The call server allows exactly one web origin, both for live call events and for the link in the text.

## Step 4: test end to end

1. Open `https://<vercel production URL>/live` on a laptop, ideally in a private window to confirm there is no sign-in. Pick the warning language. Wait for **"Ready: merged calls will appear on this screen."**
2. From a phone, call `+1 604-373-6537` and read a fictional scam script. The transcript and warning appear on `/live`, and TrustLine speaks the warning on the call.
3. Hang up. Within a few seconds the phone gets a text. Its link opens `/after-call/<id>` on the phone with the transcript and next steps.
4. Try a merged call: call a teammate, **Add Call**, dial TrustLine, **Merge Calls**.

## Things to know on demo day

- **Callers who are not in `PHONE_LINKS`** are treated as the default demo user (Harpreet, or `DEFAULT_USER_ID`). That lets judges call from their own phones, but every such call shows on the same `/live` screen.
- **Summaries live in the call server's memory** for one day (up to 200). Redeploying or restarting Railway clears them, so do not redeploy between a demo call and opening its link.
- **One web origin.** With `APP_ORIGIN` set to Vercel, `localhost` no longer gets live call events from the hosted server. For local development, run the call server locally with its own `.env`.
- **Spending.** The site and the number are public: every call spends Twilio, ElevenLabs and Gemini credit. `MAX_CALL_MINUTES` caps each call. Check balances in each console before the demo, and set a usage limit in Railway.
- **Privacy.** Gemini is on the free tier, where Google may use prompts to improve its products. Use scripted demo calls, not real conversations (see `PRIVACY.md`).
- **SMS.** The after-call text reverses the earlier "no SMS" decision. Ariel confirms before the demo.

## After the event

- Release the Twilio number (**Phone Numbers → Active numbers → Release**) to stop the monthly charge.
- Delete the Railway project, or remove its keys.
- Turn Vercel Authentication back on if the site should go private again.
- Clear demo data in Supabase: `supabase db query --linked "delete from public.advisories; delete from public.incidents;"`

## Troubleshooting

| Symptom                                                             | Likely cause                                                                       | Fix                                                                                      |
| ------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Caller hears "an application error has occurred"                    | Twilio could not reach the webhook (Twilio debugger shows 11200)                   | `curl <call-server>/health`; check the webhook URL ends in `/twilio/voice` and uses POST |
| Caller hears "not equipped for incoming service" and the call drops | The webhook returned an error, or the server crashed during the call               | Check the Railway deploy logs for a stack trace                                          |
| Twilio debugger shows 403                                           | `PUBLIC_URL` does not exactly match the Railway address, or the Auth Token differs | Fix `PUBLIC_URL` (https, no trailing slash) and redeploy                                 |
| Call works but `/live` shows nothing                                | `APP_ORIGIN` is not the exact Vercel URL, or Vercel was not rebuilt                | Match `APP_ORIGIN`; check `VITE_CALL_SERVER_URL` in Vercel and redeploy                  |
| Text arrives but its link shows "not found" or opens a sign-in page | Server restarted since the call, or Vercel Authentication is still on              | Make a new call; turn off Vercel Authentication                                          |
| No text arrives                                                     | Call had no warning, or `TWILIO_ACCOUNT_SID` / `APP_ORIGIN` is missing on Railway  | The server logs a line at startup when texts are off                                     |
| Server log shows `Could not start transcription`                    | ElevenLabs key missing, out of credit, or Scribe unreachable                       | Check the key and the ElevenLabs usage page                                              |
