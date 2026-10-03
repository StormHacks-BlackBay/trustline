# TrustLine Supabase setup: free-tier collaboration demo

Prepared October 3, 2026 against local commit `50d046d`.

This guide explains what to do in Supabase, what to configure locally and on the host, and which application changes are required. Writing this guide has not created a cloud project, applied migrations, or implemented authentication. The SQL below is a proposed migration and must be reviewed and tested on the dedicated demo project.

## 1. Choose the smallest useful setup

Use one Supabase Free project for the two-person hackathon demo. Supabase supplies the database, authentication, and Realtime subscriptions. You do not need a paid plan, custom database domain, Storage bucket, Edge Function, SMS login, or separate database server for this workflow.

The intended demonstration is:

1. Device A submits a fictional, redacted incident for Demo Newcomer Society.
2. That organization's signed-in partner view receives it.
3. The partner publishes an advisory.
4. Device B, representing Demo Credit Union, receives the advisory.

Advisories are intentionally shared across organizations. Private incident access stays within the relevant organization.

The existing no-Supabase fallback uses localStorage and BroadcastChannel. It works between tabs of one browser at the same origin, but does not synchronize a phone and a laptop. Keep this fallback for judging.

Check the [current Free plan](https://supabase.com/pricing) and [billing documentation](https://supabase.com/docs/guides/platform/billing-on-supabase) when creating the project. A short demonstration with small text records should fit comfortably, but account limits and existing projects still matter.

## 2. Know what is already implemented

| File | Current purpose |
| --- | --- |
| `src/lib/store/index.ts` | Chooses Supabase only when both Supabase environment variables are nonempty |
| `src/lib/store/supabaseStore.ts` | Inserts and reads incidents/advisories and subscribes to INSERT events |
| `src/lib/store/localStore.ts` | Same-browser fallback |
| `supabase/migrations/0001_init.sql` | Creates four tables, initial policies, and Realtime publication membership |
| `supabase/migrations/0002_directory_short_name.sql` | Adds the directory `short_name` column |
| `supabase/seed.sql` | Seeds partner and directory records |
| `scripts/generate-seed.ts` | Regenerates the seed from the TypeScript source data |
| `src/data/partners.ts` | Defines the two demo organizations and demo personas |

Important findings:

- The application currently has no Supabase login flow. Its persona selector is not authentication.
- The initial migration allows anonymous users to read incidents and publish advisories.
- A client query filter such as `.eq("partner_id", partnerId)` is not access control; a caller can remove it.
- Both insert functions use `.insert(...).select().single()`. Authorized writers also need permission to read the inserted row, or the current flow can fail.
- Partner names and the verification directory are currently defined in app source. Seeding database directory rows does not automatically make that table the UI's directory source.

**Do not publish a shared-data demo using only the original anonymous policies.** Complete the authentication/policy steps below before distributing a deployment that connects to this database. Protecting the webpage alone does not protect the directly accessible Supabase API.

## 3. Create the Supabase project

1. Open the [Supabase dashboard](https://supabase.com/dashboard) and sign in.
2. Create or select an organization on the **Free** plan. Keep it separate from unrelated paid projects if possible.
3. Create a project named `trustline-stormhacks`.
4. Select a nearby available North American region. Avoid spending time or money on multi-region infrastructure for the demo.
5. Generate a strong database password and save it in your password manager. This password is not needed by the current browser application and must not enter Git or a `VITE_` variable.
6. Wait for provisioning to complete. Confirm the project is active and the organization is still Free.
7. Assign one teammate to database configuration and the other to UI integration. Use individual dashboard accounts if sharing administrative access; do not share the owner's password.

Keep the project reference and region in team notes if useful. Do not record database passwords, provider keys, or login passwords in this shared guide.

## 4. Initialize a fresh database in the correct order

Use the SQL Editor in the dedicated new Supabase project. The Dashboard SQL Editor avoids installing another tool for the hackathon.

1. Open local `supabase/migrations/0001_init.sql`, copy its SQL, and execute it in a new SQL Editor query.
2. Execute `supabase/migrations/0002_directory_short_name.sql` next.
3. Execute the proposed authentication migration from Step 5 before putting credentials into a publicly distributed app.
4. Execute `supabase/seed.sql`.

Do not run the seed before migration 0002: the seed writes `short_name`.

If the source partner/directory data has changed, regenerate the seed from the checkout first:

```sh
cd /Users/arieltyson/Desktop/Projects/trustline
npm run db:seed-sql
```

Inspect the resulting diff before running it. The seed upserts partner and directory records; it does not create demo user accounts or erase existing incidents.

The original migrations are not written as universally repeatable scripts. If tables already exist, inspect their schema and which migrations were applied instead of rerunning blindly or dropping tables. Applying SQL manually does not automatically establish a complete Supabase CLI migration history; record the applied filenames and reconcile history if adopting CLI migrations later.

Verify the initial tables without printing incident content:

```sql
select table_name
from information_schema.tables
where table_schema = 'public'
order by table_name;

select column_name
from information_schema.columns
where table_schema = 'public'
  and table_name = 'directory_entries'
  and column_name = 'short_name';
```

## 5. Replace anonymous access with explicit demo memberships

For this weekend, use two pre-created Supabase Auth accounts, one per demo organization. Each account may submit incidents, review incidents, and publish advisories for its own organization. This is a deliberately small **team-operated demo authorization model**, not a production separation between customers and partner staff.

Save the following as a new migration, such as `supabase/migrations/0003_demo_partner_auth.sql`, when implementing this plan. It is included here for review; this guide has not created or applied that migration.

```sql
begin;

create table public.partner_memberships (
  user_id uuid not null references auth.users(id) on delete cascade,
  partner_id text not null references public.partners(id) on delete cascade,
  primary key (user_id, partner_id)
);

alter table public.partner_memberships enable row level security;
revoke all on public.partner_memberships from anon, authenticated;
grant select on public.partner_memberships to authenticated;

create policy "members read own memberships"
on public.partner_memberships for select to authenticated
using (user_id = (select auth.uid()));

drop policy if exists "demo partners read incidents" on public.incidents;
drop policy if exists "users share incidents" on public.incidents;
drop policy if exists "demo partners publish advisories" on public.advisories;

revoke all on public.incidents from anon, authenticated;
grant select, insert on public.incidents to authenticated;

revoke all on public.advisories from anon, authenticated;
grant select on public.advisories to anon, authenticated;
grant insert on public.advisories to authenticated;

revoke all on public.partners, public.directory_entries from anon, authenticated;
grant select on public.partners, public.directory_entries to anon, authenticated;

create policy "members read partner incidents"
on public.incidents for select to authenticated
using (
  exists (
    select 1 from public.partner_memberships m
    where m.user_id = (select auth.uid())
      and m.partner_id = incidents.partner_id
  )
);

create policy "members submit partner incidents"
on public.incidents for insert to authenticated
with check (
  exists (
    select 1 from public.partner_memberships m
    where m.user_id = (select auth.uid())
      and m.partner_id = incidents.partner_id
  )
);

create policy "members publish partner advisories"
on public.advisories for insert to authenticated
with check (
  exists (
    select 1 from public.partner_memberships m
    where m.user_id = (select auth.uid())
      and m.partner_id = advisories.publisher_id
  )
);

create policy "signed in users read advisories"
on public.advisories for select to authenticated using (true);

create policy "signed in users read partners"
on public.partners for select to authenticated using (true);

create policy "signed in users read directory"
on public.directory_entries for select to authenticated using (true);

commit;
```

The existing anonymous SELECT policies on advisories, partners, and directory entries remain intentionally available. There is no browser permission to grant memberships, update/delete records, or read another organization's incidents.

Check the resulting policy list:

```sql
select tablename, policyname, roles, cmd, qual, with_check
from pg_policies
where schemaname = 'public'
order by tablename, policyname;
```

Review any additional policies already present. A leftover permissive policy can undermine the new policy. Use this exact SQL only on a schema matching the reviewed repository; do not assume it hardens an unrelated existing project.

For future real users, introduce reporter/staff roles, incident ownership, tighter field validation, retention controls, and abuse limits. Do not authorize staff based on a demo persona, organization dropdown, or user-editable profile metadata. See [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security).

## 6. Create the two demo Auth accounts

1. In Supabase Authentication settings, use email/password authentication. Avoid SMS authentication and its separate delivery costs.
2. Create two controlled demo users through Authentication → Users → Add user (dashboard wording may vary). Use email addresses you control and unique passwords held in a password manager.
3. Confirm/verify these controlled accounts through the supported dashboard workflow. Do not disable verification globally simply to work around an email problem.
4. Disable public signups for this team-operated demo if that option is available. Existing users should still be able to sign in; test this.
5. Copy each user's UUID from the Users page. These IDs are identifiers, not API secrets.
6. In SQL Editor, assign memberships after the partner seed has run. Replace the UUID placeholders below before executing:

```sql
insert into public.partner_memberships (user_id, partner_id)
values
  ('REPLACE_WITH_FIRST_AUTH_USER_UUID'::uuid, 'demo-newcomer-society'),
  ('REPLACE_WITH_SECOND_AUTH_USER_UUID'::uuid, 'demo-credit-union');
```

Do not commit real account passwords or membership scripts containing unrelated personal information. Do not grant the second account the first organization's membership just to make a failing authorization test pass.

Configure the Auth Site URL to the intended hosted application. If you use confirmation/recovery redirects, allow only the needed local and deployed URLs. Password sign-in itself does not need a custom SMTP service. [Password authentication guide](https://supabase.com/docs/guides/auth/passwords)

## 7. Add the missing login integration

**Developer work required:** the current app does not sign in to Supabase. Adding environment variables alone will not make the Step 5 policies usable.

1. Create one shared Supabase client module (for example `src/lib/supabase.ts`) using the two public environment values. Handle the unconfigured case so replay/local mode still works.
2. Refactor `createSupabaseStore` to use that shared client rather than creating a separate hidden client inside the store. Ensure auth and data operations use the same session.
3. Add a minimal email/password login form and sign-out action. Submit the form through `client.auth.signInWithPassword({ email, password })`; never embed credentials in the bundle or environment variables.
4. Initialize auth state and subscribe to `onAuthStateChange`. Wait for session initialization before fetching protected incidents.
5. Query the signed-in user's memberships and restrict partner choices accordingly. Keep enforcement in RLS even when the UI hides unauthorized options.
6. On sign-in, recreate protected queries and Realtime subscriptions using the authenticated client. On sign-out or account change, clear cached incidents and remove old subscriptions immediately. Never leave a previous account's incident list visible.
7. The demo-user selector may still set display language/persona, but cannot authorize database access. If the chosen persona belongs to an unauthorized partner, block that write and explain how to switch accounts.
8. Handle errors visibly: failed submission, session expired, or permission denied should not appear as successful sharing. Do not silently switch to local storage when a configured remote write fails.
9. Never render incident/advisory content as untrusted raw HTML. Keep credentials and auth tokens out of logs, analytics, and screenshots.

Supabase Auth session tokens are browser credentials in this client-side architecture. Public project keys may be visible; signed-in sessions must not be shared. This setup protects database access only. It does not automatically protect the separate ElevenLabs/Gemini API endpoints or the telephone server.

If time runs out before login and policy tests are complete, use the local-store fallback for judging. Do not restore anonymous incident access to make the demo work.

## 8. Obtain the correct URL and key

In the Supabase project, open **Connect** or project settings/API settings and locate:

- **Project URL:** a URL resembling `https://YOUR_PROJECT_REF.supabase.co`.
- **Publishable key:** the browser-safe project key, typically beginning `sb_publishable_`.

Supabase also offers legacy `anon` keys. The existing variable is named `VITE_SUPABASE_ANON_KEY`; despite that name, it is passed directly as the public key argument to `createClient`. Prefer a publishable key with the installed current client and verify REST and Realtime both work. If a compatibility issue requires the legacy anon key, use that public key—not a secret key.

Never use `sb_secret_...`, `service_role`, a JWT signing secret, database password, or a database connection string in a browser environment variable. These are not required for the reviewed client integration. Public keys do not grant partner membership; RLS and the authenticated user's session decide access. [Official API key guidance](https://supabase.com/docs/guides/getting-started/api-keys)

## 9. Configure the existing local environment

Your local `.env` already exists and contains other project configuration. Edit only the two Supabase lines; **do not overwrite the file** or copy the example over it.

```dotenv
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_PUBLISHABLE_KEY
```

Privately verify the file stays ignored and owner-readable only:

```sh
cd /Users/arieltyson/Desktop/Projects/trustline
chmod 600 .env
git check-ignore .env
git ls-files -- .env '.env.*'
```

Expected: `.env` is ignored; only `.env.example` is tracked among those environment filenames. Keep actual values out of the example file. Do not print the full `.env`: it contains private provider credentials alongside these public values.

Restart `npm run dev` after editing the environment. Both Supabase variables must be set to activate the Supabase store. A missing variable selects the local store; invalid nonempty credentials select Supabase and fail rather than automatically falling back.

## 10. Verify Realtime is enabled

The initial migration already adds `incidents` and `advisories` to the `supabase_realtime` publication. Do not add them twice.

Check membership in SQL Editor:

```sql
select schemaname, tablename
from pg_publication_tables
where pubname = 'supabase_realtime'
order by schemaname, tablename;
```

Expected rows include `public.incidents` and `public.advisories`. If one is missing, use the dashboard's Realtime/replication controls or add only that missing table to the publication.

The existing app listens for INSERT events, not UPDATE or DELETE. Test with a new incident/advisory. You do not need `REPLICA IDENTITY FULL` for the current insert-only workflow. A partner incident subscription filter reduces traffic; RLS supplies the authorization boundary. [Realtime setup documentation](https://supabase.com/docs/guides/realtime/subscribing-to-database-changes)

## 11. Deploy the web configuration

1. Complete the auth integration and tests before connecting the public build.
2. In the web host's project environment settings, add the two `VITE_SUPABASE_*` values for the intended environment.
3. Build and redeploy. Vite embeds these values at build time; changing dashboard variables alone does not update an already built site.
4. Use the same Supabase project on both devices. Separate preview builds pointed at different projects will not synchronize.
5. Test login on the exact HTTPS deployment URL you intend to show judges.
6. Leave unrelated preview builds without Supabase variables unless they need access. Avoid granting unknown preview deployments access to real data.

The browser-safe URL/key belong to the web application. The reviewed store does not require a database credential on the separate telephone server. Do not add one there without a concrete server feature that needs it.

## 12. Run the end-to-end judging rehearsal

Use only fictional reports. Test Supabase with transcript replay first so debugging database behavior does not consume ElevenLabs or model credits.

1. Run `npm run check` after the auth changes and fix failures.
2. On Device A, sign in as the Newcomer Society demo account and choose its matching persona.
3. Replay a suspicious call. Share the redacted incident with consent.
4. Open `/partner` in another tab signed into that same account. Confirm the incident appears without reloading.
5. Publish a distinctive advisory, such as `Demo: gift-card request — rehearsal 1`.
6. On Device B, sign in as the Credit Union account. Confirm the new advisory arrives without reloading.
7. Reload Device B and confirm the advisory persists, proving it is stored remotely.
8. Confirm Device B cannot retrieve Newcomer Society incidents by changing the partner selector, URL, query filter, or request body.
9. Sign out and verify private incidents disappear from the screen and cannot be fetched directly.
10. Confirm browser Network tools show the expected Supabase project, without exposing any long-lived provider secret.

Add authorization tests independent of the UI:

| Caller/action | Expected result |
| --- | --- |
| Logged-out client reads incidents | No incident access |
| Logged-out client inserts incident/advisory | Rejected |
| First account reads/submits its own partner incident | Succeeds |
| First account reads second partner's incidents | No rows available |
| First account submits to second partner | Rejected |
| First account publishes as second partner | Rejected |
| Either account reads published advisories | Succeeds |
| Browser client creates/changes memberships | Rejected |

Use the actual publishable-key client and test account sessions for these tests. A successful SQL Editor query runs with administrative privileges and does not demonstrate that browser RLS works. SELECT policies may hide unauthorized rows rather than return an HTTP error; assert that protected data is absent.

## 13. Troubleshooting

| Symptom | Check first |
| --- | --- |
| Works in two tabs but not on a phone | Both environment values; rebuild/restart; ensure store is Supabase |
| Seed fails mentioning `short_name` | Apply migration 0002 before seed |
| Relation already exists | Inspect applied schema; do not rerun initial migrations blindly |
| Insert fails with an RLS error | Auth session, exact partner membership, INSERT policy, and SELECT policy for returned row |
| Dashboard shows no incidents | Correct partner ID and membership; original policies only granted `anon`, not authenticated users |
| Record appears after refresh only | Publication membership, authenticated subscription lifecycle, WebSocket connection, SELECT access |
| Publish succeeds but no other-device advisory | Both devices' project URL/key, INSERT subscription, network, and public/authenticated advisory SELECT policies |
| Login fails | Account exists in this project, confirmation state, password, auth settings |
| Still shows old project after deploy | Vite variables were not rebuilt into the latest deployment |
| Project appears unavailable later | Check whether the Free project is paused and restore it in the dashboard |

Do not fix permission errors by disabling RLS or putting a service-role key in the browser. See [Realtime troubleshooting](https://supabase.com/docs/guides/troubleshooting/realtime-postgres-changes-troubleshooting).

## 14. Cost controls, Git, and cleanup

- Stay on Free for the hackathon; review usage rather than buying extra compute, domains, backups, or another project preemptively.
- Store redacted text, not call audio. The reviewed schema needs no Storage bucket.
- Keep the existing list limits (50 incidents and 20 advisories), and remove subscriptions when components unmount or accounts change.
- Use public replay/rules mode for repeated UI rehearsals. Supabase does not require live AI calls to demonstrate partnerships.
- Before a later portfolio demonstration, check project status. Supabase documents pausing Free projects after low activity over seven days; restore and rehearse beforehand rather than adding artificial traffic. [Project pausing](https://supabase.com/docs/guides/platform/free-project-pausing)
- Commit reviewed migration, login, and documentation changes when ready. Do not commit `.env`, account passwords, auth sessions, or administrative keys. Review staged filenames and diff before pushing; leave unrelated screenshot changes out.
- After judging, remove unneeded demo accounts and fictional incidents through administrative tools. Revoke their sessions. Keep only intentional public advisories and a replay portfolio if you do not plan to maintain live access.
- If disabling Supabase in a portfolio build, clear both public variables and rebuild. That does not erase the cloud database; clean up the project separately.

## Ready-for-judging checklist

- [ ] Dedicated Free project is active.
- [ ] Migrations 0001 and 0002, reviewed auth migration, and seed applied in order.
- [ ] Anonymous incident reads and writes are removed.
- [ ] Two Auth accounts have correct, different partner memberships.
- [ ] App login, logout, membership-aware views, and subscription cleanup are implemented.
- [ ] Local and hosted apps use public keys only and the same intended project.
- [ ] New incidents and advisories synchronize between devices.
- [ ] Direct unauthorized operations fail, not merely hidden in the UI.
- [ ] Actual judges' flow has been rehearsed with fictional data.
- [ ] Same-browser no-Supabase fallback remains available.

This provides a small, reviewable partnership demonstration without a paid database plan. It does not establish production readiness for real financial incidents; the explicitly scoped demo accounts and authorization tests are part of the setup, not optional polish.
