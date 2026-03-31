create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  display_name text not null default '',
  avatar_url text,
  bio text,
  city text,
  state text,
  website text,
  role text not null default 'user' check (role in ('user', 'admin')),
  stripe_customer_id text,
  subscription_tier text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    lower(replace(split_part(new.email, '@', 1), '.', '-')) || '-' || substr(new.id::text, 1, 4),
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Auto-update updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

-- RLS
alter table public.profiles enable row level security;

-- Anyone can read public profiles
create policy "profiles_select_public"
  on public.profiles for select
  using (true);

-- Users can update their own profile
create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Admins can update any profile
create policy "profiles_update_admin"
  on public.profiles for update
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Indexes
create index profiles_username_idx on public.profiles (username);
create index profiles_role_idx on public.profiles (role);
