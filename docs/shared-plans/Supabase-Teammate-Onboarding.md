# Supabase for TrustLine: what it does and how to get access

Written October 3, 2026 for Rishon by Ariel. The Supabase project is already set up and tested; this guide explains what it does and how to get the same access on your machine.

## Part 1: what Supabase is doing in TrustLine

### In one sentence

Supabase is the shared database that lets a scam report made on one person's phone show up on a partner organization's dashboard, and lets that organization's advisory show up on everyone else's phones, live.

### Why we need it

Without Supabase, the app uses a local demo store (`src/lib/store/localStore.ts`). It saves reports in the browser's localStorage and passes them between tabs with BroadcastChannel. That only works **inside one browser on one device**. A phone and a laptop cannot see each other's data.

With Supabase, both devices talk to the same database in the cloud, so the Goal 17 story in the demo actually happens across devices:

```
Phone A (Harpreet)                 Supabase (cloud)                 Laptop (Demo Newcomer Society)
  shares a redacted report  ──▶  incidents table  ──realtime──▶  partner dashboard shows it
                                                                     │ publishes an advisory
Phone B (Mei, Demo Credit Union) ◀──realtime──  advisories table  ◀──┘
  sees the community alert banner
```

In testing, a report reached the dashboard in about 0.1 seconds and the advisory reached the second phone in under a second.

### What is in the database

The project is `trustline-stormhacks` (ref `tixwegxffiuouvrjavra`, region `us-east-1`, Free plan). It is Postgres with four tables:

| Table               | What it holds                                          | Who writes it                                         |
| ------------------- | ------------------------------------------------------ | ----------------------------------------------------- |
| `partners`          | The two demo organizations                             | The seed file                                         |
| `directory_entries` | Official contact channels (IRCC, CRA, banks and so on) | The seed file, generated from `src/data/directory.ts` |
| `incidents`         | Redacted reports users chose to share                  | The app, when a user taps Share                       |
| `advisories`        | Community alerts partners publish                      | The app, from the partner dashboard                   |

The app still reads partners and the directory from `src/data/` in the code. The database copies exist so the data is in one place for later work.

The tables are defined in `supabase/migrations/`:

| Migration                       | What it does                                                                                                                        |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `0001_init.sql`                 | Creates the four tables, turns on row level security, adds the access rules, and turns on realtime for `incidents` and `advisories` |
| `0002_directory_short_name.sql` | Adds `short_name`, how an organization is said aloud ("IRCC") in spoken warnings                                                    |
| `0003_demo_anon_grants.sql`     | Gives the browser permission to use exactly the tables and actions the app needs                                                    |

### The four pieces of Supabase we use

1. **Postgres database.** Stores the four tables above.
2. **Data API.** Supabase automatically turns tables into a web API. The app never connects to Postgres directly; it calls this API through the `@supabase/supabase-js` library in `src/lib/store/supabaseStore.ts`.
3. **Realtime.** When a row is inserted into `incidents` or `advisories`, Supabase pushes it to every app that is subscribed. That is why the dashboard and the advisory banner update without refreshing.
4. **Row level security (RLS) and grants.** These decide what the browser is allowed to do (next section).

### What protects the data

Two layers have to agree before the browser can do anything:

1. **Grants** say which actions a role may attempt on a table. The project was created with "Automatically expose new tables" turned **off**, so nothing is reachable until a migration grants it. Migration `0003` grants the browser (the `anon` role) only:
   - read `partners` and `directory_entries`
   - read and insert `incidents`
   - read and insert `advisories`
2. **Row level security** decides which rows those actions apply to. It is on for all four tables, and the policies in `0001` allow the actions above.

Anything else is refused. We tested this: deleting reports and renaming a partner through the public API both failed with "permission denied".

**This is demo access, not production security.** There is no sign-in yet, so anyone who has the site's public key can read every report and publish an advisory. Use only the scripted demo calls, never real calls or real personal details. The plan to replace this with partner sign-in is in `Supabase-Setup-Guide.md`, section 5 (that migration will be `0004`, because `0003` is taken).

### The keys and what each one is for

| Key                                                    | Where it lives                                | Secret?                                                                                         |
| ------------------------------------------------------ | --------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Project URL `https://tixwegxffiuouvrjavra.supabase.co` | `VITE_SUPABASE_URL` in `.env` and Vercel      | No                                                                                              |
| Publishable key (`sb_publishable_...`)                 | `VITE_SUPABASE_ANON_KEY` in `.env` and Vercel | No. It is built into the website on purpose; the grants and RLS above are what protect the data |
| Database password                                      | Ariel's password manager only                 | **Yes.** Never in Git, `.env`, a `VITE_` variable or chat                                       |
| Secret key (`sb_secret_...`) or `service_role` key     | Not used by TrustLine                         | **Yes.** Never put it anywhere in this project                                                  |

