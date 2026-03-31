# PontiacTempest.com — Build Journal Site Spec

**Date:** 2026-03-31
**Status:** Draft
**Owner:** Kevin Nord

---

## 1. Overview

A personal build journal for Kevin's 1964 Pontiac Tempest Custom — replacing the current WordPress site at pontiactempest.com. Documents the restoration story, projects by vehicle system, and car show appearances. Built to be fast, beautiful, and completely under Kevin's control — no WordPress hosting fees.

**Audience:** Car enthusiasts, Tempest/GTO community, people Googling "1964 Pontiac Tempest [part] replacement"

**Goal:** A showcase site that looks like it belongs to the car — not a generic blog template. Every visitor should immediately feel the era, the color, the character.

---

## 2. Color System: Skyline Blue + Chrome

Inspired by the car itself — 1964 Pontiac Skyline Blue exterior with chrome accents.

### Dark Mode (default)

| Token | Value | Usage |
|---|---|---|
| `accent` | `#5B9BD5` | Primary actions, links, highlights — Skyline Blue, brightened for dark bg |
| `accent-hover` | `#7BB3E0` | Hover state — lighter blue |
| `accent-muted` | `#3A6B9F` | Subtle accents, borders — deeper blue |
| `chrome` | `#C8CDD3` | Secondary accent — chrome trim feel |
| `chrome-bright` | `#E8ECF0` | Bright chrome — headers, emphasis |
| `bg` | `#0C0E12` | Page background — near-black with cool blue undertone |
| `surface` | `#161A20` | Cards, elevated surfaces |
| `surface-raised` | `#1E2430` | Hover states, active surfaces |
| `text` | `#E8ECF0` | Primary text (cool off-white, like chrome) |
| `text-muted` | `#8090A0` | Secondary text — blue-gray |
| `text-faint` | `#4A5568` | Tertiary text |
| `border` | `rgba(91, 155, 213, 0.08)` | Dividers — faint blue tint |
| `border-accent` | `rgba(91, 155, 213, 0.2)` | Accent borders |

### Light Mode

| Token | Value | Usage |
|---|---|---|
| `accent` | `#2B6CB0` | Darkened Skyline Blue for contrast |
| `accent-hover` | `#2C5282` | Deeper on hover |
| `accent-muted` | `#BEE3F8` | Light blue tint for subtle accents |
| `chrome` | `#4A5568` | Chrome as dark gray text accent |
| `bg` | `#F7F9FC` | Cool white with blue tint |
| `surface` | `#FFFFFF` | Cards |
| `text` | `#1A202C` | Near-black |
| `text-muted` | `#718096` | Blue-gray |
| `text-faint` | `#A0AEC0` | Light gray |
| `border` | `rgba(0, 0, 0, 0.06)` | Subtle dividers |

### Accent Colors

| Color | Hex | Usage |
|---|---|---|
| Pontiac Red | `#C53030` | Badges, warnings, Pontiac logo accent |
| Engine Bay Gray | `#4A5568` | Specs, technical content |
| Interior Aqua | `#4FD1C5` | Future — interior section accent |

### Typography
- Headlines: Bold, slightly condensed — muscle car energy
- Body: Clean system font stack
- Monospace for specs/measurements

---

## 3. Architecture

### Stack
- **Next.js 15** (App Router) on **Vercel**
- **Supabase** — Postgres + Auth + RLS (new project or shared with C&C)
- **Cloudflare R2** — photo storage (same bucket, `pontiactempest/` prefix)
- **Domain:** pontiactempest.com → Vercel

