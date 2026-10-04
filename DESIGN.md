# TrustLine Design System

## Thesis

**TrustLine shows the reason before the alarm.** Every warning names the words that caused it and gives one safe next step, in the listener's language, in type a tired or anxious person can read at arm's length.

Everything below follows from that sentence.

## Decisions

| Decision                                                                                | Why                                                                                                          |
| --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| One primary action per warning: call the organization's official number                 | Someone being pressured on a call can follow one instruction, not a menu                                     |
| One secondary action: share the call with your organization                             | Sharing helps others but never competes with getting off the call                                            |
| Calm wording that states facts ("They asked for gift cards. IRCC never asks for this.") | Alarm words such as "DANGER" raise panic without adding information                                          |
| Low risk is a quiet status line; medium and high risk take over the top of the call     | The screen only gets loud when there is something to act on                                                  |
| Warm paper background instead of cool grey                                              | Calmer, and it keeps the product from looking like a generic dashboard                                       |
| Atkinson Hyperlegible Next, self-hosted                                                 | Designed by the Braille Institute for low-vision readers; self-hosting avoids sending visitors to a font CDN |
| TrustLine never says a caller is verified                                               | It cannot know. Only the directory's official channels are trusted                                           |

## Foundations

All values live in tokens. Component styles use only `var(--…)`; a raw `rem`, `px` or colour in a component stylesheet is a bug, except for layout breakpoints, which CSS cannot read from variables.

### Colour (`src/styles/tokens.ts`)

Colours are data, written to CSS custom properties by `src/styles/theme.ts`, with one light palette. TrustLine does not switch to a dark theme when the device is in dark mode, so the app always looks like the screenshots. `src/styles/tokens.test.ts` asserts that every text and background pair the UI uses meets WCAG AA (4.5:1), and that the accent meets 3:1 against surfaces for non-text use. Adding a pair to the UI means adding it to `TEXT_PAIRS`.

| Token                                    | Role                                                       |
| ---------------------------------------- | ---------------------------------------------------------- |
| `background`, `surface`, `surfaceSunken` | Page, raised panels, recessed areas such as the transcript |
| `text`, `mutedText`                      | Body text and secondary text                               |
| `accent`, `onAccent`                     | Brand teal for primary actions, links and focus            |
| `low*`, `medium*`, `high*`               | Risk tones: always paired with an icon and a word          |
| `highlight`                              | Evidence highlighted in the transcript                     |

### Type (`src/styles/global.css`)

| Token        | Size      | Use                                 |
| ------------ | --------- | ----------------------------------- |
| `--text-2xl` | 2rem      | Page titles                         |
| `--text-xl`  | 1.5rem    | The warning reason, summary numbers |
| `--text-lg`  | 1.25rem   | Section headings, page lead         |
| `--text-md`  | 1rem      | Body                                |
| `--text-sm`  | 0.875rem  | Hints, metadata, chips              |
| `--text-xs`  | 0.8125rem | Reserved for dense metadata         |

The root size is 18px on phones and 17px from 64rem up. Weights are `--weight-regular`, `--weight-medium` and `--weight-bold`. Gurmukhi, Chinese and Persian fall back to Noto or the platform's fonts.

### Space, shape and layout

- Spacing: `--space-1` to `--space-12` on a 4px base.
- Radius: `--radius-sm`, `--radius-md` (controls and cards), `--radius-lg` (the warning), `--radius-pill` (chips and badges).
- Borders: `--border-thin` for structure, `--border-thick` for buttons and emphasis, `--border-accent` for the leading edge of alerts and warnings. Leading edges use `border-inline-start` so they flip for right-to-left text.
- Touch targets: `--touch` (48px) minimum for every control.
- Layout: content is capped at `--content-max` (76rem) with `--gutter` padding; prose is capped at `--reading-max` (40rem). Columns and wrapping controls use `--side-min`, `--column-min` and `--control-min`; scrolling regions cap at `--scroll-max` and `--scroll-max-sm`.

### Breakpoints

| Width   | Change                                                                                                                                    |
| ------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| < 40rem | Single column; primary buttons span the full width                                                                                        |
| 40rem   | Buttons size to their content; sheets become centred dialogs                                                                              |
| 48rem   | Wider page gutters                                                                                                                        |
| 60rem   | Two columns: the call and its warning on the left, caller details and tools on the right. The partner dashboard gets its overview sidebar |
| 64rem   | Root size steps down to 17px; the warning gets more padding                                                                               |

## Components (`src/components`)

| Component                              | Purpose                                                                                     |
| -------------------------------------- | ------------------------------------------------------------------------------------------- |
| `AppShell`                             | Header with the mark and navigation, skip link, page titles, footer                         |
| `Logo`, `LogoMark`                     | A check mark that runs on into a flat line: a verified line                                 |
| `Button`, `ButtonLink`                 | Primary and secondary actions; `ButtonLink` for actions that navigate, such as `tel:` links |
| `Card`                                 | Raised surface for a group of related content                                               |
| `Chip`, `ChipList`                     | Warning signs, statuses and labels                                                          |
| `RiskBadge`                            | Risk as icon, word and colour together                                                      |
| `Alert`                                | Errors (`role="alert"`), confirmations and notes (`role="status"`)                          |
| `Field`, `Select`, `Input`, `TextArea` | Labelled form controls with optional hints wired through `aria-describedby`                 |
| `Sheet`                                | Consent and publishing dialogs on the native `<dialog>` element                             |

The signature component is `WarningHero` (`src/features/call`): risk badge, the reason in the listener's language, an English line, the warning signs, and the two actions.

## States

| State           | Treatment                                                                   |
| --------------- | --------------------------------------------------------------------------- |
| No call yet     | Call panel, "The caller's words will appear here", tools in the side column |
| Low risk        | One status line with a green leading edge                                   |
| Medium risk     | Amber warning panel: "Could not confirm"                                    |
| High risk       | Red warning panel: "Likely scam"                                            |
| LLM checking    | "Checking the rest of the call…" under the warning                          |
| LLM unavailable | "Basic mode: warnings come from on-device rules only."                      |
| Errors          | `Alert` with `role="alert"`                                                 |

## Motion

Only colour transitions on interactive controls (`--transition`, 150ms). `prefers-reduced-motion` removes them.

## Accessibility contract

See `ACCESSIBILITY.md`. In short: AA contrast is tested in code, risk never depends on colour alone, all controls meet the 48px target, layouts reflow at 320px and at 200% zoom, the warning is announced once when risk rises, and translated text carries `lang` and `dir`.

## Decision log

| Date       | Decision                                                                                                                                                |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-10-03 | Single-column mobile layout, teal accent, tested contrast tokens                                                                                        |
| 2026-10-03 | Design pass: Atkinson Hyperlegible Next, warm palette, full token scale, app shell, desktop layouts, warning as the focal point with one primary action |
