create table public.vehicles (
  id uuid default gen_random_uuid() primary key,
  owner_id uuid references public.profiles(id) on delete cascade not null,
  year integer not null,
  make text not null,
  model text not null,
  body_style text,
  status_tag text not null default 'original'
    check (status_tag in ('restored', 'modified', 'survivor', 'in_progress', 'barn_find', 'original', 'tribute', 'custom')),
  description text,
  visibility text not null default 'public'
    check (visibility in ('public', 'unlisted', 'private')),
  slug text unique not null,
  for_sale boolean,
  price numeric,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.vehicle_photos (
  id uuid default gen_random_uuid() primary key,
  vehicle_id uuid references public.vehicles(id) on delete cascade not null,
  url text not null,
  thumbnail_url text,
  position integer not null default 0,
  caption text,
  aspect_ratio text check (aspect_ratio in ('landscape', 'portrait', 'square')),
  created_at timestamptz not null default now()
);

create table public.vehicle_specs (
  id uuid default gen_random_uuid() primary key,
  vehicle_id uuid references public.vehicles(id) on delete cascade unique not null,
  engine text,
  transmission text,
  drivetrain text,
  paint_color text,
  interior text,
  wheels_tires text
);

-- Updated_at trigger for vehicles
create trigger vehicles_updated_at
  before update on public.vehicles
  for each row execute function public.handle_updated_at();

-- RLS
alter table public.vehicles enable row level security;
alter table public.vehicle_photos enable row level security;
alter table public.vehicle_specs enable row level security;

-- Public vehicles readable by anyone
create policy "vehicles_select_public"
  on public.vehicles for select
  using (visibility = 'public');

-- Owners can see all their own vehicles
create policy "vehicles_select_own"
  on public.vehicles for select
  using (auth.uid() = owner_id);

-- Owners can insert their own vehicles
create policy "vehicles_insert_own"
  on public.vehicles for insert
  with check (auth.uid() = owner_id);

-- Owners can update their own vehicles
create policy "vehicles_update_own"
  on public.vehicles for update
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

-- Owners can delete their own vehicles
create policy "vehicles_delete_own"
  on public.vehicles for delete
  using (auth.uid() = owner_id);

-- Admins can do anything with vehicles
create policy "vehicles_admin_all"
  on public.vehicles for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Photos: readable if parent vehicle is readable
create policy "vehicle_photos_select"
  on public.vehicle_photos for select
  using (
    exists (
      select 1 from public.vehicles v
      where v.id = vehicle_id
      and (v.visibility = 'public' or v.owner_id = auth.uid())
    )
  );

-- Photos: owner can manage
create policy "vehicle_photos_insert_own"
  on public.vehicle_photos for insert
  with check (
    exists (
      select 1 from public.vehicles v
      where v.id = vehicle_id and v.owner_id = auth.uid()
    )
  );

create policy "vehicle_photos_update_own"
  on public.vehicle_photos for update
  using (
    exists (
      select 1 from public.vehicles v
      where v.id = vehicle_id and v.owner_id = auth.uid()
    )
  );

create policy "vehicle_photos_delete_own"
  on public.vehicle_photos for delete
  using (
    exists (
      select 1 from public.vehicles v
      where v.id = vehicle_id and v.owner_id = auth.uid()
    )
  );

-- Specs: same pattern as photos
create policy "vehicle_specs_select"
  on public.vehicle_specs for select
  using (
    exists (
      select 1 from public.vehicles v
      where v.id = vehicle_id
      and (v.visibility = 'public' or v.owner_id = auth.uid())
    )
  );

create policy "vehicle_specs_insert_own"
  on public.vehicle_specs for insert
  with check (
    exists (
      select 1 from public.vehicles v
      where v.id = vehicle_id and v.owner_id = auth.uid()
    )
  );

create policy "vehicle_specs_update_own"
  on public.vehicle_specs for update
  using (
    exists (
      select 1 from public.vehicles v
      where v.id = vehicle_id and v.owner_id = auth.uid()
    )
  );

-- Indexes
create index vehicles_owner_id_idx on public.vehicles (owner_id);
create index vehicles_slug_idx on public.vehicles (slug);
create index vehicles_make_idx on public.vehicles (make);
create index vehicles_visibility_idx on public.vehicles (visibility);
create index vehicle_photos_vehicle_id_idx on public.vehicle_photos (vehicle_id);
create index vehicle_specs_vehicle_id_idx on public.vehicle_specs (vehicle_id);
