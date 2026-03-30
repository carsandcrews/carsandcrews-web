# Automotive Enthusiast Site — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a unified automotive enthusiast platform (events + vehicles + profiles + admin) as a Next.js app with a separate data pipeline repo.

**Architecture:** Two repos — `carsandcrews-web` (Next.js 15 App Router on Vercel) and `carsandcrews-pipeline` (Node.js ES modules). Both share a single Supabase project (Postgres + RLS + Auth + Storage). Media stored in Cloudflare R2 with signed URL uploads.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind v4, Supabase (Auth + DB + Realtime), Cloudflare R2, Vitest, Testing Library, Playwright, GitHub Actions.

**Spec:** `docs/specs/2026-03-30-automotive-enthusiast-site-design.md`

**Conventions:** `CONVENTIONS.md` (root) — color tokens, component patterns, testing conventions, file naming. Living document — update as decisions are made.

**Overview:** `docs/specs/2026-03-30-automotive-enthusiast-site-overview.md`

**Mockups:** `docs/mockups/` — HTML mockups from brainstorming. Open in a browser to view. Key files:
- `landing-c-v4.html` — Final landing page direction (desktop + mobile)
- `color-palettes-light.html` — Dark/light palette comparisons (Palette E was chosen)

---

## File Structure — Web App

```
carsandcrews-web/
├── .github/
│   └── workflows/
│       └── ci.yml                          # Lint + typecheck + test + e2e
├── public/
│   ├── manifest.json                       # PWA manifest
│   └── sw.js                               # Service worker (via Serwist)
├── src/
│   ├── app/
│   │   ├── layout.tsx                      # Root layout (theme provider, auth, fonts)
│   │   ├── page.tsx                        # Landing page (featured + feed)
│   │   ├── (public)/
│   │   │   ├── events/
│   │   │   │   ├── page.tsx                # Event explore/search
│   │   │   │   └── [slug]/
│   │   │   │       └── page.tsx            # Event detail (SSR)
│   │   │   ├── vehicles/
│   │   │   │   ├── page.tsx                # Vehicle explore
│   │   │   │   └── [slug]/
│   │   │   │       └── page.tsx            # Vehicle detail (SSR)
│   │   │   ├── map/
│   │   │   │   └── page.tsx                # Full map view
│   │   │   └── [username]/
│   │   │       └── page.tsx                # Public profile (@username)
│   │   ├── (auth)/
│   │   │   ├── sign-in/
│   │   │   │   └── page.tsx                # Sign in
│   │   │   ├── sign-up/
│   │   │   │   └── page.tsx                # Sign up
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx                # User dashboard
│   │   │   ├── garage/
│   │   │   │   ├── page.tsx                # My vehicles list
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx            # Add vehicle
│   │   │   │   └── [id]/
│   │   │   │       └── edit/
│   │   │   │           └── page.tsx        # Edit vehicle
│   │   │   ├── events/
│   │   │   │   ├── submit/
│   │   │   │   │   └── page.tsx            # Submit an event
│   │   │   │   ├── create/
│   │   │   │   │   └── page.tsx            # Create event (organizer)
│   │   │   │   └── [id]/
│   │   │   │       └── edit/
│   │   │   │           └── page.tsx        # Edit claimed event
│   │   │   ├── settings/
│   │   │   │   └── page.tsx                # Profile settings
│   │   │   └── layout.tsx                  # Auth layout (redirect if not signed in)
│   │   ├── (admin)/
│   │   │   ├── admin/
│   │   │   │   ├── page.tsx                # Admin dashboard
│   │   │   │   ├── events/
│   │   │   │   │   └── page.tsx            # Manage events
│   │   │   │   ├── submissions/
│   │   │   │   │   └── page.tsx            # Submission queue
│   │   │   │   ├── claims/
│   │   │   │   │   └── page.tsx            # Claims queue
│   │   │   │   ├── users/
│   │   │   │   │   └── page.tsx            # Manage users
│   │   │   │   ├── vehicles/
│   │   │   │   │   └── page.tsx            # Manage vehicles
│   │   │   │   └── audit-log/
│   │   │   │       └── page.tsx            # Audit log
│   │   │   └── layout.tsx                  # Admin layout (role check)
│   │   └── api/
│   │       ├── auth/
│   │       │   └── callback/
│   │       │       └── route.ts            # Supabase auth callback
│   │       ├── upload/
│   │       │   └── signed-url/
│   │       │       └── route.ts            # Generate R2 signed upload URL
│   │       └── webhooks/
│   │           └── stripe/
│   │               └── route.ts            # Stripe webhook (future)
│   ├── components/
│   │   ├── ui/                             # Base UI components (button, input, etc.)
│   │   ├── events/                         # Event-specific components
│   │   ├── vehicles/                       # Vehicle-specific components
│   │   ├── photos/                         # Upload, gallery, photo display
│   │   ├── maps/                           # Map components
│   │   ├── layout/                         # Nav, footer, shell
│   │   └── admin/                          # Admin-specific components
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts                   # Browser Supabase client
│   │   │   ├── server.ts                   # Server Supabase client (cookies)
│   │   │   ├── middleware.ts               # Auth middleware helper
│   │   │   └── types.ts                    # Generated DB types
│   │   ├── r2/
│   │   │   └── client.ts                   # R2 signed URL generation
│   │   ├── photos/
│   │   │   ├── upload.ts                   # Client-side upload logic
│   │   │   ├── resize.ts                   # Client-side resize/compress
│   │   │   └── process.ts                  # Server-side thumbnail/WebP
│   │   ├── location/
│   │   │   └── detect.ts                   # GPS → Vercel headers → manual fallback
│   │   ├── utils.ts                        # General utilities (slug, format, etc.)
│   │   └── constants.ts                    # Event types, status tags, etc.
│   ├── hooks/
│   │   ├── use-location.ts                 # Location detection hook
│   │   └── use-upload.ts                   # Photo upload hook with progress
│   └── middleware.ts                       # Next.js middleware (auth session refresh)
├── tests/
│   ├── unit/                               # Vitest unit tests
│   ├── integration/                        # Vitest integration tests
│   └── e2e/                                # Playwright E2E tests
├── supabase/
│   ├── migrations/                         # SQL migration files
│   └── seed.sql                            # Dev seed data
├── tailwind.config.ts
├── next.config.ts
├── vitest.config.ts
├── playwright.config.ts
├── tsconfig.json
├── package.json
└── .env.local.example
```

