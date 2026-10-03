# TrustLine: deploying the web app to Vercel

Prepared October 3, 2026 for team Black Bay. This guide gets the TrustLine web app onto a public HTTPS URL, then puts that URL in the README and on the GitHub repository page.

Nothing in this guide has been run yet. Vercel's dashboard labels change from time to time, so if a button name differs slightly, look for the closest match.

## What gets deployed

| Part                                               | Where it runs                                                              | Deployed by this guide?                                                                  |
| -------------------------------------------------- | -------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Web app (`src/`, built by Vite into `dist/`)       | Vercel, as static files                                                    | Yes                                                                                      |
| API routes (`api/scribe-token.ts`, `api/score.ts`) | Vercel Functions                                                           | Yes                                                                                      |
| Call server (`server/`, Twilio media streams)      | An always-on host such as Railway, Fly.io or Render, from the `Dockerfile` | No. Vercel Functions cannot hold a phone call open. See the README section "Phone calls" |

The first deployment needs **no API keys**. Without keys the site runs in basic mode: demo calls, rules-based warnings in all five languages, the partner dashboard (shared between tabs of one browser), and the accessibility features all work. Live listening, Gemini explanations and merged phone calls start working once keys are added (step 6).

## Step 0: choose a route

Vercel's free plan is called **Hobby**. Its documentation says: "You cannot deploy to a Hobby team from a private repository in a GitHub organization, GitLab group, or Bitbucket workspace. Consider making the repository public or upgrading to Pro." Our repository is private and owned by the `StormHacks-BlackBay` organization, so automatic deployments from GitHub on Hobby are not available while it stays private.

| Route                                           | Cost                 | Auto-deploys when either of us pushes?                           | Repo visibility | Best for                                                                                                 |
| ----------------------------------------------- | -------------------- | ---------------------------------------------------------------- | --------------- | -------------------------------------------------------------------------------------------------------- |
| **A. Make the repo public, connect GitHub**     | Free                 | Yes                                                              | Public          | The submission. Devpost judges need to open the source code, so the repo has to be public by then anyway |
| **B. Deploy from a laptop with the Vercel CLI** | Free                 | No. Whoever owns the Vercel project runs one command to redeploy | Stays private   | Getting a link today without changing visibility                                                         |
| **C. Vercel Pro (free trial, then paid)**       | Trial, then per seat | Yes, once both of us are team members                            | Stays private   | Only if the repo must stay private and we need auto-deploys                                              |

**Recommendation:** use **Route B now** to get a working link immediately, then switch to **Route A** when we make the repo public for the Devpost submission. The project, URL and environment variables carry over: Route A only adds the GitHub connection to the project Route B created.

## Step 1: before you start

Do these once, whichever route you choose.

1. **Pull the latest `main` and make sure it builds.**

   ```bash
   cd ~/Desktop/Projects/trustline
   git pull --rebase
   npm install
   npm run check
   ```

   `npm run check` runs the type check, lint, tests and production build. Vercel runs the same build (`npm run build`), so if this fails locally it will fail on Vercel too.

2. **Confirm no secrets were ever committed.** Required before Route A, because making the repo public publishes its full history.

   ```bash
   git log -p --all \
     | grep -nE "(ELEVENLABS|GEMINI|ANTHROPIC|TWILIO)_[A-Z_]*(KEY|TOKEN)=\S+|sk_[A-Za-z0-9]{20,}|AIza[0-9A-Za-z_-]{30,}" \
     | grep -v "YOUR_LOCAL_SECRET" | head
   ```

   No output means no key-like strings were found. Placeholder lines such as `GEMINI_API_KEY=YOUR_LOCAL_SECRET` in the older setup plan are filtered out on purpose. If anything else appears, stop. Revoke that key in its provider's dashboard first, then ask before going further, because removing a secret from Git history needs care.

