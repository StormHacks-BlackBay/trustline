# Accessibility

TrustLine targets WCAG 2.2 AA on mobile Safari with VoiceOver and Chrome on Android with TalkBack.

## What is in place

| Area                | Implementation                                                                                                                                         |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Screen readers      | New warnings are announced through an assertive live region, only when risk rises. The transcript is a labelled log that does not announce every line. |
| Colour independence | Risk is always shown as icon, word and colour together.                                                                                                |
| Contrast            | Every text and background pair in both themes meets 4.5:1, checked by `src/styles/tokens.test.ts`.                                                     |
| Text size           | 18px base, rem units throughout, layout tested at 200% zoom with no horizontal scrolling.                                                              |
| Touch targets       | At least 48 by 48 CSS pixels.                                                                                                                          |
| Language            | Warnings set the `lang` attribute, and Farsi renders right to left.                                                                                    |
| Motion              | No flashing; `prefers-reduced-motion` disables transitions.                                                                                            |
| Dialogs             | Consent and publish sheets use the native `<dialog>` element for focus handling and Escape to close.                                                   |

## Last audit (2026-10-03)

- **axe-core** (WCAG 2.0 to 2.2 A and AA rules plus best practices) on the call screen, a finished scam call, the consent sheet and the partner dashboard, in the light theme (TrustLine has no dark theme): no violations.
- **Keyboard-only walkthrough** in Chrome of both main flows: playing a demo call, sharing it with the consent sheet, and publishing an advisory from the partner dashboard. This found and fixed two issues: the transcript's auto-scroll moved the keyboard starting point past the navigation, and focus was lost after publishing or sharing.
- **Layout** at 320px, 390px, 1280px and 1440px, and at 200% zoom: no horizontal scrolling.

## Known gaps

- Interface labels are in English. Only warnings and explanations are translated.
- Non-English warning text has not yet been reviewed by native speakers.
- Not yet tested with VoiceOver or TalkBack on a real device, or with people who rely on them.

## Reporting a barrier

Open an issue with the `accessibility` label. Describe the barrier, the assistive technology you use and your device.
