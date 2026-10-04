-- The call summary page shares reports with the Canadian Anti-Fraud Centre, a government partner.
-- The same row is in supabase/seed.sql, generated from src/data/partners.ts.
alter table partners drop constraint partners_kind_check;
alter table partners
  add constraint partners_kind_check check (kind in ('community', 'financial', 'government'));

insert into partners (id, name, kind) values
  ('cafc', 'Canadian Anti-Fraud Centre', 'government')
on conflict (id) do update set name = excluded.name, kind = excluded.kind;
