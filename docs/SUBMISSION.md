# Devpost submission draft

Replace every bracketed value before submitting. Numbers in this file come from `npm run eval` and the in-app Diagnostics panel.

**Project name:** TrustLine

**Elevator pitch (155 characters):** Real-time, in-language scam warnings for newcomers on suspicious financial calls, backed by a shared alert network between community organizations and banks.

## About the project

## Inspiration

Canadians reported more than $638 million in fraud losses in 2024, and studies cited by the RCMP estimate only 5 to 10 per cent of fraud is ever reported. Newcomers are a frequent target: callers pretend to be IRCC, CRA or CBSA, threaten deportation or arrest, and demand payment in gift cards or crypto. IRCC states that its employees will never threaten to arrest or deport you or ask for payment by gift card. A newcomer hearing that call for the first time, possibly not in their first language, has no way to know that in the moment.

## What it does

TrustLine listens to a call on speakerphone and transcribes it in real time. When the caller uses a known scam tactic, TrustLine highlights the exact words, explains the concern in the user's language (English, Punjabi, Mandarin, Tagalog or Farsi), and shows the official contact channel for the organization the caller claims to represent, so the user can hang up and check independently.

With the user's consent, TrustLine sends a redacted summary of the incident to the user's community organization or credit union. The organization can publish an advisory that reaches users of every partner. This is our answer to **SDG 17.17**: a working partnership between civil society and financial institutions. Protecting newcomers' access to banking supports **SDG 8.10**.

## How we built it

- **React + TypeScript (Vite)** mobile web app, deployed on **Vercel**
- **ElevenLabs Scribe v2 Realtime** for streaming transcription, authorized with single-use tokens minted on our server
- A **rules layer** for instant flags and **Claude** for structured risk scoring and translated explanations, validated with **Zod** on the server and in the browser
- A fusion step where rules raise risk immediately and only the LLM can lower it, never below a hard signal such as a gift card request
- **Supabase** (Postgres + Realtime) for incidents and advisories, with on-device redaction before anything is shared
- **ElevenLabs Agents** playing scripted scam and legitimate callers for testing and the demo

## Challenges we ran into

- Neither iOS nor Android lets third-party apps read cellular call audio, so we designed TrustLine around speakerphone input.
- A real bank fraud alert says "we will never ask for your PIN or a verification code". Our first rules would have flagged it, so we added negation handling and made that call a test case.
- Balancing speed and accuracy: rules take about 0.01 ms but are rigid, while the LLM understands context but takes longer.
- [Add what actually went wrong during the build]

## Accomplishments that we're proud of

- A full loop from a live call to a published community advisory on another partner's users' screens
- On our 17-call evaluation set, the rules layer alone reaches 100% precision and 91% recall with no false positives on legitimate calls. [Add rules + LLM results from `npm run eval` with ANTHROPIC_API_KEY set.]
- Median alert latency of [X] ms for rule warnings and [Y] ms for LLM explanations, measured in the app's Diagnostics panel
- No axe-core accessibility violations across every screen, in light and dark themes

## What we learned

[Fill in: for example, streaming audio in the browser, structured LLM output, designing alerts people trust without causing panic]

## What's next for TrustLine

- Phone-number forwarding through Twilio so TrustLine can screen calls without speakerphone
- Pilots with settlement agencies and credit unions in Metro Vancouver
- Native-speaker review of translations, and a larger partner-reviewed evaluation set

## Built with

react, typescript, vite, node.js, elevenlabs, anthropic, claude, supabase, postgresql, vercel, zod, vitest

## Try it out

- Live app: [Vercel URL]
- Source code: https://github.com/StormHacks-BlackBay/trustline

## Image gallery

Screenshots are in `docs/screenshots/`. Devpost prefers 3:2 images, so place them on a 3:2 canvas.
