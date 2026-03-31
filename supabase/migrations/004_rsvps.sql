create table public.rsvps (
  id uuid default gen_random_uuid() primary key,
  event_id uuid references public.events(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  status text not null check (status in ('going', 'interested')),
  created_at timestamptz not null default now(),
  unique (event_id, user_id)
);

create table public.rsvp_vehicles (
  id uuid default gen_random_uuid() primary key,
  rsvp_id uuid references public.rsvps(id) on delete cascade not null,
  vehicle_id uuid references public.vehicles(id) on delete cascade not null
);

-- RLS
alter table public.rsvps enable row level security;
alter table public.rsvp_vehicles enable row level security;

-- RSVPs on published events are readable by anyone
create policy "rsvps_select_public"
  on public.rsvps for select
  using (
    exists (
      select 1 from public.events e
      where e.id = event_id and e.status = 'published'
    )
  );

-- Users can manage their own RSVPs
create policy "rsvps_insert_own"
  on public.rsvps for insert
  with check (auth.uid() = user_id);

create policy "rsvps_update_own"
  on public.rsvps for update
  using (auth.uid() = user_id);

create policy "rsvps_delete_own"
  on public.rsvps for delete
  using (auth.uid() = user_id);

-- RSVP vehicles follow RSVP visibility
create policy "rsvp_vehicles_select"
  on public.rsvp_vehicles for select
  using (
    exists (
      select 1 from public.rsvps r
      join public.events e on e.id = r.event_id
      where r.id = rsvp_id and e.status = 'published'
    )
  );

create policy "rsvp_vehicles_insert_own"
  on public.rsvp_vehicles for insert
  with check (
    exists (
      select 1 from public.rsvps r
      where r.id = rsvp_id and r.user_id = auth.uid()
    )
  );

create policy "rsvp_vehicles_delete_own"
  on public.rsvp_vehicles for delete
  using (
    exists (
      select 1 from public.rsvps r
      where r.id = rsvp_id and r.user_id = auth.uid()
    )
  );

-- Indexes
create index rsvps_event_id_idx on public.rsvps (event_id);
create index rsvps_user_id_idx on public.rsvps (user_id);
create index rsvp_vehicles_rsvp_id_idx on public.rsvp_vehicles (rsvp_id);
