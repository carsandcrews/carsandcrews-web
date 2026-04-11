# Showfield Visual Overhaul — Landing Page Redesign

**Date:** 2026-04-11
**Status:** Design approved, pending implementation plan
**Reference:** `Gemini_Generated_Image_.png` (root of repo)

## Goal

Rebuild the landing page and supporting UI primitives to match the dark,
industrial, red-accented automotive aesthetic of the reference image
(colloquially "the Showfield look"), while preserving the existing
information architecture, routes, and data sources. This is a visual
overhaul — no new pages, no schema changes, no auth changes.

## Non-goals

- New routes (no Forum, Theory, or Build Journals page)
- Database or auth changes
- Restyling interior routes beyond what they inherit from CSS variables
  (admin, dashboard, event detail, vehicle detail tuning is follow-up work)
- Any light-mode variant of the new palette

## Scope decisions (from brainstorming)

| Question | Decision |
|---|---|
| Redesign scope | Full visual overhaul (palette + layout + typography + nav + buttons) |
| Hero imagery | Pull dynamically from top trending build's primary photo |
| Nav labels / IA | Keep existing: Events, Vehicles, Map |
| Display typography | Add Bebas Neue for headings; keep Geist Sans for body/nav/UI |
| Light mode | Removed entirely — dark only |
| Card row under hero | Replace CTA `ActionCards` with three content-preview cards |

## Design

### 1. Palette & tokens

Replace the current amber-on-dark token set in `src/app/globals.css` with
a dark-only "Restomod Stealth" palette. Remove all light-mode variables
and media queries.

| Token | Value | Role |
|---|---|---|
| `--bg` | `#0d0e10` | Page background |
| `--surface` | `#17181b` | Card surfaces |
| `--surface-2` | `#1f2024` | Elevated / hover surfaces |
| `--border` | `rgba(255,255,255,0.08)` | Hairline borders |
| `--border-strong` | `rgba(255,255,255,0.16)` | Emphasized borders |
| `--text` | `#e8e6e1` | Primary text |
| `--text-muted` | `#8a8a8e` | Secondary text |
| `--text-faint` | `#55565b` | Tertiary text |
| `--accent` | `#b3261a` | Deep barn red — buttons, logo, icon accents |
| `--accent-hover` | `#8e1d13` | Red hover state |
| `--accent-ink` | `#f5f5f0` | Text color on red surfaces |

Remove: `@media (prefers-color-scheme: light)` block and any
`[data-theme="light"]` rules.

### 2. Typography

Add Bebas Neue via `next/font/google` in `src/app/layout.tsx`, expose as
CSS variable `--font-display`. Bebas Neue is applied to:

- Hero headline (`clamp(3rem, 7vw, 6rem)`, line-height `0.95`, uppercase,
  letter-spacing `0.02em`)
- `h1`, `h2` elements via a `.display` utility class defined in
  `globals.css`
- Section headings on the landing page ("UPCOMING SHOWS", "LATEST BUILDS")
- Nav links (uppercase, `letter-spacing: 0.08em`)
- Button labels (uppercase)

Geist Sans remains the `body` default and powers card body copy, event
meta text, and form controls.

### 3. Landing page layout

**File:** `src/app/page.tsx`

Page order, top to bottom:

1. NavBar (restyled)
2. Hero (full-bleed photo + gradient overlay)
3. Preview Triptych (three content-preview cards, overlapping hero edge)
4. Event Feed (restyled)
5. Trending Builds (restyled)
6. Footer (restyled)

`page.tsx` server-side queries:

- Existing: nearby events, trending vehicles
- New: newest vehicle by `created_at desc limit 1`

These are passed as props into `HeroTagline` and `PreviewTriptych` so the
server render has all the imagery and preview data baked in.

### 4. Hero section

**File:** `src/components/landing/HeroTagline.tsx` (rebuild)

