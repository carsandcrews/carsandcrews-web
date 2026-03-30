# Automotive Enthusiast Site — Design Spec

**Date:** 2026-03-30
**Status:** Draft — pending user review
**Replaces:** MyResto Suite multi-app PRD (PRD-MyResto-Suite.md)

---

## 1. Overview

**Cars & Crews** (carsandcrews.com) — a unified platform for automotive enthusiasts that consolidates the vision of the MyResto ecosystem (MyRestoEvent, MyRestoGarage, MyRestoClub) into a single site. The site serves the car culture lifestyle audience — owners, photographers, spectators, vendors, event organizers — with a focus on GenX and younger demographics.

Three pillars — **Garage, Crews, Events**:
- **Events** lead slightly as the primary hook (discover what's happening near you)
- **Garage** (vehicle profiles) gives users a reason to create an account and return between events
- **Community** is deferred to post-MVP but the architecture accommodates it from day one

**Business model:** Freemium. Launch as entirely free. Premium tiers and promoted listings added post-launch once traction is proven.

**Geographic scope:** US only at launch.

---

## 2. Architecture

### 2.1 Two-Repo Structure

| Repo | Purpose | Stack |
|---|---|---|
| `carsandcrews-web` | Next.js app — public site, authenticated pages, admin panel | Next.js 15 (App Router), React 19, TypeScript, Tailwind v4, Supabase Auth, Vercel |
| `carsandcrews-pipeline` | Data ingestion — scrapers, enrichment, import | Node.js (ES modules), adapted from existing MyRestoEvent scripts |

### 2.2 Shared Backend

- **Database:** New Supabase project (Postgres + RLS + Realtime). Completely fresh schema — no reuse of MyRestoEvent tables.
- **Media storage:** Cloudflare R2 with CDN. Photos uploaded via signed URLs, server-side processing for thumbnails, WebP conversion, EXIF stripping.
- **Auth:** Supabase Auth. Email/password + Google OAuth at launch. Admin role via `role` column on profiles table, enforced in middleware and RLS policies.
- **Payments (future):** Stripe. `stripe_customer_id` column on profiles from day one (nullable).

### 2.3 Deployment & CI

- **Web app:** Vercel. Preview deploys on PR, production on merge to main.
- **Pipeline:** Runs locally or via scheduled jobs (not deployed as a web service).
- **CI:** GitHub Actions on both repos — lint, type-check, tests on every push.
- **Branch protection:** Tests must pass to merge. No exceptions.

### 2.4 PWA

- Service worker, web manifest, and install prompt configured from day one via next-pwa or Serwist.
- Push notifications deferred to post-MVP but manifest supports them.

---

## 3. Data Model

Fresh Supabase project. All tables below are new.

### 3.1 Users & Auth

**`profiles`**
| Column | Type | Notes |
|---|---|---|
| id | UUID (FK → auth.users) | Primary key, matches Supabase auth user |
| username | text (unique) | Used in `@username` URLs |
| display_name | text | |
| avatar_url | text | R2 URL after upload pipeline |
| bio | text | |
| city | text | |
| state | text | |
| website | text | |
| role | text | `user` (default) or `admin` |
| stripe_customer_id | text (nullable) | Future-proofing for payments |
| subscription_tier | text (nullable) | Future-proofing for payments |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### 3.2 Vehicles

**`vehicles`**
| Column | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| owner_id | UUID (FK → profiles) | |
| year | integer | |
| make | text | |
| model | text | |
| body_style | text (nullable) | |
| status_tag | text | restored, modified, survivor, in_progress, barn_find, original, tribute, custom |
| description | text (nullable) | Rich text — the vehicle's story |
| visibility | text | public, unlisted, private |
| slug | text (unique) | Friendly URL |
| for_sale | boolean (nullable) | Future-proofing |
| price | numeric (nullable) | Future-proofing |
| created_at | timestamptz | |
| updated_at | timestamptz | |

**`vehicle_photos`**
| Column | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| vehicle_id | UUID (FK → vehicles) | |
| url | text | R2 URL — populated by upload pipeline, not user-entered |
| thumbnail_url | text | Server-generated thumbnail |
| position | integer | Display order (drag to reorder) |
| caption | text (nullable) | |
| aspect_ratio | text (nullable) | landscape, portrait, square — detected on upload |
| created_at | timestamptz | |

**`vehicle_specs`**
| Column | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| vehicle_id | UUID (FK → vehicles) | One-to-one |
| engine | text (nullable) | |
| transmission | text (nullable) | |
| drivetrain | text (nullable) | |
| paint_color | text (nullable) | |
| interior | text (nullable) | |
| wheels_tires | text (nullable) | |

### 3.3 Events

**`events`**
| Column | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| name | text | |
| slug | text (unique) | Friendly URL |
| description | text (nullable) | |
| event_type | text | car_show, cars_and_coffee, cruise_in, cruise, swap_meet, track_day, auction, workshop, meetup, other |
| is_charity | boolean not null default false | Charity events of any type — filterable without a separate category |
| date | date | Start date |
| end_date | date (nullable) | Multi-day events |
| start_time | time (nullable) | |
| end_time | time (nullable) | |
| location_name | text (nullable) | Venue name |
| address | text (nullable) | |
| city | text | |
| state | text | |
| zip | text (nullable) | |
| lat | numeric (nullable) | |
| lng | numeric (nullable) | |
| banner_url | text (nullable) | R2 URL — from upload or pipeline |
| website | text (nullable) | |
| registration_url | text (nullable) | |
| admission_fee_text | text (nullable) | Free-text cost description |
| is_free_spectator | boolean | |
| contact_email | text (nullable) | |
| contact_phone | text (nullable) | |
| source | text | crawled, submitted, organizer |
| source_url | text (nullable) | Original listing URL for crawled events |
| claimed | boolean | Default false |
| claimed_by | UUID (nullable, FK → profiles) | |
| created_by | UUID (nullable, FK → profiles) | Null for crawled events |
| data_quality_score | integer (nullable) | 0-100, pipeline-calculated |
| status | text | draft, published, cancelled |
| recurring_schedule | text (nullable) | Future-proofing |
| parent_event_id | UUID (nullable) | Future-proofing for recurring |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### 3.4 RSVPs

**`rsvps`**
| Column | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| event_id | UUID (FK → events) | |
| user_id | UUID (FK → profiles) | |
| status | text | going, interested |
| created_at | timestamptz | |

Unique constraint on (event_id, user_id).

**`rsvp_vehicles`**
| Column | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| rsvp_id | UUID (FK → rsvps) | |
| vehicle_id | UUID (FK → vehicles) | |

### 3.5 Event Submissions & Claims

**`event_submissions`**
| Column | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| submitted_by | UUID (FK → profiles) | |
| name | text | |
| date | date | |
| city | text | |
| state | text | |
| location_name | text (nullable) | |
| description | text (nullable) | |
| source_url | text (nullable) | |
| status | text | pending, approved, rejected |
| reviewed_by | UUID (nullable, FK → profiles) | |
| created_at | timestamptz | |

**`event_claims`**
| Column | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| event_id | UUID (FK → events) | |
| user_id | UUID (FK → profiles) | |
| message | text | Why they're the organizer |
| status | text | pending, approved, rejected |
| reviewed_by | UUID (nullable, FK → profiles) | |
| created_at | timestamptz | |

### 3.6 Admin

**`admin_actions`**
| Column | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| admin_id | UUID (FK → profiles) | |
| action_type | text | create, update, delete, approve, reject |
| target_type | text | event, vehicle, profile, submission, claim |
| target_id | UUID | |
| reason | text (nullable) | |
| created_at | timestamptz | |

### 3.7 RLS Strategy

- **Public reads:** Published events, public vehicles, public profiles — readable by anonymous users (needed for SEO / SSR)
- **Authenticated writes:** Users can only create/update/delete their own vehicles, RSVPs, submissions
- **Admin override:** Users with `role = 'admin'` can CRUD any record
- **Claimed event editing:** Users can edit events where `claimed_by` matches their ID

---

## 4. MVP Features

### 4.1 Event Discovery

**Pages:**
- **Explore/Search** — Filter by event type, date range, distance from location. Map view and list view toggle. Pill filter chips. Location auto-detected via fallback chain.
- **Event Detail** — SSR public page. Name, date/time, location with map, description, banner image, event type badge, RSVP button, vehicles attending, share button. Shows "Claim this event" link for unclaimed events.
- **Map View** — Full-page interactive map with clustered event pins. Click pin → event preview.

### 4.2 Event Creation & Submission

**Two flows:**
- **Submit an event** (any authenticated user) — Lightweight form: name, date, location, description, source URL (optional). Goes to `event_submissions` for admin review.
- **Create an event** (organizer) — Full form: all event fields, photo upload for banner, event type, time, cost info, registration link. Published immediately as `source: organizer`.

### 4.3 Event Claims

- Crawled/submitted events display a "Is this your event? Claim it" link
- User fills out claim form (brief message)
- Goes to `event_claims` queue → admin approves/rejects manually
- On approval: `claimed = true`, `claimed_by` set, user gets edit access

### 4.4 RSVP + Vehicle Linking

- RSVP button on event detail: Going / Interested
- After RSVPing, if user has vehicles: "Bringing a vehicle?" → select from their garage
- Event detail page shows vehicles attending (photo + year/make/model)
- User can change/remove RSVP and vehicle selection

### 4.5 Vehicle Profiles

**Pages:**
- **Add/Edit Vehicle** — Year/make/model (autocomplete where possible via NHTSA vPIC for post-1981, free-text for older), status tag, description, specs, photo upload (multi-select, drag to reorder, captions)
- **Vehicle Detail** — SSR public page. Hero photo, gallery, specs panel, owner info, status badge.
- **Explore Vehicles** — Browse/filter by make, era, style, status, location

### 4.6 User Profiles

- **Public profile** (`@username`) — Avatar, display name, bio, location, garage grid (their vehicles), upcoming events they're attending
- **Profile settings** — Edit profile info, upload avatar, manage vehicles, view RSVPs

### 4.7 Photo Upload Pipeline

- Client-side resize/compress before upload
- Signed URL upload direct to R2 (no server bottleneck)
- Server-side processing: generate thumbnails, convert to WebP, strip EXIF for privacy
- Detect and store aspect ratio (landscape/portrait/square)
- Display via consistent aspect-ratio containers with `object-fit: cover`
- Mobile: camera capture supported via `accept` attribute
- Desktop: drag-and-drop
- Progress indicator during upload

### 4.8 Admin Panel

Protected routes, admin role check in middleware.

- **Events dashboard** — List all events, filter by source/status/claimed, edit/remove any event, publish drafted imports
- **Submissions queue** — Review user-submitted events, approve (promotes to events table) or reject
- **Claims queue** — Review claim requests, approve or reject
- **Users** — List users, view profiles, remove if needed
- **Vehicles** — List vehicles, remove if needed
- **Audit log** — View admin_actions history

### 4.9 Import Pipeline (separate repo)

Adapted from existing MyRestoEvent scripts. New Supabase project, new tables.

- Source-agnostic JSON import with dedup (fingerprint: name + date + city + state), geocoding (Nominatim), quality scoring
- Scrapers: CarCruiseFinder HTML scraper (11 states, extendable to 50) as starting point
- Enrichment pipeline: 6-step fallback (source re-scrape, deep parse, outbound links, Brave web search, Gemini AI extraction, geocoding validation)
- Banner/image pipeline: 8-step with R2 upload
- Events imported as `source: crawled`, `status: published`, `claimed: false`
- Extensible to new sources via the tiered source system (50+ sources documented)

---

## 5. Design Principles

1. **Responsive-first** — Every page works on every screen size. Designed mobile-up.
2. **Cards are earned** — Only photo content and featured items get card containers. List items use typography, spacing, and subtle dividers.
3. **Photos are the centerpiece** — Fixed aspect-ratio containers, gradient overlays, inner vignettes to normalize mixed-quality phone uploads.
4. **Consistent interaction feedback** — Every interactive element has hover, active, focus, and loading states. Defined once in a component library, used everywhere. Subtle, consistent transition timing.
5. **System-aware theming** — Dark and light mode via OS preference. Designed for both. Color system: **Warm Amber + Charcoal**.
   - **Accent:** `#f59e0b` (dark), `#92400e` (light) — darkened in light mode to avoid washout
   - **Dark BG:** `#111113` (warm charcoal, not cold blue-black)
   - **Dark Surface:** `#1a1a1d`
   - **Dark Text:** `#f5f5f0` (warm off-white)
   - **Light BG:** `#faf9f6` (warm off-white, not pure white)
   - **Light Surface:** `#ffffff`
   - **Light Text:** `#1a1a18`
   - Warm neutrals in both modes so photos feel natural, never clinical.
6. **No vanity metrics** — No standalone count displays on public pages. Contextual numbers on listings are fine.
7. **Location fallback chain** — GPS (browser geolocation) → Vercel IP headers (`x-vercel-ip-city`, lat/lng) → manual entry.
8. **Progressive disclosure** — Show essentials, let users drill deeper. Especially on mobile.
9. **SEO-first public pages** — Event detail, vehicle detail, explore pages are server-rendered.
10. **Test everything** — Every feature ships with tests. No feature is complete until tests pass. Tests run on every build.
11. **Friendly URLs** — Human-readable slugs everywhere. URL structure:
    - `/@username` — user profile (and club profiles in future — shared namespace)
    - `/@username/vehicle-slug` — vehicle detail (nested under owner)
    - `/events` — event explore/search
    - `/events/[state]/[slug]` — event detail (state prefix for SEO)
    - `/events/map` — full map view
    - `/vehicles` — vehicle explore/browse
    - `/sign-in`, `/sign-up` — auth
    - `/settings` — profile settings
    - `/dashboard` — user dashboard
    - `/admin` — admin panel
    - Note: `@` namespace is shared between users and future clubs. Uniqueness enforced across both.

---

## 6. Landing Page Direction

**Option C v4** — Visual strip + search + varied content feed.

- Compact featured strip (featured event + trending vehicle) — no vanity count boxes
- Pill-shaped search bar with location
- Pill-style tab filters (All / Events / Vehicles / People / Clubs)
- Varied feed rhythm: text rows for events (date accent + title + subtitle + divider), photo containers for vehicles, inline avatars for members
- Cards earned, not default — only photo content and featured items get containers

Reference mockups saved in `.superpowers/brainstorm/` directory.

---

## 7. Testing Strategy

### 7.1 Web App (`carsandcrews-web`)

- **Unit tests** (Vitest + Testing Library) — Components, utilities, helpers, hooks
- **Integration tests** (Vitest) — API routes, server actions, database operations, auth flows
- **E2E tests** (Playwright) — Critical user paths:
  - Sign up / sign in
  - Create a vehicle profile with photos
  - Browse and search events
  - RSVP to an event with vehicle linking
  - Submit an event
  - Claim an event
  - Admin: approve submission, approve claim, edit event, remove content
- **CI gate** — GitHub Actions: lint + type-check + unit/integration tests + E2E on every push. Must pass to merge.

### 7.2 Pipeline (`carsandcrews-pipeline`)

- **Unit tests** (Vitest) — Import logic, dedup, quality scoring, geocoding helpers, data transformations
- **Integration tests** — End-to-end import flow against test database
- **CI gate** — GitHub Actions: lint + tests on every push.

### 7.3 Rule

**No feature is marked complete until its tests exist and pass.** This is a hard gate, not a guideline.

---

## 8. Future Features

Explicitly deferred from MVP. Documented here so architecture accommodates them.

### 8.1 Post-MVP (near-term)

- Clubs / crews / community groups
- Activity feed (cross-content: events, vehicles, people)
- Comments on events and vehicles
- Calendar sync (Google, Apple, Outlook)
- Recurring event management
- "For Sale" flag on vehicles (columns exist, UI deferred)
- Push notifications (event reminders, RSVP updates)
- User-to-user following

### 8.2 Premium Tier Features

- Promoted events / featured listings
- Unlimited photos (if free tier is capped)
- Video support on vehicle profiles
- Event analytics for organizers
- Custom club branding
- Newsletter tools for clubs
- Ad-free experience

### 8.3 Platform Growth

- Vendor / sponsor directory
- Marketplace / transaction fees
- Build journals (restoration progress tracking)
- Photographer attribution and galleries
- Post-event photo galleries (community upload)
- Integration with national orgs (AACA, VMCCA, etc.)
- Expanded geographic coverage (Canada, international)
- Native mobile apps
- Public API / embeddable widgets
- Advanced search (Algolia or similar)
- Facebook / Instagram event import
- Automated moderation (AI + community reporting)
- Automated claim verification

---

## 9. Open Decisions

| # | Decision | Status | Notes |
|---|---|---|---|
| 1 | Brand name | **Decided: Cars & Crews** | carsandcrews.com — broad, social, GenX+ vibe. Ties to "Crews" pillar. |
| 2 | Exact URL structure / slug patterns | **Decided** | `@` for identities (users + future clubs), vehicles nest under owner (`/@user/vehicle`), events get `/events/[state]/[slug]`. See design principle #11. |
| 3 | Pillar naming | **Decided: Garage / Crews / Events** | "Garage" = vehicle showcase, "Crews" = social (ties to brand), "Events" = discovery |
| 4 | Free tier photo cap | **Decided: No cap at launch** | Photo-first site shouldn't restrict uploads. R2 storage is cheap. Add cap later if needed; use other features as premium levers. |
| 5 | Event type taxonomy | **Decided** | car_show, cars_and_coffee, cruise_in, cruise, swap_meet, track_day, auction, workshop, meetup, other. Charity handled via `is_charity` boolean, not a separate type. |