The app switches to Supabase automatically when both `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set (`src/lib/store/index.ts`). If either is empty, it falls back to the local demo store, which is still useful as a backup during judging.

## Part 2: getting access

### Step 1: Ariel invites you (done by Ariel)

Ariel sends an invite from the BlackBay organization's Team page in the Supabase dashboard, with the **Developer** role on `trustline-stormhacks`. Developers can work with the data, run SQL and apply migrations, but cannot see billing or change project settings. If you later need to change settings (for example sign-in providers for the partner sign-in work), Ariel can upgrade you to Administrator.

### Step 2: accept the invite (you)

1. Open the invite email from Supabase. **It expires after 24 hours.** If it expired, ask Ariel to resend it.
2. Sign in to Supabase, or create an account, with the email address the invite was sent to. Signing in with GitHub works if your GitHub account uses that email.
3. Check you can see the **BlackBay** organization and the **trustline-stormhacks** project in the dashboard.

### Step 3: install the Supabase CLI (you)

The CLI is how we apply migrations from the repo, so the database always matches the code.

```bash
brew install supabase/tap/supabase
supabase --version
```

Version 2.119.0 or newer is what Ariel used.

### Step 4: log the CLI in (you)

In your own terminal:

```bash
supabase login
```

It opens your browser. After you approve, the page shows a short **verification code**. Paste it back into the terminal and press Enter. You should see "You are now logged in. Happy coding!"

### Step 5: link your copy of the repo (you)

```bash
cd path/to/trustline
git pull --rebase
supabase link --project-ref tixwegxffiuouvrjavra
```

You should see "Finished supabase link." If it asks for the database password, ask Ariel to share it privately, for example through a password manager's sharing feature, never by chat or in the repo. The link details are stored in `supabase/.temp/`, which Git ignores.

### Step 6: point your local app at Supabase (you)

Add these two lines to your `.env` (Git ignores this file):

```
VITE_SUPABASE_URL=https://tixwegxffiuouvrjavra.supabase.co
VITE_SUPABASE_ANON_KEY=<the sb_publishable_... key Ariel sends you>
```

Developers cannot reveal API keys in the dashboard, so Ariel sends you the publishable key. It is public by design, so a normal message is fine.

### Step 7: check it works (you)

1. Run `npm install`, then `npm run dev`.
2. Open `http://localhost:5173/partner`. The organization box should say **"Live: reports from every TrustLine member of this organization appear here."** If it says "Local demo mode", the two variables are missing or the dev server was started before you added them; restart it.
3. Open `http://localhost:5173/` in a **different browser** (or a private window), play the **IRCC impersonation** demo call and share it. It should appear on the dashboard within a second.
4. **Clean up afterwards**, so judges do not see test data. Either ask Ariel, or run:

   ```bash
   supabase db query --linked "delete from public.advisories; delete from public.incidents;"
   ```

## Part 3: working with the database day to day

### Changing the database

Never change tables by clicking around in the dashboard; the repo would stop matching the database. Instead:

1. Add a new file in `supabase/migrations/`, numbered after the last one (the next is `0004_...sql`).
2. Remember that tables are **not** exposed automatically. Any new table the browser uses needs an explicit `grant` and RLS policies in the migration.
3. Preview, then apply:

   ```bash
   supabase db push --dry-run
   supabase db push
   ```

4. If the seed data changed (`src/data/`), regenerate it with `npm run db:seed-sql` and apply it with `supabase db push --include-seed`.
5. Run `npm run check`, commit, push, and add an entry to `docs/team-sync.md`.

### Looking at the data

- Dashboard: **Table Editor** in the `trustline-stormhacks` project.
- CLI: `supabase db query --linked "select count(*) from public.incidents;"`

### Rules

- Fictional demo data only while the database has anonymous demo access.
- Never put the database password, a secret key or a `service_role` key in Git, `.env`, a `VITE_` variable or chat.
- Do not turn on "Automatically expose new tables" in the project settings.
- One person applies a given migration. Say in the team chat before you run `supabase db push`, so we do not both apply changes at the same moment.

## Troubleshooting

| Symptom                                 | Likely cause                                                                                 | Fix                                                                                              |
| --------------------------------------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `AccessTokenRequiredError` from the CLI | Not logged in, or the verification code was not entered                                      | Run `supabase login` again and paste the code from the browser                                   |
| `supabase link` cannot find the project | Invite not accepted, or signed in with a different email                                     | Accept the invite with the invited email; check the project appears in your dashboard            |
| Dashboard says "Local demo mode"        | `VITE_SUPABASE_URL` or `VITE_SUPABASE_ANON_KEY` missing, or dev server not restarted         | Add both to `.env`, restart `npm run dev`                                                        |
| "permission denied for table ..."       | A table or action without a grant                                                            | Expected for anything the app should not do. If the app needs it, add a grant in a new migration |
| Reports do not appear live              | Realtime is not enabled for that table, or the page was opened before the variables were set | Check `0001` added the table to `supabase_realtime`; reload the page                             |
| "Could not share right now" in the app  | Network problem or a missing grant                                                           | Check the browser console and the Supabase dashboard's **Logs**                                  |

## Related documents

- `CLAUDE-SHARED.md`, section "Database": the current decisions in short form.
- `Supabase-Setup-Guide.md`: the full setup plan, including the partner sign-in that replaces demo access.
- `TrustLine-Vercel-Deployment-Guide.md`: adding the same two variables to Vercel.
