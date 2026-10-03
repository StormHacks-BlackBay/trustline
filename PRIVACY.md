# Privacy

TrustLine listens to phone calls, so it is built to keep as little as possible.

## Data inventory

| Data                                                    | Where it goes                                                                                                        | Stored?                                                |
| ------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| Call audio                                              | Streamed from the browser to ElevenLabs Scribe for transcription                                                     | Not stored by TrustLine                                |
| Transcript                                              | Browser memory. The most recent part of the call is sent to `/api/score`, which forwards it to Anthropic for scoring | Discarded when the call ends unless the user shares it |
| Incident summary                                        | Supabase, only after the user taps Share and confirms                                                                | Yes, redacted                                          |
| Advisories                                              | Supabase                                                                                                             | Yes, written by partner organizations                  |
| Preferences (demo user, language, dismissed advisories) | localStorage in the user's browser                                                                                   | On the device only                                     |
| API keys                                                | Vercel environment variables                                                                                         | Server only                                            |

## Consent and redaction

Nothing about a call leaves the device for a partner organization unless the user chooses to share it. The consent sheet shows exactly what will be sent. Before sending, `src/lib/redact.ts` removes email addresses, phone numbers, card, account and SIN numbers, street addresses, postal codes, and names that follow introductions or titles. The organization the caller claimed to be and the scam wording are kept, because that is what partners need to warn others. Redaction is covered by tests in `src/lib/redact.test.ts`.

## Recording

The user is a party to the call. Canadian law allows a party to a conversation to record it, and TrustLine does not store audio.

## Third parties

- ElevenLabs processes call audio for transcription.
- Anthropic processes transcript text for risk scoring.
- Supabase stores redacted incidents and advisories.

## Demo build limits

This hackathon build has no login. Supabase row level security allows anonymous reads of incidents so the demo dashboard works without accounts. A production build would scope incident reads to authenticated partner staff.

## Reporting a concern

Open an issue with the `privacy` label.
