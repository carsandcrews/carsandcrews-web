create table public.event_submissions (
  id uuid default gen_random_uuid() primary key,
  submitted_by uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  date date not null,
  city text not null,
  state text not null,
  location_name text,
  description text,
  source_url text,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  reviewed_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table public.event_claims (
  id uuid default gen_random_uuid() primary key,
  event_id uuid references public.events(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  message text not null,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  reviewed_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table public.admin_actions (
  id uuid default gen_random_uuid() primary key,
  admin_id uuid references public.profiles(id) not null,
  action_type text not null
    check (action_type in ('create', 'update', 'delete', 'approve', 'reject')),
  target_type text not null
    check (target_type in ('event', 'vehicle', 'profile', 'submission', 'claim')),
  target_id uuid not null,
  reason text,
  created_at timestamptz not null default now()
);

-- RLS
alter table public.event_submissions enable row level security;
alter table public.event_claims enable row level security;
alter table public.admin_actions enable row level security;

-- Users can see their own submissions
create policy "submissions_select_own"
  on public.event_submissions for select
  using (auth.uid() = submitted_by);

-- Users can create submissions
create policy "submissions_insert_auth"
  on public.event_submissions for insert
  with check (auth.uid() = submitted_by);

-- Admins can see and manage all submissions
create policy "submissions_admin_all"
  on public.event_submissions for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Users can see their own claims
create policy "claims_select_own"
  on public.event_claims for select
  using (auth.uid() = user_id);

-- Users can create claims
create policy "claims_insert_auth"
  on public.event_claims for insert
  with check (auth.uid() = user_id);

-- Admins can see and manage all claims
create policy "claims_admin_all"
  on public.event_claims for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Only admins can see audit log
create policy "admin_actions_admin_only"
  on public.admin_actions for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Only admins can insert audit entries
create policy "admin_actions_insert_admin"
  on public.admin_actions for insert
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Indexes
create index event_submissions_status_idx on public.event_submissions (status);
create index event_submissions_submitted_by_idx on public.event_submissions (submitted_by);
create index event_claims_status_idx on public.event_claims (status);
create index event_claims_event_id_idx on public.event_claims (event_id);
create index admin_actions_admin_id_idx on public.admin_actions (admin_id);
create index admin_actions_target_idx on public.admin_actions (target_type, target_id);