3. **Create a Vercel account** at [vercel.com/signup](https://vercel.com/signup). Choose **Hobby** and **Continue with GitHub**, using the GitHub account that is an admin of `StormHacks-BlackBay` (Ariel's). Signing in with GitHub links the accounts, which Route A needs.

4. **Choose the project name.** The default URL is `https://<project-name>.vercel.app`. Use `trustline`. If that name is taken, Vercel adds a suffix (for example `trustline-black-bay.vercel.app`), and you can rename the project later in its settings.

## Route B: deploy from the CLI (repo stays private)

Use the account from step 1.3. Only the owner of a Hobby project can deploy to it, so one person (Ariel) owns deployments for this route.

1. **Update the CLI.** The installed version (31.0.2) is old.

   ```bash
   brew upgrade vercel-cli
   vercel --version
   ```

   If Homebrew says the formula is not installed, use `npm install --global vercel@latest` instead.

2. **Log in.**

   ```bash
   vercel login
   ```

   Choose **Continue with GitHub** and approve in the browser. Check it worked with `vercel whoami`.

3. **Link the folder to a new Vercel project.**

   ```bash
   cd ~/Desktop/Projects/trustline
   vercel link
   ```

   Answer the prompts:

   | Prompt                                   | Answer                        |
   | ---------------------------------------- | ----------------------------- |
   | Set up and deploy / link this directory? | Yes                           |
   | Which scope?                             | Your personal (Hobby) account |
   | Link to an existing project?             | No                            |
   | Project name                             | `trustline`                   |
   | In which directory is your code located? | `./`                          |
   | Auto-detected settings for Vite: modify? | No                            |

   This creates a `.vercel/` folder with the project ID. It is already in `.gitignore`; do not commit it.

4. **Check the build settings Vercel detected.** Open the project at [vercel.com/dashboard](https://vercel.com/dashboard), then **Settings**, then the build settings section (labelled **Build and Deployment** on current dashboards):

   | Setting          | Value                                                                |
   | ---------------- | -------------------------------------------------------------------- |
   | Framework Preset | Vite                                                                 |
   | Build Command    | `npm run build` (the default, which runs our `tsc -b && vite build`) |
   | Output Directory | `dist`                                                               |
   | Install Command  | default (`npm install`)                                              |
   | Node.js Version  | 22.x                                                                 |
   | Root Directory   | empty (the repository root)                                          |

5. **Deploy a preview first.**

   ```bash
   vercel
   ```

   The CLI uploads the project, builds it on Vercel and prints a preview URL. Open it and run the checks in step 5 below.

6. **Deploy to production.**

   ```bash
   vercel --prod
   ```

   This updates the stable URL, `https://trustline.vercel.app` (or whichever name you got).

7. **Redeploy after changes.** Whenever `main` changes and you want the site updated:

   ```bash
   git pull --rebase && npm run check && vercel --prod
   ```

## Route A: make the repo public and connect GitHub (auto-deploys)

Do this when the team agrees the code can be public, at the latest before submitting to Devpost.

1. **Complete step 1.2** (the secret check) and agree as a team.

2. **Make the repository public.** On GitHub, open the repository, then **Settings**, scroll to **Danger Zone**, choose **Change visibility**, select **Public** and confirm. Or from the terminal:

   ```bash
   gh repo edit StormHacks-BlackBay/trustline --visibility public --accept-visibility-change-consequences
   ```

3. **Give Vercel access to the organization.** In Vercel, choose **Add New**, then **Project**. Under **Import Git Repository**, open the account dropdown and choose **Add GitHub Account** (or **Configure GitHub App**). On GitHub:
   - Choose the **StormHacks-BlackBay** organization. Only an organization owner can install the app; Ariel is one.
   - Choose **Only select repositories** and pick `trustline`.
   - Click **Install**.

4. **Import or connect the repository.**
   - **If you already did Route B:** open the existing `trustline` project, go to **Settings**, then **Git**, choose **Connect Git Repository** and pick `StormHacks-BlackBay/trustline`.
   - **If this is the first deployment:** back on **Import Git Repository**, choose `trustline` and click **Import**. Set the project name to `trustline` and check the build settings match the table in Route B step 4. Add environment variables now or later (step 6). Click **Deploy**.

5. **Confirm automatic deployments.** The production branch is `main`. Every push to `main` from either of us now creates a production deployment, and every other branch gets its own preview URL. Rishon does not need a Vercel account for this on a public repository.

## Route C: Vercel Pro (repo stays private, auto-deploys)

Only if the repository must stay private and we want automatic deployments. Pro starts with a free trial and is then billed per team member, so check the current price on [vercel.com/pricing](https://vercel.com/pricing) first.

1. In Vercel, create a team and start the Pro trial.
2. Invite Rishon to the team. Each commit author must be a team member whose Vercel account is linked to their GitHub account, or their pushes will not deploy.
3. Follow Route A steps 3 to 5 without changing the repo's visibility, importing into the Pro team instead of the personal account.
4. Set a reminder to cancel the trial after the hackathon if we do not want to pay.

## Step 5: check the deployment

Run these against the URL Vercel gave you. Replace `<url>` below.

| Check              | How                                                                                     | Expected                                                                                                                                                              |
| ------------------ | --------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| App loads          | Open `<url>`                                                                            | TrustLine header, **Call check** page                                                                                                                                 |
| Deep link works    | Open `<url>/partner` directly in a new tab                                              | **Partner dashboard** page, not a 404. `vercel.json` handles this                                                                                                     |
| Detection works    | Click **IRCC impersonation** under Demo calls                                           | A red **Likely scam** warning with the official number                                                                                                                |
| Partner loop works | Share the call, open `/partner` in another tab of the same browser, publish an advisory | The report appears, and the advisory banner shows on the Call check tab                                                                                               |
| Scoring route runs | `curl -s -X POST <url>/api/score -d '{"transcript":"hi","language":"en"}'`              | `{"error":"scoring_not_configured"}` until a Gemini key is added. Any HTML error page or `FUNCTION_INVOCATION_FAILED` means the function crashed: see Troubleshooting |
| Token route runs   | `curl -s -X POST <url>/api/scribe-token`                                                | `{"error":"transcription_not_configured"}` until an ElevenLabs key is added                                                                                           |
| Phone              | Open `<url>` on a phone                                                                 | Layout fits the screen, no sideways scrolling                                                                                                                         |

Function errors are under the project's **Logs** tab in Vercel.

## Step 6: add keys later

Add these in Vercel under the project's **Settings**, then **Environment Variables**. Tick **Production** (and **Preview** if you want preview URLs to use them too). Mark keys as **Sensitive** so they cannot be read back in the dashboard.

| Variable                                        | Needed for                           | Notes                                                                         |
| ----------------------------------------------- | ------------------------------------ | ----------------------------------------------------------------------------- |
| `GEMINI_API_KEY`                                | Contextual scoring and explanations  | Free from [Google AI Studio](https://aistudio.google.com/apikey). Server only |
| `GEMINI_MODEL`                                  | Optional                             | Defaults to `gemini-3.5-flash-lite`                                           |
| `ELEVENLABS_API_KEY`                            | Live listening (`/api/scribe-token`) | Server only                                                                   |
| `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`   | Sharing reports across devices       | Public by design. Run the Supabase migrations and `supabase/seed.sql` first   |
| `VITE_CALL_SERVER_URL`, `VITE_TRUSTLINE_NUMBER` | Merged phone calls                   | Only after the call server is deployed                                        |

Rules:

- **Never put a secret in a `VITE_` variable.** Anything starting with `VITE_` is built into the JavaScript every visitor downloads.
- **Redeploy after changing variables.** `VITE_` values are baked in at build time, and server variables are read by new deployments. From the CLI: `vercel --prod`. From the dashboard: **Deployments**, the newest deployment's menu, **Redeploy**.
- From the CLI you can also add a variable with `vercel env add GEMINI_API_KEY production` (it prompts for the value, so it does not land in your shell history).
- **Gemini free tier:** Google may use free-tier prompts to improve its products. Use the scripted demo calls, not real calls, until the team moves to a paid key (see `PRIVACY.md` and `CLAUDE-SHARED.md`).
- Spending caps and kill switches are covered in `TrustLine-Secure-API-Setup-Plan.md` in this folder.

When the call server is deployed, set its `APP_ORIGIN` to the Vercel URL exactly (for example `https://trustline.vercel.app`, no trailing slash) so the app is allowed to receive call events.

## Step 7: put the link on GitHub and in the README

1. **Repository About section.** On the repository page, click the gear icon next to **About**, paste the URL into **Website** and save. Or:

   ```bash
   gh repo edit StormHacks-BlackBay/trustline --homepage "https://trustline.vercel.app"
   ```

2. **README.** Add a "Try it out" section near the top of `README.md`:

   ```md
   ## Try It Out 🔗

   **Live app:** https://trustline.vercel.app

   - **Call check** (`/`): play a demo call to see a warning, the official number and the share flow. Choose a warning language to see warnings in Punjabi, Mandarin, Tagalog or Farsi.
   - **Partner dashboard** (`/partner`): open it in another tab of the same browser to see shared reports and publish an advisory.
   - Live listening, Gemini explanations and merged phone calls need API keys; without them the app runs in basic mode with rules-based warnings.
   ```

3. **Devpost.** Use the same URL as the "Try it out" link, and update `docs/SUBMISSION.md`.

4. **Team log.** Add an entry to `docs/team-sync.md` with the URL, which route was used, who owns the Vercel project, and which environment variables are set (names only, never values).

## Troubleshooting

| Symptom                                                                                  | Likely cause                                                                                                                                                                        | Fix                                                                                                                                                                                                                                                                              |
| ---------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Build fails on Vercel                                                                    | Type or lint error that `npm run check` would also catch                                                                                                                            | Run `npm run check` locally, fix, push or redeploy                                                                                                                                                                                                                               |
| `/partner` shows a 404                                                                   | `vercel.json` missing from the deployment                                                                                                                                           | Confirm `vercel.json` is at the repository root and redeploy                                                                                                                                                                                                                     |
| `/api/score` returns `FUNCTION_INVOCATION_FAILED`, or logs show `ERR_MODULE_NOT_FOUND`   | The package uses ES modules (`"type": "module"`), and Node needs file extensions on relative imports at runtime. Our `api/` files import without extensions (for example `./_http`) | Tell Ariel's or Rishon's assistant: "Vercel functions fail with ERR_MODULE_NOT_FOUND; make the imports reachable from `api/` use explicit `.js` extensions and verify with `npm run check`." This has not been tested on Vercel yet, so check it on the first preview deployment |
| A GitHub push does not deploy, and GitHub shows a Vercel message about the commit author | Hobby plan with a private organization repository                                                                                                                                   | Use Route B, make the repo public (Route A), or use Pro (Route C)                                                                                                                                                                                                                |
| "Start listening" says transcription is not set up                                       | `ELEVENLABS_API_KEY` missing, or added without redeploying                                                                                                                          | Add the key, redeploy                                                                                                                                                                                                                                                            |
| Warnings say "Basic mode"                                                                | `GEMINI_API_KEY` missing, invalid or rate-limited                                                                                                                                   | Add or check the key, redeploy; check the function logs                                                                                                                                                                                                                          |
| The browser blocks the microphone                                                        | Permission denied, or the page is not on HTTPS                                                                                                                                      | Vercel URLs are HTTPS; allow the microphone in the browser's site settings                                                                                                                                                                                                       |
| A changed `VITE_` variable has no effect                                                 | `VITE_` values are fixed at build time                                                                                                                                              | Redeploy                                                                                                                                                                                                                                                                         |
| The phone call never appears in the app                                                  | `VITE_CALL_SERVER_URL` wrong, or the call server's `APP_ORIGIN` does not match the Vercel URL                                                                                       | Fix both values; redeploy the web app and restart the call server                                                                                                                                                                                                                |

## Sources

- Vercel, [Deploying Git Repositories with Vercel](https://vercel.com/docs/git) (Hobby and Pro rules for private organization repositories), last updated 2026-09-18.
- Vercel, [Vite on Vercel](https://vercel.com/docs/frameworks/frontend/vite) (SPA rewrites, environment variables), last updated 2026-08-26.
- Vercel, [Deploying a project from the CLI](https://vercel.com/docs/projects/deploy-from-cli).
- Vercel community, [Why can't Hobby accounts deploy from organizations?](https://community.vercel.com/t/why-cant-hobby-accounts-deploy-from-organizations/10015)
