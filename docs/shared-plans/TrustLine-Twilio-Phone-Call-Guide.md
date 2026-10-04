# TrustLine: setting up real phone calls with Twilio

Written October 3, 2026 for team Black Bay. This guide connects a real Twilio phone number to the TrustLine call server, so a user can add TrustLine to a suspicious call and hear a warning on the call.

Nothing in this guide has been run against Twilio yet. The call server, its tests and `npm run simulate:call` already work; this guide adds the real phone number. Twilio's console labels change from time to time, so if a button name differs, look for the closest match.

## How it works

```
Scammer's phone ─┐
                 ├─ call ── on your phone: Add Call, dial TrustLine, Merge Calls
Your phone ──────┘                                │
                                                  ▼
                          Twilio number (+1 604 ...) receives the merged call
                                                  │ 1. POST /twilio/voice (webhook)
                                                  │ 2. live audio over /twilio/media (WebSocket)
                                                  ▼
             public https URL (Cloudflare tunnel, or a hosted server on demo day)
                                                  │
                                                  ▼
             call server on your laptop: npm run server (port 8787)
               Scribe transcribes, rules (and Gemini) score,
               ElevenLabs speaks the warning back into the call
                                                  │ /events (live updates)
                                                  ▼
             app on your laptop: npm run dev (http://localhost:5173)
               switches to "Phone call" and shows the warning
```

Code that does this, for reference:

| File                                | Role                                                                                  |
| ----------------------------------- | ------------------------------------------------------------------------------------- |
| `server/app.ts`                     | Routes: `POST /twilio/voice`, WebSocket `/twilio/media`, `GET /events`, `GET /health` |
| `server/twiml.ts`                   | Tells Twilio to say "TrustLine is listening" and open a two-way media stream          |
| `server/analysingSession.ts`        | Scores each phrase and speaks the warning once, when risk first turns high            |
| `server/config.ts`                  | Reads the settings below from `.env`                                                  |
| `src/features/call/usePhoneCall.ts` | The app's connection to `/events`                                                     |

## What you need before starting

| Item                                   | Status                 | Notes                                                                                    |
| -------------------------------------- | ---------------------- | ---------------------------------------------------------------------------------------- |
| `ELEVENLABS_API_KEY` in `.env`         | Set on Ariel's machine | **Required.** The call server will not start without it (it transcribes and speaks)      |
| `GEMINI_API_KEY` in `.env`             | Optional               | Without it, calls are scored by the rules layer only. That still catches the demo script |
| Two phones                             |                        | One plays the user (the phone that adds TrustLine), the other plays the scammer          |
| A Canadian mobile number for sign-up   |                        | Twilio trials only call within the country of the number you sign up with                |
| The repo on `main`, `npm install` done |                        |                                                                                          |

**Roles for the test:** Ariel's phone is the user's phone (it adds TrustLine). Rishon's phone (or any second phone) is the scammer. Swap if you prefer; just update `PHONE_LINKS` in step 9.

## Part 1: Twilio account and number (in the browser)

### Step 1: create a Twilio account