## File Structure — Pipeline

```
carsandcrews-pipeline/
├── .github/
│   └── workflows/
│       └── ci.yml                          # Lint + test
├── src/
│   ├── config.mjs                          # Supabase URL, credentials, constants
│   ├── helpers/
│   │   ├── supabase.mjs                    # Supabase REST insert/update/query
│   │   ├── geocode.mjs                     # Nominatim geocoding with cache
│   │   ├── slug.mjs                        # Slug generation with collision handling
│   │   ├── quality.mjs                     # Data quality scoring (0-100)
│   │   └── dedup.mjs                       # Fingerprint deduplication
│   ├── scrapers/
│   │   └── car-cruise-finder.mjs           # CarCruiseFinder HTML scraper
│   ├── enrichment/
│   │   ├── pipeline.mjs                    # 6-step enrichment orchestrator
│   │   ├── source-scrape.mjs               # Step 1: re-scrape source URL
│   │   ├── deep-parse.mjs                  # Step 2: HTML deep parse
│   │   ├── outbound-links.mjs              # Step 3: follow outbound links
│   │   ├── web-search.mjs                  # Step 4: Brave search
│   │   ├── ai-extract.mjs                  # Step 5: Gemini extraction
│   │   └── geocode-validate.mjs            # Step 6: geocoding validation
│   ├── banners/
│   │   ├── pipeline.mjs                    # 8-step banner pipeline
│   │   └── r2-upload.mjs                   # Upload to R2 + generate variants
│   ├── import.mjs                          # Generic JSON → Supabase importer
│   └── cli.mjs                             # CLI entry point
├── tests/
│   ├── helpers/                             # Unit tests for helpers
│   ├── scrapers/                            # Scraper tests
│   └── enrichment/                          # Enrichment tests
├── vitest.config.mjs
├── package.json
└── .env.example
```

---

## Phase 1: Foundation

### Task 1: Scaffold Next.js Project

**Files:**
- Create: `carsandcrews-web/package.json`
- Create: `carsandcrews-web/next.config.ts`
- Create: `carsandcrews-web/tsconfig.json`
- Create: `carsandcrews-web/tailwind.config.ts`
- Create: `carsandcrews-web/.env.local.example`
- Create: `carsandcrews-web/src/app/layout.tsx`
- Create: `carsandcrews-web/src/app/page.tsx`

- [ ] **Step 1: Create the Next.js project**

```bash
npx create-next-app@latest carsandcrews-web --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm
cd carsandcrews-web
```

- [ ] **Step 2: Install core dependencies**

```bash
npm install @supabase/supabase-js @supabase/ssr
npm install -D vitest @vitest/coverage-v8 @testing-library/react @testing-library/jest-dom jsdom
```

- [ ] **Step 3: Create `.env.local.example`**

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
R2_ACCOUNT_ID=your-r2-account-id
R2_ACCESS_KEY_ID=your-r2-access-key
R2_SECRET_ACCESS_KEY=your-r2-secret
R2_BUCKET_NAME=your-bucket
R2_PUBLIC_URL=https://assets.yourdomain.com
```

- [ ] **Step 4: Configure Vitest**

Create `vitest.config.ts`:
```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/unit/**/*.test.ts', 'tests/unit/**/*.test.tsx',
              'tests/integration/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      exclude: ['node_modules/', 'tests/', '.next/']
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
})
```

Create `tests/setup.ts`:
```typescript
import '@testing-library/jest-dom/vitest'
```

- [ ] **Step 5: Verify dev server starts**

```bash
npm run dev
```
Expected: Server starts on localhost:3000, default Next.js page renders.

- [ ] **Step 6: Verify tests run**

Create `tests/unit/smoke.test.ts`:
```typescript
import { describe, it, expect } from 'vitest'

describe('smoke test', () => {
  it('passes', () => {
    expect(1 + 1).toBe(2)
  })
})
```

Run: `npx vitest run`
Expected: 1 test passes.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: scaffold Next.js project with Vitest"
```

---

### Task 2: Supabase Schema — Profiles

**Files:**
- Create: `carsandcrews-web/supabase/migrations/001_profiles.sql`
- Create: `tests/integration/db/profiles.test.ts`

- [ ] **Step 1: Write the migration**

Create `supabase/migrations/001_profiles.sql`:
```sql
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
```

- [ ] **Step 2: Apply migration to Supabase**

```bash
# Via Supabase CLI or dashboard SQL editor
supabase db push
```

- [ ] **Step 3: Write integration test**

Create `tests/integration/db/profiles.test.ts`:
```typescript
import { describe, it, expect } from 'vitest'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

describe('profiles table', () => {
  it('can read profiles with anon key', async () => {
    const { error } = await supabase
      .from('profiles')
      .select('id, username, display_name')
      .limit(1)
    expect(error).toBeNull()
  })

  it('has required columns', async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, display_name, avatar_url, bio, city, state, website, role, created_at, updated_at')
      .limit(0)
    expect(error).toBeNull()
  })
})
```

- [ ] **Step 4: Run integration tests**

Run: `npx vitest run tests/integration/db/profiles.test.ts`
Expected: 2 tests pass.

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/001_profiles.sql tests/integration/db/profiles.test.ts
git commit -m "feat: profiles table with RLS and auto-create trigger"
```

---

### Task 3: Supabase Schema — Vehicles

**Files:**
- Create: `carsandcrews-web/supabase/migrations/002_vehicles.sql`
- Create: `tests/integration/db/vehicles.test.ts`

- [ ] **Step 1: Write the migration**

Create `supabase/migrations/002_vehicles.sql`:
```sql
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
```

- [ ] **Step 2: Apply migration**

```bash
supabase db push
```

- [ ] **Step 3: Write integration test**

Create `tests/integration/db/vehicles.test.ts`:
```typescript
import { describe, it, expect } from 'vitest'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

