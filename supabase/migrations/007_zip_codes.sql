-- supabase/migrations/007_zip_codes.sql
create table zip_codes (
  zip text primary key,
  lat numeric not null,
  lng numeric not null,
  city text not null,
  state text not null
);