- Full-bleed container, min-height `~70vh`
- Background image = `topTrendingBuild.primaryPhotoUrl`
- Gradient overlay:
  `linear-gradient(90deg, rgba(13,14,16,0.95) 0%, rgba(13,14,16,0.6) 50%, rgba(13,14,16,0.1) 100%)`
- Left-aligned content block, max-width `~48rem`, vertically centered:
  - Eyebrow: `"FEATURED BUILD · {year} {make} {model}"`, Bebas Neue,
    `text-[--text-muted]`, small
  - Headline: default `"CARS & CREWS: WHERE BUILDS LIVE."` (overridable
    via prop), Bebas Neue, size `clamp(3rem, 7vw, 6rem)`, `text-[--text]`
  - Primary CTA: red squared button "Explore Builds" → `/vehicles`
  - Secondary ghost link: "Submit Your Build" → `/garage/new`
- Fallback: if no trending vehicle or no photo, render solid
  `--bg` → `--surface-2` radial gradient so the page never breaks

### 5. Preview Triptych (replaces ActionCards)

**File:** `src/components/landing/PreviewTriptych.tsx` (new — replaces
`ActionCards.tsx`, which is deleted)

- `grid grid-cols-1 md:grid-cols-3 gap-4`
- Negative top margin (`-mt-16`) so the cards overlap the bottom edge of
  the hero — signature reference layout move
- Three cards, each:
  - `bg-[--surface]`, `border-t-2 border-[--accent]` (red top rule),
    no side/bottom border
  - Padding `p-6`
  - Eyebrow label in Bebas Neue uppercase, `text-[--accent]`
  - Preview content (2 lines max) in Geist, `text-[--text]`
  - Meta line in Geist, `text-[--text-faint]`
  - Entire card is a link to the relevant destination

**Card contents:**

| Card | Eyebrow | Content | Meta | Links to |
|---|---|---|---|---|
| 1 | `NEXT EVENT NEAR YOU` | Event name | Date · distance | `/events/[id]` |
| 2 | `LATEST BUILD` | `{year} {make} {model}` | Builder handle | `/vehicles/[slug]` |
| 3 | `FRESH IN THE GARAGE` | `{year} {make} {model}` | Builder handle · "just added" | `/vehicles/[slug]` |

**Empty-state handling:** the grid never collapses below three slots.
Each card has its own empty state:

- Card 1 (no nearby event): eyebrow `NO SHOWS NEARBY`, content
  `Browse all events →`, links to `/events`
- Card 2 (no trending vehicle): eyebrow `NO BUILDS YET`, content
  `Be the first — add your build →`, links to `/garage/new`
- Card 3 (no newest vehicle, i.e. same no-vehicles state as card 2):
  eyebrow `THE GARAGE IS EMPTY`, content `Submit a build →`, links to
  `/garage/new`

### 6. Event Feed restyle

**File:** `src/components/landing/EventFeed.tsx`

- Section header "UPCOMING SHOWS" in Bebas Neue, `text-[--text]`, with a
  thin red underline
- List items: `bg-[--surface]` cards with `border border-[--border]`,
  hairline separators inside, red accent on dates
- No structural or data-flow changes

### 7. Trending Builds restyle

**File:** `src/components/landing/TrendingBuilds.tsx`

- Section header "LATEST BUILDS" in Bebas Neue, same style as Event Feed
- Vehicle photo tiles get a subtle inner shadow and darker frame
  (`ring-1 ring-[--border]`) to integrate with the moodier palette
- No structural or data-flow changes

### 8. NavBar restyle

**File:** `src/components/layout/NavBar.tsx`

- Sticky header, background `rgba(13,14,16,0.85)`, `backdrop-blur-md`,
  bottom border `--border`
- Logo: keep the existing C&C logo PNG. Add a small red diamond/square
  frame behind it — a `24px` `bg-[--accent]` square skewed `-5deg`,
  absolutely positioned behind the centered PNG — as a callback to the
  reference's angular logo badge
