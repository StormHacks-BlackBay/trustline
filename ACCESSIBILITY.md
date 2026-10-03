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

## Last audit

axe-core (WCAG 2.0 to 2.2 A and AA rules plus best practices) on the home screen, a finished scam call, the consent sheet and the partner dashboard, in light and dark themes: no violations.

## Known gaps

- Interface labels are in English. Only warnings and explanations are translated.
- Non-English warning text has not yet been reviewed by native speakers.
- Not yet tested with real VoiceOver and TalkBack users.

## Reporting a barrier

Open an issue with the `accessibility` label. Describe the barrier, the assistive technology you use and your device.
