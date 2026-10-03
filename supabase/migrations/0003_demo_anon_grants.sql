-- Demo access for the current app, which has no sign-in yet.
--
-- The project was created with "Automatically expose new tables" turned off, so tables are not
-- reachable through the Data API until privileges are granted. This grants the anon role exactly
-- what src/lib/store/supabaseStore.ts uses. Row level security from 0001 still applies on top.
--
-- Anyone with the site's public key can read incidents and publish advisories with these grants.
-- Use fictional demo calls only. docs/shared-plans/Supabase-Setup-Guide.md section 5 describes
-- the partner sign-in migration that replaces this by revoking anon access to incidents and
-- advisory writes.

grant usage on schema public to anon;

-- Reference data the app reads.
grant select on public.partners, public.directory_entries to anon;

-- Sharing a report: insert().select().single() needs both privileges.
grant select, insert on public.incidents to anon;

-- Publishing and receiving advisories.
grant select, insert on public.advisories to anon;