describe('vehicles tables', () => {
  it('can query vehicles table', async () => {
    const { error } = await supabase
      .from('vehicles')
      .select('id, owner_id, year, make, model, slug, visibility, status_tag')
      .limit(0)
    expect(error).toBeNull()
  })

  it('can query vehicle_photos table', async () => {
    const { error } = await supabase
      .from('vehicle_photos')
      .select('id, vehicle_id, url, thumbnail_url, position, caption, aspect_ratio')
      .limit(0)
    expect(error).toBeNull()
  })

  it('can query vehicle_specs table', async () => {
    const { error } = await supabase
      .from('vehicle_specs')
      .select('id, vehicle_id, engine, transmission, drivetrain, paint_color, interior, wheels_tires')
      .limit(0)
    expect(error).toBeNull()
  })
})
```

- [ ] **Step 4: Run tests**

Run: `npx vitest run tests/integration/db/vehicles.test.ts`
Expected: 3 tests pass.

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/002_vehicles.sql tests/integration/db/vehicles.test.ts
git commit -m "feat: vehicles, photos, and specs tables with RLS"
```

---

### Task 4: Supabase Schema — Events, RSVPs, Submissions, Claims, Admin

**Files:**
- Create: `carsandcrews-web/supabase/migrations/003_events.sql`
- Create: `carsandcrews-web/supabase/migrations/004_rsvps.sql`
- Create: `carsandcrews-web/supabase/migrations/005_submissions_claims_admin.sql`
- Create: `tests/integration/db/events.test.ts`

- [ ] **Step 1: Write events migration**

Create `supabase/migrations/003_events.sql`:
```sql
create table public.events (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  slug text unique not null,
  description text,
  event_type text not null default 'other'
    check (event_type in ('car_show', 'cars_and_coffee', 'cruise_in', 'swap_meet', 'charity_run', 'concours', 'cruise_rally', 'workshop', 'other')),
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
```

- [ ] **Step 2: Write RSVPs migration**

Create `supabase/migrations/004_rsvps.sql`:
```sql
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
```

- [ ] **Step 3: Write submissions, claims, and admin migration**

Create `supabase/migrations/005_submissions_claims_admin.sql`:
```sql
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
```

- [ ] **Step 4: Apply all migrations**

```bash
supabase db push
```

- [ ] **Step 5: Write integration tests**

Create `tests/integration/db/events.test.ts`:
```typescript
import { describe, it, expect } from 'vitest'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

describe('events table', () => {
  it('can query events', async () => {
    const { error } = await supabase
      .from('events')
      .select('id, name, slug, event_type, date, city, state, source, status')
      .limit(0)
    expect(error).toBeNull()
  })
})

describe('rsvps tables', () => {
  it('can query rsvps', async () => {
    const { error } = await supabase
      .from('rsvps')
      .select('id, event_id, user_id, status')
      .limit(0)
    expect(error).toBeNull()
  })

  it('can query rsvp_vehicles', async () => {
    const { error } = await supabase
      .from('rsvp_vehicles')
      .select('id, rsvp_id, vehicle_id')
      .limit(0)
    expect(error).toBeNull()
  })
})

describe('submissions and claims tables', () => {
  it('can query event_submissions', async () => {
    const { error } = await supabase
      .from('event_submissions')
      .select('id, name, date, status')
      .limit(0)
    expect(error).toBeNull()
  })

  it('can query event_claims', async () => {
    const { error } = await supabase
      .from('event_claims')
      .select('id, event_id, user_id, status')
      .limit(0)
    expect(error).toBeNull()
  })

  it('can query admin_actions', async () => {
    const { error } = await supabase
      .from('admin_actions')
      .select('id, admin_id, action_type, target_type, target_id')
      .limit(0)
    expect(error).toBeNull()
  })
})
```

- [ ] **Step 6: Run tests**

Run: `npx vitest run tests/integration/db/events.test.ts`
Expected: 6 tests pass.

- [ ] **Step 7: Commit**

```bash
git add supabase/migrations/ tests/integration/db/events.test.ts
git commit -m "feat: events, RSVPs, submissions, claims, and admin tables with RLS"
```

---

### Task 5: Supabase Client Setup

**Files:**
- Create: `src/lib/supabase/client.ts`
- Create: `src/lib/supabase/server.ts`
- Create: `src/lib/supabase/middleware.ts`
- Create: `src/middleware.ts`
- Create: `tests/unit/lib/supabase-client.test.ts`

- [ ] **Step 1: Write failing test**

Create `tests/unit/lib/supabase-client.test.ts`:
```typescript
import { describe, it, expect, vi } from 'vitest'

vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co')
vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'test-anon-key')

describe('createBrowserClient', () => {
  it('exports a function', async () => {
    const mod = await import('@/lib/supabase/client')
    expect(typeof mod.createBrowserClient).toBe('function')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/lib/supabase-client.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement browser client**

Create `src/lib/supabase/client.ts`:
```typescript
import { createBrowserClient as createClient } from '@supabase/ssr'

export function createBrowserClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

- [ ] **Step 4: Implement server client**

Create `src/lib/supabase/server.ts`:
```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createServer() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Called from Server Component — ignore
          }
        }
      }
    }
  )
}
```

- [ ] **Step 5: Implement middleware helper**

Create `src/lib/supabase/middleware.ts`:
```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        }
      }
    }
  )

  await supabase.auth.getUser()

  return supabaseResponse
}
```

- [ ] **Step 6: Create Next.js middleware**

Create `src/middleware.ts`:
```typescript
import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'
  ]
}
```

- [ ] **Step 7: Run test to verify it passes**

Run: `npx vitest run tests/unit/lib/supabase-client.test.ts`
Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add src/lib/supabase/ src/middleware.ts tests/unit/lib/supabase-client.test.ts
git commit -m "feat: Supabase client (browser + server) and auth middleware"
```

---

### Task 6: Auth Pages — Sign In and Sign Up

**Files:**
- Create: `src/app/(auth)/sign-in/page.tsx`
- Create: `src/app/(auth)/sign-up/page.tsx`
- Create: `src/app/api/auth/callback/route.ts`
- Create: `src/app/(auth)/layout.tsx`
- Create: `src/components/ui/button.tsx`
- Create: `src/components/ui/input.tsx`
- Create: `tests/unit/components/auth/sign-in.test.tsx`
- Create: `tests/unit/components/auth/sign-up.test.tsx`

- [ ] **Step 1: Write failing test for sign-in page**

Create `tests/unit/components/auth/sign-in.test.tsx`:
```typescript
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('@/lib/supabase/client', () => ({
  createBrowserClient: () => ({
    auth: {
      signInWithPassword: vi.fn(),
      signInWithOAuth: vi.fn()
    }
  })
}))

