# Privacy

TrustLine listens to phone calls, so it is built to keep as little as possible.

## Data inventory

| Data                                                    | Where it goes                                                                                                                    | Stored?                                                |
| ------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| Call audio                                              | Streamed from the browser to ElevenLabs Scribe for transcription                                                                 | Not stored by TrustLine                                |
| Transcript                                              | Browser memory. The most recent part of the call is sent to `/api/score`, which forwards it to the Google Gemini API for scoring | Discarded when the call ends unless the user shares it |
| Incident summary                                        | Supabase, only after the user taps Share and confirms                                                                            | Yes, redacted                                          |
| Advisories                                              | Supabase                                                                                                                         | Yes, written by partner organizations                  |
| Preferences (demo user, language, dismissed advisories) | localStorage in the user's browser                                                                                               | On the device only                                     |
| API keys                                                | Vercel environment variables                                                                                                     | Server only                                            |

## Consent and redaction

Nothing about a call leaves the device for a partner organization unless the user chooses to share it. The consent sheet shows exactly what will be sent. Before sending, `src/lib/redact.ts` removes email addresses, phone numbers, card, account and SIN numbers, street addresses, postal codes, and names that follow introductions or titles. The organization the caller claimed to be and the scam wording are kept, because that is what partners need to warn others. Redaction is covered by tests in `src/lib/redact.test.ts`.

## Recording and announcement

The user is a party to the call and chooses to add TrustLine. Canadian law allows a party to a conversation to record it. TrustLine joins silently, so a scammer is not warned before TrustLine can hear the scam. It only speaks if it hears a likely scam, and it does not store audio. The transcript is kept in memory on the call server for one day so the user can open the call summary.

## Third parties

- Twilio carries the merged call and streams its audio to the call server.
- ElevenLabs processes call audio for transcription and generates the spoken warning.
- Google (Gemini API) processes transcript text for risk scoring. On the free tier, Google's terms allow it to use submitted content to improve its products; on a paid key it does not. This hackathon build uses the free tier, so demos use scripted calls rather than real ones.
- Supabase stores redacted incidents and advisories.

## Demo build limits

This hackathon build has no login. Supabase row level security allows anonymous reads of incidents so the demo dashboard works without accounts. A production build would scope incident reads to authenticated partner staff.

## Reporting a concern

Open an issue with the `privacy` label.