1. Go to [twilio.com/try-twilio](https://www.twilio.com/try-twilio) and sign up.
2. Verify your email, then verify your phone with **your Canadian mobile number**. This sets the trial's country to Canada.
3. In the onboarding questions, choose anything close to "Voice" / "calls". The answers only change which tutorials Twilio shows.

### Step 2: verify both phones

Trial accounts can only place calls to and from **verified** numbers (up to five).

1. In the console, open **Phone Numbers**, then **Manage**, then **Verified Caller IDs**.
2. Click **Add a new Caller ID**, enter the scammer phone's number in international format (for example `+17785550101`), and have Twilio call or text it with a code.
3. Repeat for any other phone you will use. Your sign-up number is already verified.

### Step 3: get a TrustLine phone number

1. Open **Phone Numbers**, then **Manage**, then **Buy a number**.
2. Country: **Canada**. Capabilities: tick **Voice**. Optionally search for area code `604` or `778` (Vancouver), so calling it is local.
3. Click **Buy** on a number. Trial accounts get one number, paid from trial credit. If Twilio asks for an address for regulatory reasons, enter your own.
4. Write down the number in international format, for example `+16045550123`. It is **not secret**; it goes in the app and in the contact card users save.

### Step 4: copy the Auth Token into `.env` (yourself, not in chat)

1. On the console home page, find **Account Info**. Click to reveal the **Auth Token**.
2. Open `.env` in the repo and set:

   ```
   TWILIO_AUTH_TOKEN=<paste here>
   ```

The call server uses this to check that each webhook request really comes from Twilio, and rejects anything else with a 403. **It is a secret**: never commit it, never put it in a `VITE_` variable, never paste it in chat or the team log. If it leaks, rotate it in the console (Account, API keys and tokens).

## Part 2: run the call server and expose it (on your laptop)

### Step 5: install the Cloudflare tunnel tool

Twilio has to reach your laptop over the internet with HTTPS. A free Cloudflare "quick tunnel" does that without an account.

```bash
brew install cloudflared
cloudflared --version
```

### Step 6: start the call server

In terminal tab 1, from the repo:

```bash
cd ~/Desktop/Projects/trustline
npm run server
```

You should see `TrustLine call server on :8787`. Warnings about `TWILIO_AUTH_TOKEN` or `GEMINI_API_KEY` mean those are not set yet. Check it locally:

```bash
curl http://localhost:8787/health
```

Expected: `ok`.

### Step 7: start the tunnel

In terminal tab 2:

```bash
cloudflared tunnel --url http://localhost:8787
```

After a few seconds it prints a line like `https://random-words-here.trycloudflare.com`. Copy it. Check it from the terminal:

```bash
curl https://random-words-here.trycloudflare.com/health
```

Expected: `ok`. Leave this tab running. **The address changes every time you restart `cloudflared`**, and then steps 8 to 11 need the new address.

## Part 3: configure

### Step 8: point the Twilio number at the server

1. In the Twilio console, open **Phone Numbers**, then **Manage**, then **Active numbers**, and click your TrustLine number.
2. Open the **Configure** tab and find **Voice Configuration**.
3. Set **A call comes in** to **Webhook**, URL `https://random-words-here.trycloudflare.com/twilio/voice`, method **HTTP POST**.
4. Click **Save configuration**.

### Step 9: fill in `.env`

Edit `.env` (it is git-ignored). Replace the example numbers with yours.

```
# Call server
PUBLIC_URL=https://random-words-here.trycloudflare.com
APP_ORIGIN=http://localhost:5173
PHONE_LINKS={"+16045550100":"harpreet"}

# App
VITE_CALL_SERVER_URL=http://localhost:8787
VITE_TRUSTLINE_NUMBER=+16045550123
```

| Setting                 | What it is                                | Why it matters                                                                                                                                                                                                                                                                               |
| ----------------------- | ----------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `PUBLIC_URL`            | The tunnel address, **no trailing slash** | Twilio signs each request using the exact URL it called. If this does not match, every call is rejected with a 403. It is also the base of the media stream address                                                                                                                          |
| `APP_ORIGIN`            | Where the app runs                        | Only this origin may receive call events                                                                                                                                                                                                                                                     |
| `PHONE_LINKS`           | Which demo user each phone belongs to     | The server sees the number of the phone that dialed TrustLine and sends the call to that user's app. Use the **user's** phone (the one that adds TrustLine), in `+1...` format. `harpreet` is Demo Newcomer Society with Punjabi warnings; `mei` is Demo Credit Union with Mandarin warnings |
| `VITE_CALL_SERVER_URL`  | How the app reaches the server            | The app runs on the same laptop, so it can use `localhost` directly; only Twilio needs the tunnel                                                                                                                                                                                            |
| `VITE_TRUSTLINE_NUMBER` | The Twilio number                         | Shown in the "Add TrustLine to a call" card and the downloadable contact                                                                                                                                                                                                                     |

### Step 10: restart both

- Tab 1: stop the server (Ctrl+C) and run `npm run server` again. It reads `.env` only at start, and the `TWILIO_AUTH_TOKEN` warning should now be gone.
- Tab 3: start the app with `npm run dev`, then open `http://localhost:5173`.

### Step 11: check the setup before calling

1. In the app, the **Add TrustLine to a call** card shows your Twilio number and, after a moment, **"Ready: merged calls will appear on this screen."** If it says "Connecting to TrustLine…" and stays there, see Troubleshooting.
2. Pick the demo user that matches `PHONE_LINKS` (Harpreet) and a warning language.
3. Optional: save the TrustLine contact to the user's phone with **Save TrustLine to contacts**, or add the number to Contacts by hand as "TrustLine".

## Part 4: the test call

### Step 12: make the call

1. **Scammer's phone** calls **the user's phone**. Answer it.
2. On the user's phone, tap **Add Call** and dial the TrustLine number (or pick the TrustLine contact). The scammer is put on hold for a moment.
3. **Trial accounts:** Twilio may play a short "trial account" message first and ask you to press a key. Press any key; the call continues.
4. You hear **"TrustLine is listening."**
5. Tap **Merge Calls**. All three are now on one call.
6. The scammer reads the script, slowly, one sentence at a time:

   > Hello, this is Officer David Miller calling from Immigration, Refugees and Citizenship Canada.
   > Our records show you failed to report a change to your immigration status, and there is now a warrant attached to your file.
   > If this is not resolved today, you will be detained and deported.
   > To clear the warrant you must pay a fine of two thousand five hundred dollars within the next hour.
   > Our payment system only accepts Google Play gift cards or bitcoin. Go to the nearest store and buy the cards now.

7. Hang up on the user's phone when done.

### Step 13: what you should see and hear

| Where            | Expected                                                                                                                                                        |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Server terminal  | `Incoming call for user harpreet`                                                                                                                               |
| App              | Switches to **Phone call** with status **Listening**; the transcript fills in as the scammer speaks                                                             |
| On the call      | After the deportation threat (around sentence 3), TrustLine speaks a short warning in the user's language that ends with IRCC's official number, 1 888 242 2100 |
| App              | A **Likely scam** warning, the **"TrustLine said on the call"** note, and the "Hang up and call IRCC" button                                                    |
| After hanging up | Status **Call ended**; **Start listening** comes back                                                                                                           |

The warning is spoken **once** per call, the first time risk turns high. Then try the real bank script from the "Real bank fraud alert" demo call (in `src/data/demoCalls.ts`): TrustLine should stay silent.

### Step 14: clean up

- Share or publish anything during testing? Clear Supabase test data: `supabase db query --linked "delete from public.advisories; delete from public.incidents;"`
- Stop `cloudflared` when you are not testing. While it runs, anyone with the address can reach the server; the Twilio signature check rejects fake calls, but there is no reason to leave it open.

## Part 5: demo day options

The quick tunnel is fine for testing but its address changes on every restart. For the demo, pick one:

| Option                                               | Effort                                                    | Stable address? | Notes                                                                                                                         |
| ---------------------------------------------------- | --------------------------------------------------------- | --------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| **Keep the quick tunnel**                            | None                                                      | No              | Start it once before the demo, update the Twilio webhook and `PUBLIC_URL`, and do not restart it. Fine if the laptop stays on |
| **Host the call server** (Railway, Fly.io or Render) | About 30 minutes                                          | Yes             | Uses the existing `Dockerfile`. Check the host's current pricing and free allowance first                                     |
| **Named Cloudflare tunnel**                          | About 20 minutes, needs a Cloudflare account and a domain | Yes             | Same laptop setup, permanent address                                                                                          |

If you host it, the settings move from `.env` to the host's environment variables:

| Variable                               | Value on the host                                                                                             |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `ELEVENLABS_API_KEY`, `GEMINI_API_KEY` | Same keys                                                                                                     |
| `TWILIO_AUTH_TOKEN`                    | Same token                                                                                                    |
| `PUBLIC_URL`                           | The host's https address, for example `https://trustline-calls.up.railway.app`                                |
| `APP_ORIGIN`                           | The web app's address: `http://localhost:5173` if the app runs on the laptop, or the Vercel URL once deployed |
| `PHONE_LINKS`                          | Same as above                                                                                                 |

Then point the Twilio webhook at `https://<host>/twilio/voice`, and set `VITE_CALL_SERVER_URL` to the host's address (in `.env`, and in Vercel once the site is deployed; redeploy afterwards, because `VITE_` values are fixed at build time).

## Costs and limits

- **Trial account:** expires 30 days after sign-up, allows one Twilio number, and calls only verified numbers in the sign-up country. Calls and the number are paid from trial credit.
- **Upgrading** (adding credit) removes the trial message and the verified-number rule. A Canadian number and a handful of demo calls cost a few dollars; check current prices in the console before buying.
- **ElevenLabs** charges transcription by audio minute and speech by character, from the plan's allowance. Spoken warnings are cached, so repeating the same demo does not regenerate them.
- **Privacy:** call audio passes through Twilio and ElevenLabs, and transcripts through Gemini if its key is set. Use the scripts, not real calls or real personal details.

## Troubleshooting

| Symptom                                                                                                                | Likely cause                                                                                                                                                                        | Fix                                                                                                                             |
| ---------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Calling TrustLine gives "an application error has occurred"                                                            | Twilio could not reach the webhook                                                                                                                                                  | Check the tunnel is running, the URL in Twilio ends in `/twilio/voice`, method is POST, and `curl <tunnel>/health` returns `ok` |
| The call hangs up right away; server log shows nothing                                                                 | Webhook URL is wrong or points at an old tunnel address                                                                                                                             | Update the Twilio webhook to the current tunnel address                                                                         |
| Twilio's debugger shows 403 on `/twilio/voice`                                                                         | `PUBLIC_URL` does not exactly match the address Twilio called, or the Auth Token is wrong                                                                                           | Make `PUBLIC_URL` the tunnel address with no trailing slash; recopy the Auth Token; restart the server                          |
| "TrustLine is listening" plays, then nothing happens in the app                                                        | The call went to a different user, or the app is not connected                                                                                                                      | Check `PHONE_LINKS` uses the user's phone number in `+1...` format and the app shows that user; check the card says "Ready"     |
| App card stuck on "Connecting to TrustLine…"                                                                           | `VITE_CALL_SERVER_URL` wrong, server not running, or `APP_ORIGIN` does not match the app's address                                                                                  | Set `VITE_CALL_SERVER_URL=http://localhost:8787`, `APP_ORIGIN=http://localhost:5173`, restart both                              |
| Transcript appears but no spoken warning                                                                               | Risk never reached high, or ElevenLabs speech failed                                                                                                                                | Read the full script including the deportation and gift card lines; check the server log for "Could not speak warning"          |
| Warning appears in the app but the call is silent                                                                      | Text to speech failed (quota or key)                                                                                                                                                | The app still shows the warning (`spoken: false`); check the ElevenLabs key and remaining quota                                 |
| Server log says "Rejected a media stream without a valid Twilio signature" and the call goes silent after the greeting | `PUBLIC_URL` does not match the address Twilio used, or the Auth Token in `.env` is wrong. The server checks Twilio's signature on the live-audio connection as well as the webhook | Fix `PUBLIC_URL` (no trailing slash) or the token, and restart the server                                                       |
| A long call stops by itself after 10 minutes                                                                           | The call length limit, which stops a forgotten call from spending credit                                                                                                            | Set `MAX_CALL_MINUTES` in `.env` if you need longer                                                                             |
| Server exits with "ELEVENLABS_API_KEY is required"                                                                     | Key missing from `.env`                                                                                                                                                             | Add it and restart                                                                                                              |
| Can't call the scammer phone / call blocked                                                                            | Trial account and the number is not verified                                                                                                                                        | Verify it under Verified Caller IDs (step 2)                                                                                    |
| `npm run server` uses a strange port                                                                                   | Old version of `server/config.ts`                                                                                                                                                   | Pull `main`; blank `.env` values are now treated as unset                                                                       |

Twilio's **Monitor**, then **Logs**, then **Calls** (and the **Debugger**) show each call, the webhook response and any errors.

## Rehearsing without Twilio

`npm run simulate:call -- ircc-scam` runs the real call server and plays the IRCC script as if it were a merged call, including the spoken warning if `ELEVENLABS_API_KEY` is set. Start it, then open the app with `VITE_CALL_SERVER_URL=http://localhost:8787`. Use it to rehearse the demo when the phones or the network are not cooperating.

## After it works

Add an entry to `docs/team-sync.md`: the Twilio number, who owns the Twilio account, which phones are verified, and whether the trial message appeared. Never record the Auth Token.

## Sources

- Twilio, [Trial accounts](https://www.twilio.com/docs/usage/trials.md) (verified numbers, sign-up country).
- Twilio support, [Trial limits](https://support.twilio.com/hc/en-us/articles/11853148778523-Trial-Limits-and-US-Toll-Free-Number-Restrictions) (one number, 30-day expiry).
- Twilio, [Media Streams](https://www.twilio.com/docs/voice/media-streams) (the two-way audio stream the server uses).
- Cloudflare, [Quick tunnels](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/do-more-with-tunnels/trycloudflare/) (`cloudflared tunnel --url`).