### Repo
- `kevnord/pontiactempest` (private, Kevin's GitHub)
- Single repo — it's a small site

---

## 4. Data Model

### `sections`
| Column | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| name | text | e.g., "Exterior", "Engine" |
| slug | text (unique) | URL path |
| description | text (nullable) | Brief section description |
| icon | text (nullable) | Emoji or icon name |
| position | integer | Display order |
| created_at | timestamptz | |
| updated_at | timestamptz | |

Initial sections: Interior, Exterior, Engine, Electrical, About

### `pages`
| Column | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| section_id | UUID (FK → sections) | Parent section |
| title | text | e.g., "Front Disc Brake Conversion" |
| slug | text (unique) | URL path |
| body | text | Rich text content (stored as HTML or Markdown) |
| excerpt | text (nullable) | Short preview text |
| featured_image_url | text (nullable) | Hero image for the page |
| status | text | draft, published |
| position | integer | Order within section |
| date | date (nullable) | When the project was done (for chronological view) |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### `media`
| Column | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| url | text | R2 public URL |
| thumbnail_url | text (nullable) | Smaller version |
| filename | text | Original filename |
| alt_text | text (nullable) | Accessibility |
| width | integer (nullable) | |
| height | integer (nullable) | |
| size_bytes | integer (nullable) | |
| used_in | text[] (nullable) | Page IDs where it's used (denormalized for media library) |
| created_at | timestamptz | |

### `site_settings`
| Column | Type | Notes |
|---|---|---|
| id | UUID | Primary key (single row) |
| site_title | text | "Kevin's 1964 Pontiac Tempest" |
| tagline | text | "A family heirloom restoration journal" |
| hero_image_url | text (nullable) | Landing page hero |
| about_text | text (nullable) | Short about blurb for footer/sidebar |
| contact_email | text (nullable) | |
| merch_url | text (nullable) | Link to MyRestoMod |
| social_links | jsonb | { instagram, youtube, etc. } |
| updated_at | timestamptz | |

### Auth
- Single admin user (Kevin) via Supabase Auth
- No public auth — visitors are anonymous
- Admin check: `role = 'admin'` on profiles table (same pattern as C&C)

### RLS
- All published content readable by anyone (SSR/SEO)
- Only admin can create/update/delete anything

---

## 5. Public Pages

### `/` — Landing Page
- Full-width hero image of the Tempest (Skyline Blue glory)
- Title overlay: "Kevin's 1964 Pontiac Tempest" + tagline
- Section grid below: 4 cards (Interior, Exterior, Engine, Electrical) with icons + descriptions + page count
- "Latest Updates" — 3-4 most recently updated pages
- Merch callout linking to MyRestoMod
- Clean, photo-forward, the car is the star

### `/[section]` — Section Page (e.g., `/exterior`)
- Section hero (optional section-level image)
- Section description
- List of pages within the section, ordered by position
- Each item: title, excerpt, featured image thumbnail, date
- Cards earned — project entries with photos get thumbnail cards; text-only ones get clean rows

### `/[section]/[slug]` — Project Page (e.g., `/exterior/front-disc-brake-conversion`)
- Featured image hero
- Rich text body with inline photos
- Photo gallery (if multiple photos) — reuse C&C lightbox component
- Breadcrumb: Home → Exterior → Front Disc Brake Conversion
- Previous/Next navigation within the section
- Date of project

### `/about` — About Page
- Kevin's story with the Tempest (the "Welcome Home" content)
- Car specs summary
- Car show appearances gallery

### `/about/car-shows` — Car Shows
- Grid of show appearances with photos and dates

---

## 6. Admin Panel (`/admin`)

Protected by auth middleware — redirect to login if not admin.

### `/admin` — Dashboard
- Quick stats: total pages, total photos, last edit date
- "Recent edits" list
- Quick links: New Page, Media Library, Settings

### `/admin/sections` — Manage Sections
- List sections with drag-to-reorder
- Add/edit/delete section (name, slug, description, icon)
- Show page count per section

### `/admin/pages` — Manage Pages
- List all pages, filterable by section and status
- Create/edit page:
  - Title, slug (auto-generated, editable)
  - Section selector (dropdown)
  - Rich text editor (Tiptap) for body content
  - Photo upload inline (click to insert into body)
  - Featured image upload
  - Excerpt (auto-generated from body, editable)
  - Date field
  - Status: draft/published
  - Position (drag to reorder within section)
- Preview before publish
- Delete with confirmation

### `/admin/media` — Media Library
- Grid view of all uploaded photos
- Upload (drag-and-drop, multi-file)
- Click to see details: filename, dimensions, size, where it's used
- Copy URL button
- Delete (with warning if used in pages)
- Search/filter by filename

### `/admin/settings` — Site Settings
- Edit: site title, tagline, hero image, about text, contact email, merch URL, social links
- Save immediately

### Rich Text Editor (Tiptap)
- Headings (H2, H3)
- Bold, italic, underline
- Bullet lists, numbered lists
- Block quotes
- Inline images (upload from editor, inserts into body)
- Links
- Horizontal rule
- Code blocks (for part numbers, specs)
- No tables needed (keep it simple)

---

## 7. Photo Pipeline

Same pattern as C&C:
- Client-side resize (max 2048px) + WebP conversion
- Signed URL upload to R2 (`pontiactempest/` prefix in the carsandcrews bucket, or separate bucket)
- Auto-generate thumbnail (800px width)
- EXIF strip for privacy
- Track in `media` table

---

## 8. WordPress Migration

### Content Scraping
- Scrape all ~35 pages from pontiactempest.com
- Extract: title, body HTML, images
- Map sections from URL structure: `/interior/*`, `/exterior/*`, `/engine/*`, `/electrical/*`, `/about/*`

### Image Migration
- Download all WordPress images
- Upload to R2
- Rewrite image URLs in body content

### Import Script
- Parse scraped content
- Create sections
- Create pages with correct section assignment and ordering
- Insert media records
- Verify all images load

### DNS Cutover
- Point pontiactempest.com to Vercel
- Verify all old URLs still work (same URL structure)
- Set up redirects for any changed paths

---

## 9. SEO

- All pages server-rendered (SSR)
- OG meta tags with featured images
- Schema.org markup for articles
- Sitemap.xml auto-generated
- Same URL structure as WordPress so existing Google rankings transfer:
  - `/interior/`, `/exterior/`, `/engine/`, `/electrical/`
  - `/interior/carpet/`, `/exterior/front-disc-brake-conversion/`, etc.
- Canonical URLs

---

## 10. Implementation Phases

### Phase 1: Foundation
1. Scaffold Next.js project
2. Supabase schema (sections, pages, media, site_settings)
3. Color system + globals.css (Skyline Blue theme)
4. Supabase client setup + auth middleware
5. CI pipeline

### Phase 2: Public Pages
6. Root layout (nav, footer, theme toggle)
7. Landing page (hero, section grid, latest updates)
8. Section page
9. Project page (with photo gallery)
10. About page + car shows

### Phase 3: Admin Panel
11. Admin layout + auth guard
12. Dashboard
13. Section management (CRUD + reorder)
14. Page editor (Tiptap rich text, photo upload)
15. Media library
16. Site settings

### Phase 4: Migration
17. WordPress scraper
18. Image migration to R2
19. Content import
20. URL verification + redirects

### Phase 5: Polish
21. Responsive audit (375/768/1024/1440px)
22. PWA setup
23. DNS cutover
24. E2E tests

---

## 11. Design Principles

1. **The car is the star** — photos first, let the Tempest shine
2. **Era-appropriate feel** — not retro kitsch, but nods to the '60s aesthetic through color and type
3. **Clean admin** — Kevin should be able to add a new project page in under 2 minutes
4. **URL parity** — same structure as WordPress so SEO transfers cleanly
5. **Fast** — static where possible, streaming where needed, photos lazy-loaded
6. **Dark mode default** — like looking at the car in a showroom. Light mode for reading long text in the sun.

---

## 12. Cost After Migration

| Service | Cost |
|---|---|
| Vercel | Free tier (hobby) |
| Supabase | Free tier (single admin user, small DB) |
| Cloudflare R2 | ~$0.50/mo (photos only) |
| Domain | Already owned |
| WordPress | **Cancelled** |
| **Total** | ~$0.50/mo vs current WordPress cost |