- Nav links: Bebas Neue, uppercase, `letter-spacing: 0.08em`,
  `text-[--text-muted]` default, `text-[--text]` on hover, red underline
  on the active route
- Labels unchanged: **Events**, **Vehicles**, **Map**
- **Remove** `ThemeToggle` from the right side entirely
- Right side now: auth-state buttons only (Sign In / Sign Up, or
  Dashboard / Settings menu)

### 9. Button restyle

**File:** `src/components/ui/button.tsx`

| Variant | Treatment |
|---|---|
| `primary` | `bg-[--accent]`, `text-[--accent-ink]`, Bebas Neue uppercase, `rounded-none`, `h-11 px-6`, hover `--accent-hover`, focus ring `--accent` @ 40% |
| `secondary` | Transparent, `border border-[--border-strong]`, `text-[--text]`, same shape and type treatment, hover `bg-[--surface-2]` |
| `ghost` | No border/background, Bebas Neue uppercase, `text-[--text-muted]`, hover `text-[--accent]` |

Loading state preserved.

### 10. Light mode removal

- `src/app/globals.css`: delete `@media (prefers-color-scheme: light)`
  block, delete `[data-theme="light"]` block
- `src/app/layout.tsx`: remove any `data-theme` attribute on `<html>`
  and any theme-detection script
- `src/components/layout/ThemeToggle.tsx`: **delete**
- Grep for `ThemeToggle` and `data-theme` across the repo; remove all
  references

### 11. Footer restyle

**File:** `src/components/layout/Footer.tsx`

- Restyle to new tokens (`bg-[--surface]`, `text-[--text-muted]`,
  border-top `--border`)
- No structural change

## Files touched

### New
- `src/components/landing/PreviewTriptych.tsx`
- `docs/specs/2026-04-11-showfield-visual-overhaul-design.md`

### Modified
- `src/app/globals.css`
- `src/app/layout.tsx`
- `src/app/page.tsx`
- `src/components/landing/HeroTagline.tsx`
- `src/components/landing/EventFeed.tsx`
- `src/components/landing/TrendingBuilds.tsx`
- `src/components/layout/NavBar.tsx`
- `src/components/layout/Footer.tsx`
- `src/components/ui/button.tsx`

### Deleted
- `src/components/landing/ActionCards.tsx`
- `src/components/layout/ThemeToggle.tsx`

## Verification

1. `npm run build` — TypeScript and Next.js build clean
2. `npm run dev`, open `/` — visually diff against
   `Gemini_Generated_Image_.png` on these checkpoints:
   - Dark gradient overlay on a real vehicle hero photo
   - Bebas Neue display headline, left-aligned
   - Red squared primary CTA button
   - Three content-preview cards overlapping the hero edge
   - Event feed and trending builds restyled with new palette
   - No theme toggle in nav
3. Mobile check at `<768px` — grid collapses, headline reflows via
   `clamp`, hero photo still readable
4. Run existing Playwright tests — none currently depend on the amber
   palette or `ActionCards`, but grep before starting to be sure
5. Manual contrast spot-check on hero text over the gradient overlay
   (target WCAG AA for body, AAA for headline preferred)

## Risks and open questions

- **Top trending build may not have a usable landscape photo.** The
  hero uses a fallback gradient for this case, but if most photos are
  portrait-oriented from phone uploads the hero could feel inconsistent.
  Mitigation: filter the trending query to prefer vehicles with a photo
  flagged `is_hero_safe` or a landscape aspect ratio. If that flag
  doesn't exist, we add it as a follow-up, not as part of this overhaul.
- **Bebas Neue at small sizes** (nav links ~13px) can get thin. If that
  lands poorly during implementation, fall back to Geist Sans for nav
  links and keep Bebas Neue for headings only.
- **Interior routes inherit the new palette automatically** via CSS
  variables, but some admin or form pages may have hardcoded amber or
  light-mode styles that need one-off fixes. Those are follow-up tasks,
  not blockers for this spec.
