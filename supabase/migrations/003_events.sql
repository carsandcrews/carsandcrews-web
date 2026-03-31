create table public.events (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  slug text unique not null,
  description text,
  event_type text not null default 'other'
    check (event_type in ('car_show', 'cars_and_coffee', 'cruise_in', 'cruise', 'swap_meet', 'track_day', 'auction', 'workshop', 'meetup', 'other')),
  is_charity boolean not null default false,
  date date not null,
  end_date date,
  start_time time,
  end_time time,
  location_name text,
  address text,
  city text not null,
  state text not null,
  zip text,
  lat numeric,
  lng numeric,
  banner_url text,
  website text,
  registration_url text,
  admission_fee_text text,
  is_free_spectator boolean not null default true,
  contact_email text,
  contact_phone text,
  source text not null default 'organizer'
    check (source in ('crawled', 'submitted', 'organizer')),
  source_url text,
  claimed boolean not null default false,
  claimed_by uuid references public.profiles(id),
  created_by uuid references public.profiles(id),
  data_quality_score integer,
  status text not null default 'published'
    check (status in ('draft', 'published', 'cancelled')),
  recurring_schedule text,
  parent_event_id uuid references public.events(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger events_updated_at
  before update on public.events
  for each row execute function public.handle_updated_at();

-- RLS
alter table public.events enable row level security;

-- Published events readable by anyone
create policy "events_select_published"
  on public.events for select
  using (status = 'published');

-- Admins can see all events
create policy "events_select_admin"
  on public.events for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Authenticated users can create events
create policy "events_insert_auth"
  on public.events for insert
  with check (auth.uid() is not null);

-- Creators and claimers can update their events
create policy "events_update_own"
  on public.events for update
  using (
    auth.uid() = created_by
    or (claimed = true and auth.uid() = claimed_by)
  );

-- Admins can do anything
create policy "events_admin_all"
  on public.events for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Indexes
create index events_slug_idx on public.events (slug);
create index events_date_idx on public.events (date);
create index events_city_state_idx on public.events (city, state);
create index events_event_type_idx on public.events (event_type);
create index events_status_idx on public.events (status);
create index events_source_idx on public.events (source);
create index events_claimed_idx on public.events (claimed);
create index events_lat_lng_idx on public.events (lat, lng);
