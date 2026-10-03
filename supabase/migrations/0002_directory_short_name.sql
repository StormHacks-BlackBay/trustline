-- How each organization is said aloud in spoken warnings, e.g. "IRCC".
alter table directory_entries add column short_name text not null default '';
