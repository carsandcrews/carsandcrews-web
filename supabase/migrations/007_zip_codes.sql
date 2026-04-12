-- supabase/migrations/007_zip_codes.sql
create table zip_codes (
  zip text primary key,
  lat numeric not null,
  lng numeric not null,
  city text not null,
  state text not null
);

alter table zip_codes enable row level security;
create policy "zip_codes_public_read" on zip_codes for select using (true);

create or replace function nearest_zip(
  user_lat numeric,
  user_lng numeric
) returns table (zip text, city text, state text) as $$
  select z.zip, z.city, z.state
  from zip_codes z
  order by (z.lat - user_lat)^2 + (z.lng - user_lng)^2
  limit 1;
$$ language sql stable;
