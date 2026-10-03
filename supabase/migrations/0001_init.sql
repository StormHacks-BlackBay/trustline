-- TrustLine schema. Demo build: there is no login, so the anon role gets the minimum access the
-- demo needs. A production build would scope incident reads to an authenticated partner.

create table partners (
  id text primary key,
  name text not null,
  kind text not null check (kind in ('community', 'financial'))
);

create table directory_entries (
  id text primary key,
  organization text not null,
  aliases text[] not null default '{}',
  category text not null check (category in ('government', 'bank', 'reporting')),
  phone text,
  url text not null,
  guidance text not null
);

create table incidents (
  id uuid primary key default gen_random_uuid(),
  partner_id text not null references partners (id),
  risk text not null check (risk in ('low', 'medium', 'high')),
  flags text[] not null default '{}',
  claimed_org text,
  redacted_excerpt text not null check (char_length(redacted_excerpt) <= 2000),
  language text not null,
  created_at timestamptz not null default now()
);

create table advisories (
  id uuid primary key default gen_random_uuid(),
  publisher_id text not null references partners (id),
  title text not null check (char_length(title) <= 120),
  body text not null check (char_length(body) <= 1000),
  claimed_org text,
  created_at timestamptz not null default now()
);

create index incidents_partner_created_idx on incidents (partner_id, created_at desc);
create index advisories_created_idx on advisories (created_at desc);

alter table partners enable row level security;
alter table directory_entries enable row level security;
alter table incidents enable row level security;
alter table advisories enable row level security;

create policy "partners are public" on partners for select to anon using (true);
create policy "directory is public" on directory_entries for select to anon using (true);
create policy "advisories are public" on advisories for select to anon using (true);
create policy "demo partners publish advisories" on advisories for insert to anon with check (true);
create policy "users share incidents" on incidents for insert to anon with check (true);
create policy "demo partners read incidents" on incidents for select to anon using (true);

alter publication supabase_realtime add table incidents, advisories;