describe('Sign In Page', () => {
  it('renders email and password fields', async () => {
    const { default: SignInPage } = await import('@/app/(auth)/sign-in/page')
    render(<SignInPage />)
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
  })

  it('renders sign in button', async () => {
    const { default: SignInPage } = await import('@/app/(auth)/sign-in/page')
    render(<SignInPage />)
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('renders link to sign up', async () => {
    const { default: SignInPage } = await import('@/app/(auth)/sign-in/page')
    render(<SignInPage />)
    expect(screen.getByText(/sign up/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/components/auth/sign-in.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Create base UI components**

Create `src/components/ui/button.tsx`:
```typescript
import { forwardRef, type ButtonHTMLAttributes } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  loading?: boolean
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-amber-500 text-black hover:bg-amber-400 active:bg-amber-600 focus-visible:ring-amber-500',
  secondary: 'bg-white/5 text-white hover:bg-white/10 active:bg-white/15 border border-white/10 focus-visible:ring-white/30',
  ghost: 'text-white/70 hover:text-white hover:bg-white/5 active:bg-white/10 focus-visible:ring-white/20'
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', loading, disabled, className = '', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`
          inline-flex items-center justify-center rounded-full px-5 py-2.5
          text-sm font-semibold transition-all duration-150
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a12]
          disabled:opacity-50 disabled:pointer-events-none
          ${variantStyles[variant]}
          ${className}
        `}
        {...props}
      >
        {loading ? (
          <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
        ) : null}
        {children}
      </button>
    )
  }
)
Button.displayName = 'Button'
```

Create `src/components/ui/input.tsx`:
```typescript
import { forwardRef, type InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, id, className = '', ...props }, ref) => {
    const inputId = id || label.toLowerCase().replace(/\s+/g, '-')
    return (
      <div className="space-y-1.5">
        <label htmlFor={inputId} className="block text-sm font-medium text-white/80">
          {label}
        </label>
        <input
          ref={ref}
          id={inputId}
          className={`
            w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5
            text-white placeholder:text-white/30
            transition-all duration-150
            focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50
            hover:border-white/20
            ${error ? 'border-red-500/50 focus:ring-red-500/50' : ''}
            ${className}
          `}
          {...props}
        />
        {error ? (
          <p className="text-sm text-red-400">{error}</p>
        ) : null}
      </div>
    )
  }
)
Input.displayName = 'Input'
```

- [ ] **Step 4: Create auth callback route**

Create `src/app/api/auth/callback/route.ts`:
```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          }
        }
      }
    )
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/sign-in?error=auth`)
}
```

- [ ] **Step 5: Create sign-in page**

Create `src/app/(auth)/sign-in/page.tsx`:
```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createBrowserClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function SignInPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createBrowserClient()

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  async function handleGoogleSignIn() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/api/auth/callback` }
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white">Sign In</h1>
          <p className="text-sm text-white/50 mt-1">Welcome back</p>
        </div>

        <form onSubmit={handleSignIn} className="space-y-4">
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p className="text-sm text-red-400">{error}</p>}
          <Button type="submit" loading={loading} className="w-full">
            Sign In
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-[#0a0a12] px-2 text-white/40">or</span>
          </div>
        </div>

        <Button variant="secondary" onClick={handleGoogleSignIn} className="w-full">
          Continue with Google
        </Button>

        <p className="text-center text-sm text-white/50">
          Don&apos;t have an account?{' '}
          <Link href="/sign-up" className="text-amber-500 hover:text-amber-400 transition-colors">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
```

- [ ] **Step 6: Create sign-up page**

Create `src/app/(auth)/sign-up/page.tsx`:
```typescript
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createBrowserClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function SignUpPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const supabase = createBrowserClient()

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/api/auth/callback` }
    })

    if (error) {
      setError(error.message)
    } else {
      setSuccess(true)
    }
    setLoading(false)
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center space-y-3">
          <h1 className="text-2xl font-bold text-white">Check your email</h1>
          <p className="text-white/50">We sent a confirmation link to {email}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white">Create Account</h1>
          <p className="text-sm text-white/50 mt-1">Join the community</p>
        </div>

        <form onSubmit={handleSignUp} className="space-y-4">
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
          />
          {error && <p className="text-sm text-red-400">{error}</p>}
          <Button type="submit" loading={loading} className="w-full">
            Sign Up
          </Button>
        </form>

        <p className="text-center text-sm text-white/50">
          Already have an account?{' '}
          <Link href="/sign-in" className="text-amber-500 hover:text-amber-400 transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
```

- [ ] **Step 7: Create auth layout**

Create `src/app/(auth)/layout.tsx`:
```typescript
import { redirect } from 'next/navigation'
import { createServer } from '@/lib/supabase/server'

export default async function AuthLayout({
  children
}: {
  children: React.ReactNode
}) {
  const supabase = await createServer()
  const { data: { user } } = await supabase.auth.getUser()

  // If user is already signed in and trying to access sign-in/sign-up, redirect to dashboard
  // Otherwise, just render the children (for dashboard, garage, settings, etc.)
  return <>{children}</>
}
```

- [ ] **Step 8: Write sign-up test**

Create `tests/unit/components/auth/sign-up.test.tsx`:
```typescript
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('@/lib/supabase/client', () => ({
  createBrowserClient: () => ({
    auth: {
      signUp: vi.fn()
    }
  })
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() })
}))

