# Devpost submission draft

Replace every bracketed value before submitting. Numbers in this file come from `npm run eval` and the in-app Diagnostics panel.

**Project name:** TrustLine

**Elevator pitch (157 characters):** Merge TrustLine's number into a suspicious call and it warns you out loud, in your language. Then it texts you a summary and alerts your community.

## About the project

## Inspiration

Canadians reported more than $638 million in fraud losses in 2024, and studies cited by the RCMP estimate only 5 to 10 per cent of fraud is ever reported. Newcomers are a frequent target: callers pretend to be IRCC, CRA or CBSA, threaten deportation or arrest, and demand payment in gift cards or crypto. IRCC states that its employees will never threaten to arrest or deport you or ask for payment by gift card. A newcomer hearing that call for the first time, possibly not in their first language, has no way to know that in the moment.

## What it does

**The product is a phone number, not an app.** During a suspicious call, the user taps Add Call, dials TrustLine and taps Merge, like adding a friend to a three-way call. TrustLine transcribes the call in real time. When the caller uses a known scam tactic, such as gift card payment, deportation threats, one-time code requests or a fee to get a job or work permit, TrustLine says so out loud on the call in the user's language (English, Punjabi, Mandarin, Tagalog or Farsi) and names the official contact channel for the organization the caller claims to be.

After the call, TrustLine texts the user a link to a call summary: the transcript with the exact words highlighted, the amount they were asked for, what TrustLine said, the verified contact, recovery steps if they already paid, and a one-tap, consent-based report to their community organization or credit union.

The website is mainly for those organizations. The partner portal shows redacted reports from their members, total money at risk, scam trends by tactic and language, and lets staff publish an advisory that reaches every partner's users, copy a ready-to-send message to their members, file a pre-filled Canadian Anti-Fraud Centre report, and export the data.

**How it maps to the UN Sustainable Development Goals:**

- **8.10 (access to banking and financial services):** a newcomer who loses savings to a fake CRA or bank call often stops trusting banks altogether. TrustLine stops the payment during the call and connects them to their real bank afterward.
- **8.8 (protect labour rights and migrant workers):** fake employers charge newcomers and temporary workers for jobs and LMIAs. TrustLine flags any fee for a job, LMIA or work permit, because real employers in Canada do not charge them.
- **17.17 (public, public-private and civil society partnerships):** settlement agencies, credit unions and the Anti-Fraud Centre each see only part of the picture. TrustLine gives them one shared, consent-based channel: one member's report becomes an advisory for everyone.

## How we built it

- **React + TypeScript (Vite)** mobile web app, deployed on **Vercel**
- **ElevenLabs Scribe v2 Realtime** for streaming transcription, authorized with single-use tokens minted on our server
- A **rules layer** for instant flags and **Google Gemini** (free tier) for structured risk scoring and translated explanations, validated with **Zod** on the server and in the browser
- A fusion step where rules raise risk immediately and only the LLM can lower it, never below a hard signal such as a gift card request
- **Supabase** (Postgres + Realtime) for incidents and advisories, with on-device redaction before anything is shared
- **ElevenLabs Agents** playing scripted scam and legitimate callers for testing and the demo

## Challenges we ran into

- Neither iOS nor Android lets third-party apps read cellular call audio. Our first design listened on speakerphone, which only works from a second device. Adding TrustLine as a third person on the call works on any phone with no special permissions, because the phone network does the audio routing.
- A real bank fraud alert says "we will never ask for your PIN or a verification code". Our first rules would have flagged it, so we added negation handling and made that call a test case.
- Balancing speed and accuracy: rules take about 0.01 ms but are rigid, while the LLM understands context but takes longer.
- [Add what actually went wrong during the build]

## Accomplishments that we're proud of

- A full loop from a merged phone call to a spoken warning, an after-call text, a member's report and a published advisory on another partner's users' screens
- On our 18-call evaluation set, the rules layer alone reaches 100% precision and 92% recall with no false positives on legitimate calls. [Add rules + LLM results from `npm run eval` with GEMINI_API_KEY set.]
- Median alert latency of [X] ms for rule warnings and [Y] ms for LLM explanations, measured in the app's Diagnostics panel
- No axe-core accessibility violations across every screen

## What we learned

[Fill in: for example, streaming audio in the browser, structured LLM output, designing alerts people trust without causing panic]

## What's next for TrustLine

- Call forwarding so TrustLine can screen unknown callers before the user picks up
- Keeping call summaries in a database instead of the call server's memory, and partner sign-in for the portal
- Pilots with settlement agencies and credit unions in Metro Vancouver
- Native-speaker review of translations, and a larger partner-reviewed evaluation set

## Built with

react, typescript, vite, node.js, twilio, elevenlabs, gemini, supabase, postgresql, vercel, zod, vitest, websockets

## Try it out

- Live app: [Vercel URL]
- Source code: https://github.com/StormHacks-BlackBay/trustline

## Image gallery

Screenshots are in `docs/screenshots/`. Devpost prefers 3:2 images, so place them on a 3:2 canvas.