describe('Sign Up Page', () => {
  it('renders email and password fields', async () => {
    const { default: SignUpPage } = await import('@/app/(auth)/sign-up/page')
    render(<SignUpPage />)
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
  })

  it('renders sign up button', async () => {
    const { default: SignUpPage } = await import('@/app/(auth)/sign-up/page')
    render(<SignUpPage />)
    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument()
  })

  it('renders link to sign in', async () => {
    const { default: SignUpPage } = await import('@/app/(auth)/sign-up/page')
    render(<SignUpPage />)
    expect(screen.getByText(/sign in/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 9: Run all tests**

Run: `npx vitest run tests/unit/components/auth/`
Expected: 6 tests pass.

- [ ] **Step 10: Commit**

```bash
git add src/app/(auth)/ src/app/api/auth/ src/components/ui/ tests/unit/components/auth/
git commit -m "feat: auth pages (sign in, sign up, callback) with base UI components"
```

---

### Task 7: CI Pipeline

**Files:**
- Create: `carsandcrews-web/.github/workflows/ci.yml`

- [ ] **Step 1: Create GitHub Actions workflow**

Create `.github/workflows/ci.yml`:
```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
  NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
  SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}

jobs:
  lint-and-typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm run lint
      - run: npx tsc --noEmit

  test:
    runs-on: ubuntu-latest
    needs: lint-and-typecheck
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npx vitest run --coverage

  e2e:
    runs-on: ubuntu-latest
    needs: test
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - run: npm run build
      - run: npx playwright test
```

- [ ] **Step 2: Verify workflow file is valid YAML**

```bash
python3 -c "import yaml; yaml.safe_load(open('.github/workflows/ci.yml'))"
```
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/ci.yml
git commit -m "ci: GitHub Actions pipeline (lint, typecheck, test, e2e)"
```

---

### Task 8: Constants and Utilities

**Files:**
- Create: `src/lib/constants.ts`
- Create: `src/lib/utils.ts`
- Create: `tests/unit/lib/utils.test.ts`

- [ ] **Step 1: Write failing tests**

Create `tests/unit/lib/utils.test.ts`:
```typescript
import { describe, it, expect } from 'vitest'
import { generateSlug, formatEventDate, formatEventType } from '@/lib/utils'

describe('generateSlug', () => {
  it('converts a name to a slug', () => {
    expect(generateSlug('Cars & Coffee at The Domain')).toBe('cars-coffee-at-the-domain')
  })

  it('handles special characters', () => {
    expect(generateSlug("Bob's Big Show!!! 2026")).toBe('bobs-big-show-2026')
  })

  it('truncates to max length', () => {
    const long = 'a'.repeat(100)
    expect(generateSlug(long).length).toBeLessThanOrEqual(60)
  })

  it('removes trailing hyphens', () => {
    expect(generateSlug('test -- name')).toBe('test-name')
  })
})

describe('formatEventDate', () => {
  it('formats a single date', () => {
    expect(formatEventDate('2026-04-05', null)).toBe('Apr 5, 2026')
  })

  it('formats a date range', () => {
    expect(formatEventDate('2026-04-05', '2026-04-06')).toBe('Apr 5–6, 2026')
  })

  it('formats a date range across months', () => {
    expect(formatEventDate('2026-03-30', '2026-04-02')).toBe('Mar 30 – Apr 2, 2026')
  })
})

describe('formatEventType', () => {
  it('formats car_show', () => {
    expect(formatEventType('car_show')).toBe('Car Show')
  })

  it('formats cars_and_coffee', () => {
    expect(formatEventType('cars_and_coffee')).toBe('Cars & Coffee')
  })

  it('formats cruise_in', () => {
    expect(formatEventType('cruise_in')).toBe('Cruise-In')
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/unit/lib/utils.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement constants**

Create `src/lib/constants.ts`:
```typescript
export const EVENT_TYPES = [
  'car_show',
  'cars_and_coffee',
  'cruise_in',
  'swap_meet',
  'charity_run',
  'concours',
  'cruise_rally',
  'workshop',
  'other'
] as const

export type EventType = typeof EVENT_TYPES[number]

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  car_show: 'Car Show',
  cars_and_coffee: 'Cars & Coffee',
  cruise_in: 'Cruise-In',
  swap_meet: 'Swap Meet',
  charity_run: 'Charity Run',
  concours: 'Concours',
  cruise_rally: 'Cruise/Rally',
  workshop: 'Workshop',
  other: 'Other'
}

export const VEHICLE_STATUS_TAGS = [
  'restored',
  'modified',
  'survivor',
  'in_progress',
  'barn_find',
  'original',
  'tribute',
  'custom'
] as const

export type VehicleStatusTag = typeof VEHICLE_STATUS_TAGS[number]

export const VEHICLE_STATUS_LABELS: Record<VehicleStatusTag, string> = {
  restored: 'Restored',
  modified: 'Modified',
  survivor: 'Survivor',
  in_progress: 'In Progress',
  barn_find: 'Barn Find',
  original: 'Original',
  tribute: 'Tribute',
  custom: 'Custom'
}

export const US_STATES = [
  { code: 'AL', name: 'Alabama' },
  { code: 'AK', name: 'Alaska' },
  { code: 'AZ', name: 'Arizona' },
  { code: 'AR', name: 'Arkansas' },
  { code: 'CA', name: 'California' },
  { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' },
  { code: 'DE', name: 'Delaware' },
  { code: 'FL', name: 'Florida' },
  { code: 'GA', name: 'Georgia' },
  { code: 'HI', name: 'Hawaii' },
  { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' },
  { code: 'IN', name: 'Indiana' },
  { code: 'IA', name: 'Iowa' },
  { code: 'KS', name: 'Kansas' },
  { code: 'KY', name: 'Kentucky' },
  { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' },
  { code: 'MD', name: 'Maryland' },
  { code: 'MA', name: 'Massachusetts' },
  { code: 'MI', name: 'Michigan' },
  { code: 'MN', name: 'Minnesota' },
  { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' },
  { code: 'MT', name: 'Montana' },
  { code: 'NE', name: 'Nebraska' },
  { code: 'NV', name: 'Nevada' },
  { code: 'NH', name: 'New Hampshire' },
  { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' },
  { code: 'NY', name: 'New York' },
  { code: 'NC', name: 'North Carolina' },
  { code: 'ND', name: 'North Dakota' },
  { code: 'OH', name: 'Ohio' },
  { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' },
  { code: 'PA', name: 'Pennsylvania' },
  { code: 'RI', name: 'Rhode Island' },
  { code: 'SC', name: 'South Carolina' },
  { code: 'SD', name: 'South Dakota' },
  { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' },
  { code: 'UT', name: 'Utah' },
  { code: 'VT', name: 'Vermont' },
  { code: 'VA', name: 'Virginia' },
  { code: 'WA', name: 'Washington' },
  { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' },
  { code: 'WY', name: 'Wyoming' },
  { code: 'DC', name: 'District of Columbia' }
] as const
```

- [ ] **Step 4: Implement utilities**

Create `src/lib/utils.ts`:
```typescript
import { EVENT_TYPE_LABELS, type EventType } from './constants'

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60)
}

export function formatEventDate(date: string, endDate: string | null): string {
  const start = new Date(date + 'T00:00:00')
  const startMonth = start.toLocaleDateString('en-US', { month: 'short' })
  const startDay = start.getDate()
  const startYear = start.getFullYear()

  if (!endDate) {
    return `${startMonth} ${startDay}, ${startYear}`
  }

  const end = new Date(endDate + 'T00:00:00')
  const endMonth = end.toLocaleDateString('en-US', { month: 'short' })
  const endDay = end.getDate()

  if (startMonth === endMonth) {
    return `${startMonth} ${startDay}–${endDay}, ${startYear}`
  }

  return `${startMonth} ${startDay} – ${endMonth} ${endDay}, ${startYear}`
}

export function formatEventType(type: string): string {
  return EVENT_TYPE_LABELS[type as EventType] || type
}
```

- [ ] **Step 5: Run tests**

Run: `npx vitest run tests/unit/lib/utils.test.ts`
Expected: All tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/lib/constants.ts src/lib/utils.ts tests/unit/lib/utils.test.ts
git commit -m "feat: constants (event types, status tags, states) and utility functions"
```

---

### Task 9: Location Detection

**Files:**
- Create: `src/lib/location/detect.ts`
- Create: `src/hooks/use-location.ts`
- Create: `tests/unit/lib/location.test.ts`

- [ ] **Step 1: Write failing tests**

Create `tests/unit/lib/location.test.ts`:
```typescript
import { describe, it, expect } from 'vitest'
import { parseVercelHeaders, type UserLocation } from '@/lib/location/detect'

describe('parseVercelHeaders', () => {
  it('extracts location from Vercel headers', () => {
    const headers = new Headers({
      'x-vercel-ip-city': 'Austin',
      'x-vercel-ip-country-region': 'TX',
      'x-vercel-ip-latitude': '30.2672',
      'x-vercel-ip-longitude': '-97.7431'
    })
    const result = parseVercelHeaders(headers)
    expect(result).toEqual({
      city: 'Austin',
      state: 'TX',
      lat: 30.2672,
      lng: -97.7431,
      source: 'ip'
    })
  })

  it('returns null if headers are missing', () => {
    const headers = new Headers({})
    const result = parseVercelHeaders(headers)
    expect(result).toBeNull()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/lib/location.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement location detection**

Create `src/lib/location/detect.ts`:
```typescript
export interface UserLocation {
  city: string
  state: string
  lat: number
  lng: number
  source: 'gps' | 'ip' | 'manual'
}

export function parseVercelHeaders(headers: Headers): UserLocation | null {
  const city = headers.get('x-vercel-ip-city')
  const state = headers.get('x-vercel-ip-country-region')
  const lat = headers.get('x-vercel-ip-latitude')
  const lng = headers.get('x-vercel-ip-longitude')

  if (!city || !state || !lat || !lng) return null

  return {
    city: decodeURIComponent(city),
    state,
    lat: parseFloat(lat),
    lng: parseFloat(lng),
    source: 'ip'
  }
}

export function getGPSLocation(): Promise<UserLocation | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          city: '',
          state: '',
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          source: 'gps'
        })
      },
      () => resolve(null),
      { timeout: 5000, maximumAge: 600000 }
    )
  })
}
```

- [ ] **Step 4: Implement location hook**

Create `src/hooks/use-location.ts`:
```typescript
'use client'

import { useState, useEffect } from 'react'
import { getGPSLocation, type UserLocation } from '@/lib/location/detect'

interface UseLocationOptions {
  serverLocation?: UserLocation | null
}

export function useLocation({ serverLocation }: UseLocationOptions = {}) {
  const [location, setLocation] = useState<UserLocation | null>(serverLocation ?? null)
  const [loading, setLoading] = useState(!serverLocation)

  useEffect(() => {
    if (location?.source === 'gps') return

    async function tryGPS() {
      setLoading(true)
      const gps = await getGPSLocation()
      if (gps) {
        setLocation(gps)
      }
      setLoading(false)
    }

    tryGPS()
  }, [])

  function setManualLocation(city: string, state: string, lat: number, lng: number) {
    setLocation({ city, state, lat, lng, source: 'manual' })
  }

  return { location, loading, setManualLocation }
}
```

- [ ] **Step 5: Run tests**

Run: `npx vitest run tests/unit/lib/location.test.ts`
Expected: All tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/lib/location/ src/hooks/use-location.ts tests/unit/lib/location.test.ts
git commit -m "feat: location detection (GPS → Vercel IP → manual) with hook"
```

---

## Phase 2: Photo Upload Pipeline

### Task 10: R2 Signed URL Generation

**Files:**
- Create: `src/lib/r2/client.ts`
- Create: `src/app/api/upload/signed-url/route.ts`
- Create: `tests/unit/lib/r2-client.test.ts`

- [ ] **Step 1: Install R2/S3 SDK**

```bash
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

- [ ] **Step 2: Write failing test**

Create `tests/unit/lib/r2-client.test.ts`:
```typescript
import { describe, it, expect } from 'vitest'
import { buildR2Key } from '@/lib/r2/client'

describe('buildR2Key', () => {
  it('builds a key for vehicle photos', () => {
    const key = buildR2Key('vehicles', 'abc-123', 'photo.jpg')
    expect(key).toBe('vehicles/abc-123/photo.jpg')
  })

  it('builds a key for avatars', () => {
    const key = buildR2Key('avatars', 'user-456', 'avatar.webp')
    expect(key).toBe('avatars/user-456/avatar.webp')
  })

  it('builds a key for event banners', () => {
    const key = buildR2Key('events', 'evt-789', 'banner.webp')
    expect(key).toBe('events/evt-789/banner.webp')
  })
})
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npx vitest run tests/unit/lib/r2-client.test.ts`
Expected: FAIL.

- [ ] **Step 4: Implement R2 client**

Create `src/lib/r2/client.ts`:
```typescript
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!
  }
})

export function buildR2Key(folder: string, id: string, filename: string): string {
  return `${folder}/${id}/${filename}`
}

export async function createSignedUploadUrl(
  key: string,
  contentType: string,
  maxSizeBytes: number = 10 * 1024 * 1024
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME!,
    Key: key,
    ContentType: contentType,
    ContentLength: maxSizeBytes
  })

  return getSignedUrl(r2, command, { expiresIn: 300 })
}

export function getPublicUrl(key: string): string {
  return `${process.env.R2_PUBLIC_URL}/${key}`
}
```

- [ ] **Step 5: Create signed URL API route**

Create `src/app/api/upload/signed-url/route.ts`:
```typescript
import { NextResponse } from 'next/server'
import { createServer } from '@/lib/supabase/server'
import { buildR2Key, createSignedUploadUrl, getPublicUrl } from '@/lib/r2/client'

export async function POST(request: Request) {
  const supabase = await createServer()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { folder, entityId, filename, contentType } = await request.json()

  if (!folder || !entityId || !filename || !contentType) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic']
  if (!allowedTypes.includes(contentType)) {
    return NextResponse.json({ error: 'Invalid content type' }, { status: 400 })
  }

  const timestamp = Date.now()
  const safeFilename = `${timestamp}-${filename.replace(/[^a-zA-Z0-9._-]/g, '')}`
  const key = buildR2Key(folder, entityId, safeFilename)

  const signedUrl = await createSignedUploadUrl(key, contentType)
  const publicUrl = getPublicUrl(key)

  return NextResponse.json({ signedUrl, publicUrl, key })
}
```

- [ ] **Step 6: Run tests**

Run: `npx vitest run tests/unit/lib/r2-client.test.ts`
Expected: All tests pass.

- [ ] **Step 7: Commit**

```bash
git add src/lib/r2/ src/app/api/upload/ tests/unit/lib/r2-client.test.ts
git commit -m "feat: R2 signed URL generation for photo uploads"
```

---

### Task 11: Client-Side Photo Resize and Upload

**Files:**
- Create: `src/lib/photos/resize.ts`
- Create: `src/lib/photos/upload.ts`
- Create: `src/hooks/use-upload.ts`
- Create: `tests/unit/lib/photos-resize.test.ts`

- [ ] **Step 1: Write failing tests**

Create `tests/unit/lib/photos-resize.test.ts`:
```typescript
import { describe, it, expect } from 'vitest'
import { detectAspectRatio } from '@/lib/photos/resize'

describe('detectAspectRatio', () => {
  it('detects landscape', () => {
    expect(detectAspectRatio(1600, 900)).toBe('landscape')
  })

  it('detects portrait', () => {
    expect(detectAspectRatio(900, 1600)).toBe('portrait')
  })

  it('detects square', () => {
    expect(detectAspectRatio(1000, 1000)).toBe('square')
  })

  it('detects near-square as square', () => {
    expect(detectAspectRatio(1000, 1050)).toBe('square')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/lib/photos-resize.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement resize utilities**

Create `src/lib/photos/resize.ts`:
```typescript
export type AspectRatio = 'landscape' | 'portrait' | 'square'

export function detectAspectRatio(width: number, height: number): AspectRatio {
  const ratio = width / height
  if (ratio > 1.1) return 'landscape'
  if (ratio < 0.9) return 'portrait'
  return 'square'
}

const MAX_DIMENSION = 2048
const QUALITY = 0.85

export async function resizeImage(file: File): Promise<{
  blob: Blob
  width: number
  height: number
  aspectRatio: AspectRatio
}> {
  const bitmap = await createImageBitmap(file)
  let { width, height } = bitmap

  if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
    const scale = MAX_DIMENSION / Math.max(width, height)
    width = Math.round(width * scale)
    height = Math.round(height * scale)
  }

  const canvas = new OffscreenCanvas(width, height)
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(bitmap, 0, 0, width, height)
  bitmap.close()

  const blob = await canvas.convertToBlob({ type: 'image/webp', quality: QUALITY })
  const aspectRatio = detectAspectRatio(width, height)

  return { blob, width, height, aspectRatio }
}
```

- [ ] **Step 4: Implement upload logic**

Create `src/lib/photos/upload.ts`:
```typescript
import { resizeImage, type AspectRatio } from './resize'

export interface UploadResult {
  publicUrl: string
  key: string
  aspectRatio: AspectRatio
}

export interface UploadProgress {
  status: 'resizing' | 'uploading' | 'done' | 'error'
  percent: number
  error?: string
}

export async function uploadPhoto(
  file: File,
  folder: string,
  entityId: string,
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult> {
  onProgress?.({ status: 'resizing', percent: 0 })

  const { blob, aspectRatio } = await resizeImage(file)

  onProgress?.({ status: 'uploading', percent: 20 })

  const response = await fetch('/api/upload/signed-url', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      folder,
      entityId,
      filename: file.name.replace(/\.[^.]+$/, '.webp'),
      contentType: 'image/webp'
    })
  })

  if (!response.ok) {
    const err = await response.json()
    throw new Error(err.error || 'Failed to get upload URL')
  }

  const { signedUrl, publicUrl, key } = await response.json()

  onProgress?.({ status: 'uploading', percent: 50 })

  const uploadResponse = await fetch(signedUrl, {
    method: 'PUT',
    body: blob,
    headers: { 'Content-Type': 'image/webp' }
  })

  if (!uploadResponse.ok) {
    throw new Error('Upload failed')
  }

  onProgress?.({ status: 'done', percent: 100 })

  return { publicUrl, key, aspectRatio }
}
```

- [ ] **Step 5: Implement upload hook**

Create `src/hooks/use-upload.ts`:
```typescript
'use client'

import { useState, useCallback } from 'react'
import { uploadPhoto, type UploadResult, type UploadProgress } from '@/lib/photos/upload'

export function useUpload() {
  const [uploads, setUploads] = useState<Map<string, UploadProgress>>(new Map())

  const upload = useCallback(async (
    file: File,
    folder: string,
    entityId: string
  ): Promise<UploadResult> => {
    const fileId = `${file.name}-${Date.now()}`

    const result = await uploadPhoto(file, folder, entityId, (progress) => {
      setUploads((prev) => new Map(prev).set(fileId, progress))
    })

    setUploads((prev) => {
      const next = new Map(prev)
      next.delete(fileId)
      return next
    })

    return result
  }, [])

  const isUploading = Array.from(uploads.values()).some(
    (u) => u.status === 'resizing' || u.status === 'uploading'
  )

  return { upload, uploads, isUploading }
}
```

- [ ] **Step 6: Run tests**

Run: `npx vitest run tests/unit/lib/photos-resize.test.ts`
Expected: All tests pass.

- [ ] **Step 7: Commit**

```bash
git add src/lib/photos/ src/hooks/use-upload.ts tests/unit/lib/photos-resize.test.ts
git commit -m "feat: client-side photo resize, upload pipeline, and upload hook"
```

---

## Phases 3–9: Remaining Feature Work

The remaining phases follow the same TDD pattern established above. Each task: write failing test → implement → verify → commit.

### Phase 3: Events Core (Tasks 12–16)
- **Task 12:** Event detail page (SSR, public, SEO)
- **Task 13:** Event explore/search page with filters
- **Task 14:** Map view with clustered pins
- **Task 15:** Event creation form (organizer flow)
- **Task 16:** Event submission form (user flow)

### Phase 4: Event Sourcing (Tasks 17–19)
- **Task 17:** Event claim flow (claim form, queue, status display)
- **Task 18:** RSVP + vehicle linking (RSVP button, vehicle selector, vehicles attending display)
- **Task 19:** Event sharing (native share API, copy link, OG meta tags)

### Phase 5: Vehicles Core (Tasks 20–24)
- **Task 20:** Vehicle form (add/edit with photo upload, drag-to-reorder, specs)
- **Task 21:** Vehicle detail page (SSR, gallery, specs panel, owner info)
- **Task 22:** Vehicle explore page with filters
- **Task 23:** Photo gallery component (lightbox, swipe on mobile, keyboard nav)
- **Task 24:** NHTSA vPIC autocomplete for year/make/model

### Phase 6: User Profiles (Tasks 25–27)
- **Task 25:** Public profile page (`@username`, garage grid, upcoming events)
- **Task 26:** Profile settings page (edit info, avatar upload)
- **Task 27:** User dashboard (my vehicles, my RSVPs, my submissions)

### Phase 7: Admin Panel (Tasks 28–33)
- **Task 28:** Admin layout with role check middleware
- **Task 29:** Events management (list, filter, edit, remove)
- **Task 30:** Submissions queue (review, approve → create event, reject)
- **Task 31:** Claims queue (review, approve → update event, reject)
- **Task 32:** Users and vehicles management
- **Task 33:** Audit log viewer

### Phase 8: Pipeline Repo (Tasks 34–39)
- **Task 34:** Scaffold pipeline repo with Vitest and shared helpers (supabase, geocode, slug, dedup, quality)
- **Task 35:** Generic JSON import with dedup and quality scoring
- **Task 36:** CarCruiseFinder scraper (adapted from existing)
- **Task 37:** Enrichment pipeline (6-step, adapted from strategy docs)
- **Task 38:** Banner/image pipeline (adapted from existing, uploads to R2)
- **Task 39:** CLI entry point and orchestration

### Phase 9: Landing Page & Polish (Tasks 40–44)
- **Task 40:** Landing page — featured strip, search, tabbed feed (Option C v4 design)
- **Task 41:** Root layout — nav bar, footer, theme provider (dark/light system preference)
- **Task 42:** PWA setup (Serwist, manifest, install prompt)
- **Task 43:** Responsive audit — test every page at 375px, 768px, 1024px, 1440px
- **Task 44:** E2E test suite (Playwright: full user flows — signup, create vehicle, RSVP, submit event, admin flows)

---

## Task Dependencies

```
Phase 1 (Foundation): Tasks 1–9 — sequential
    │
    ├── Phase 2 (Photos): Tasks 10–11 — depends on Task 1 (project setup)
    │
    ├── Phase 3 (Events): Tasks 12–16 — depends on Tasks 4, 5, 8, 9
    │   │
    │   └── Phase 4 (Event Sourcing): Tasks 17–19 — depends on Phase 3
    │
    ├── Phase 5 (Vehicles): Tasks 20–24 — depends on Tasks 3, 5, 10, 11
    │
    ├── Phase 6 (Profiles): Tasks 25–27 — depends on Tasks 2, 6
    │
    ├── Phase 7 (Admin): Tasks 28–33 — depends on Phases 3, 4, 5, 6
    │
    ├── Phase 8 (Pipeline): Tasks 34–39 — depends on Task 4 (events schema only)
    │
    └── Phase 9 (Polish): Tasks 40–44 — depends on all other phases
```

**Parallel opportunities:**
- Phase 3 (Events) and Phase 5 (Vehicles) can be built in parallel after Phase 1 + 2
- Phase 8 (Pipeline) can be built in parallel with Phases 3–7 (only needs the schema)
- Phase 6 (Profiles) can start as soon as Phase 1 is done

---

## Commit Convention

All commits follow the existing repo style:
```
type: short description

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
```

Types: `feat`, `fix`, `test`, `ci`, `refactor`, `docs`

---

## Hard Rules

1. **No feature is complete without tests.** Unit tests for logic, integration tests for DB operations, E2E for critical paths.
2. **Tests run on every build.** CI pipeline is a merge gate.
3. **TDD flow:** Write failing test → implement → verify pass → commit.
4. **Every page is responsive.** Test at 375px, 768px, 1024px, 1440px.
5. **Dark and light mode.** Every component supports both via system preference.
6. **Friendly URLs.** All public content has human-readable slugs.
7. **Photos handled properly.** Client-side resize, signed URL upload, consistent display containers.
