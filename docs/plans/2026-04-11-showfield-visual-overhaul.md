# Showfield Visual Overhaul Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restyle the Cars & Crews landing page and shared UI primitives to match the dark, industrial, red-accented "Showfield" aesthetic from the spec while preserving routes and data flow.

**Architecture:** Token-first refactor — rewrite CSS variables in `globals.css`, add Bebas Neue via `next/font/google`, then update each component to use the new tokens and typography. The landing page gains a photo hero (pulled from the top trending vehicle) and a new `PreviewTriptych` component replaces `ActionCards`. Light mode is removed entirely.

**Tech Stack:** Next.js 16 (App Router), React 19, Tailwind CSS v4 (with CSS-variable theme), Supabase SSR, Vitest + React Testing Library, Bebas Neue via `next/font/google`.

**Spec:** `docs/specs/2026-04-11-showfield-visual-overhaul-design.md`
**Mockup:** `docs/mockups/2026-04-11-showfield-overhaul.html`

---

## Task 1: Replace color tokens and remove light mode

**Files:**
- Modify: `src/app/globals.css`

- [ ] **Step 1: Rewrite globals.css**

Replace the entire contents of `src/app/globals.css` with:

```css
@import "tailwindcss";

/* Restomod Stealth palette — dark only */
:root {
  --bg: #0d0e10;
  --surface: #17181b;
  --surface-2: #1f2024;
  --border: rgba(255, 255, 255, 0.08);
  --border-strong: rgba(255, 255, 255, 0.16);
  --text: #e8e6e1;
  --text-muted: #8a8a8e;
  --text-faint: #55565b;
  --accent: #b3261a;
  --accent-hover: #8e1d13;
  --accent-ink: #f5f5f0;
  --nav-bg: rgba(13, 14, 16, 0.85);

  color-scheme: dark;
}

@theme inline {
  --color-accent: var(--accent);
  --color-accent-hover: var(--accent-hover);
  --color-accent-ink: var(--accent-ink);
  --color-bg: var(--bg);
  --color-surface: var(--surface);
  --color-surface-2: var(--surface-2);
  --color-text-primary: var(--text);
  --color-text-muted: var(--text-muted);
  --color-text-faint: var(--text-faint);
  --color-border: var(--border);
  --color-border-strong: var(--border-strong);
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
  --font-display: var(--font-bebas-neue);
}

body {
  background-color: var(--bg);
  color: var(--text);
  font-family: var(--font-sans, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif);
}

.display {
  font-family: var(--font-display, Impact, sans-serif);
  letter-spacing: 0.02em;
  line-height: 0.95;
}
```

Note: the `--accent-text` token from the old file is intentionally dropped — nothing should reference it after this refactor. The `--font-bebas-neue` variable is wired up in Task 2.

- [ ] **Step 2: Verify no references to removed tokens**

Run: `grep -rn "accent-text\|data-theme\|cc-theme" src/ tests/ | grep -v "ThemeToggle.tsx\|NavBar.tsx\|layout.tsx\|accent-ink"`
Expected: no results, or only results in files that will be rewritten later in this plan. If anything else surfaces, resolve it inline before continuing.

- [ ] **Step 3: Commit**

```bash
git add src/app/globals.css
git commit -m "style: replace palette with Restomod Stealth tokens, drop light mode"
```

---

## Task 2: Add Bebas Neue font and strip light-mode scaffolding from root layout

**Files:**
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Rewrite layout.tsx**

Replace the entire contents of `src/app/layout.tsx` with:

```tsx
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Bebas_Neue } from "next/font/google";
import { NavBar } from "@/components/layout/NavBar";
import { Footer } from "@/components/layout/Footer";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const bebasNeue = Bebas_Neue({
  variable: "--font-bebas-neue",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: {
    default: "Cars & Crews — Find Events, Share Builds, Join the Scene",
    template: "%s | Cars & Crews",
  },
  description:
    "The automotive enthusiast platform. Discover car shows, cruise-ins, and meets near you. Share your build. Join your crew.",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#0d0e10",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${bebasNeue.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-bg text-text-primary">
        <NavBar />
        <main className="flex-1">{children}</main>
        <Footer />
        <InstallPrompt />
      </body>
    </html>
  );
}
```

Key changes from the previous version:
- Import `Bebas_Neue` from `next/font/google`
- Instantiate it with `variable: "--font-bebas-neue"`
- Drop `data-theme="dark"` from `<html>` (dark is the only mode)
- Simplify `viewport.themeColor` to a single dark color (no more light/dark split)
- Add `${bebasNeue.variable}` to the `<html>` className

- [ ] **Step 2: Typecheck**

Run: `npm run build -- --no-lint 2>&1 | tail -20` (or just `npm run build` if you want the full check)
Expected: no TypeScript errors. If the build fails because `NavBar` still imports `ThemeToggle`, that's expected — Task 3 fixes it. You can defer this build check until after Task 3 if preferred, but do not skip it permanently.

- [ ] **Step 3: Commit**

```bash
git add src/app/layout.tsx
git commit -m "feat: add Bebas Neue display font, drop data-theme attribute"
```

---

## Task 3: Delete ThemeToggle and remove all references

**Files:**
- Delete: `src/components/layout/ThemeToggle.tsx`
- Modify: `src/components/layout/NavBar.tsx` (remove ThemeToggle import and usages only)

- [ ] **Step 1: Delete the ThemeToggle component file**

Run: `rm src/components/layout/ThemeToggle.tsx`

- [ ] **Step 2: Remove the import from NavBar**

In `src/components/layout/NavBar.tsx`, delete this line:

```tsx
import { ThemeToggle } from './ThemeToggle'
```

- [ ] **Step 3: Remove the desktop ThemeToggle usage**

In `src/components/layout/NavBar.tsx`, in the desktop right-side actions block (the `<div className="hidden items-center gap-3 md:flex">`), delete this line:

```tsx
<ThemeToggle />
```

- [ ] **Step 4: Remove the mobile ThemeToggle usage**

In the mobile actions block (the `<div className="flex items-center gap-1 md:hidden">`), delete this line:

```tsx
<ThemeToggle />
```

Leave the hamburger button untouched — Task 10 restyles the rest of NavBar.

- [ ] **Step 5: Verify no orphan references remain**

Run: `grep -rn "ThemeToggle\|data-theme\|cc-theme" src/ tests/`
Expected: no results.

- [ ] **Step 6: Commit**

```bash
git add src/components/layout/ThemeToggle.tsx src/components/layout/NavBar.tsx
git commit -m "chore: remove ThemeToggle component and references"
```

---

## Task 4: Rewrite Button component variants

**Files:**
- Modify: `src/components/ui/button.tsx`

- [ ] **Step 1: Rewrite button.tsx**

Replace the entire contents of `src/components/ui/button.tsx` with:

```tsx
import { forwardRef, type ButtonHTMLAttributes } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  loading?: boolean
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-[var(--accent)] text-[var(--accent-ink)] hover:bg-[var(--accent-hover)] active:bg-[var(--accent-hover)] focus-visible:ring-[var(--accent)]',
  secondary:
    'bg-transparent text-[var(--text)] border border-[var(--border-strong)] hover:bg-[var(--surface-2)] active:bg-[var(--surface-2)] focus-visible:ring-[var(--border-strong)]',
  ghost:
    'bg-transparent text-[var(--text-muted)] hover:text-[var(--accent)] active:text-[var(--accent-hover)] focus-visible:ring-[var(--accent)] px-0',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', loading, disabled, className = '', children, ...props }, ref) => {
    const isGhost = variant === 'ghost'
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`
          inline-flex items-center justify-center
          ${isGhost ? '' : 'h-11 px-6'}
          font-[var(--font-display),Impact,sans-serif]
          uppercase tracking-[0.1em] text-[15px]
          transition-colors duration-150
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)]
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

Key changes:
- `rounded-full` removed — buttons are squared to match the reference
- Bebas Neue, uppercase, tracked
- `primary` uses `--accent` (deep red) with `--accent-ink` text
- `secondary` is outline-only, hovers to `--surface-2`
- `ghost` is type-only, red on hover

- [ ] **Step 2: Commit**

```bash
git add src/components/ui/button.tsx
git commit -m "style: restyle Button primitive to Bebas Neue squared variants"
```

---

## Task 5: Rebuild HeroTagline as photo hero

**Files:**
- Modify: `src/components/landing/HeroTagline.tsx`
- Modify: `tests/unit/components/landing/HeroTagline.test.tsx`

- [ ] **Step 1: Rewrite the HeroTagline test first (TDD)**

Replace the entire contents of `tests/unit/components/landing/HeroTagline.test.tsx` with:

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { HeroTagline } from '@/components/landing/HeroTagline'

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  )
}))

describe('HeroTagline', () => {
  const featuredBuild = {
    year: 1969,
    make: 'Pontiac',
    model: 'GTO',
    photoUrl: 'https://cdn.example.com/gto.jpg',
  }

  it('renders the default headline when no headline prop provided', () => {
    render(<HeroTagline featuredBuild={featuredBuild} />)
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
  })

  it('renders the featured-build eyebrow when a build is provided', () => {
    render(<HeroTagline featuredBuild={featuredBuild} />)
    expect(screen.getByText(/FEATURED BUILD/)).toBeInTheDocument()
    expect(screen.getByText(/1969 Pontiac GTO/)).toBeInTheDocument()
  })

  it('renders the primary CTA linking to /vehicles', () => {
    render(<HeroTagline featuredBuild={featuredBuild} />)
    const cta = screen.getByRole('link', { name: /explore builds/i })
    expect(cta).toHaveAttribute('href', '/vehicles')
  })

  it('renders the secondary Submit Your Build link', () => {
    render(<HeroTagline featuredBuild={featuredBuild} />)
    const link = screen.getByRole('link', { name: /submit your build/i })
    expect(link).toHaveAttribute('href', '/garage/new')
  })

  it('falls back gracefully when featuredBuild is null', () => {
    render(<HeroTagline featuredBuild={null} />)
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
    // Eyebrow should not contain FEATURED BUILD when there is no build
    expect(screen.queryByText(/FEATURED BUILD/)).not.toBeInTheDocument()
  })

  it('uses the featured build photo as a background image when provided', () => {
    const { container } = render(<HeroTagline featuredBuild={featuredBuild} />)
    const bg = container.querySelector('[data-hero-bg="true"]') as HTMLElement
    expect(bg).not.toBeNull()
    expect(bg.style.backgroundImage).toContain('gto.jpg')
  })
})
```

- [ ] **Step 2: Run the test — verify it fails**

Run: `npx vitest run tests/unit/components/landing/HeroTagline.test.tsx`
Expected: all six tests FAIL because the current `HeroTagline` takes no props and has different content.

- [ ] **Step 3: Rewrite HeroTagline.tsx**

Replace the entire contents of `src/components/landing/HeroTagline.tsx` with:

```tsx
import Link from 'next/link'

export interface FeaturedBuild {
  year: number
  make: string
  model: string
  photoUrl: string | null
  slug?: string
  ownerName?: string
}

interface HeroTaglineProps {
  featuredBuild: FeaturedBuild | null
  headline?: string
}

const DEFAULT_HEADLINE = 'Where builds\nlive, loud.'

export function HeroTagline({ featuredBuild, headline = DEFAULT_HEADLINE }: HeroTaglineProps) {
  const bgStyle: React.CSSProperties = featuredBuild?.photoUrl
    ? { backgroundImage: `url(${featuredBuild.photoUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : {}

  return (
    <section className="relative overflow-hidden" style={{ minHeight: '70vh' }}>
      <div
        data-hero-bg="true"
        className="absolute inset-0"
        style={bgStyle}
        aria-hidden="true"
      >
        {!featuredBuild?.photoUrl && (
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse 60% 45% at 72% 55%, rgba(60,70,85,0.45) 0%, transparent 70%), linear-gradient(135deg, #0a0b0d 0%, #14161a 40%, #1c1e24 65%, #0f1113 100%)',
            }}
          />
        )}
      </div>

      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(90deg, rgba(13,14,16,0.96) 0%, rgba(13,14,16,0.7) 48%, rgba(13,14,16,0.15) 100%)',
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto flex h-full max-w-6xl items-center px-6 py-24 sm:px-10 lg:px-16">
        <div className="max-w-2xl">
          {featuredBuild && (
            <p className="mb-6 flex items-center gap-3 text-[13px] tracking-[0.2em] text-[var(--text-muted)] display uppercase">
              <span className="inline-block h-[2px] w-8 bg-[var(--accent)]" />
              FEATURED BUILD · {featuredBuild.year} {featuredBuild.make} {featuredBuild.model}
            </p>
          )}

          <h1
            className="display mb-8 whitespace-pre-line text-[var(--text)] uppercase"
            style={{ fontSize: 'clamp(3rem, 7vw, 6rem)', lineHeight: 0.92 }}
          >
            {headline}
          </h1>

          <div className="flex flex-wrap items-center gap-5">
            <Link
              href="/vehicles"
              className="display inline-flex h-12 items-center bg-[var(--accent)] px-8 text-[17px] uppercase tracking-[0.1em] text-[var(--accent-ink)] transition-colors hover:bg-[var(--accent-hover)]"
            >
              Explore Builds
            </Link>
            <Link
              href="/garage/new"
              className="display text-[15px] uppercase tracking-[0.1em] text-[var(--text-muted)] transition-colors hover:text-[var(--accent)]"
            >
              Submit Your Build →
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 4: Run the test — verify it passes**

Run: `npx vitest run tests/unit/components/landing/HeroTagline.test.tsx`
Expected: all six tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/landing/HeroTagline.tsx tests/unit/components/landing/HeroTagline.test.tsx
git commit -m "feat: rebuild HeroTagline as photo hero with featured build"
```

---

## Task 6: Create PreviewTriptych component

**Files:**
- Create: `src/components/landing/PreviewTriptych.tsx`
- Create: `tests/unit/components/landing/PreviewTriptych.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `tests/unit/components/landing/PreviewTriptych.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PreviewTriptych } from '@/components/landing/PreviewTriptych'

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  )
}))

describe('PreviewTriptych', () => {
  const nextEvent = {
    name: 'Warmuth Cruise-In',
    dateLabel: 'Apr 18',
    distanceLabel: '12 mi away',
    href: '/events/mi/warmuth-cruise-in',
  }
  const latestBuild = {
    title: '1964 Pontiac Tempest',
    subtitle: '@kmnord',
    href: '/@kmnord/64-tempest',
  }
  const freshBuild = {
    title: '1971 Chevelle SS',
    subtitle: '@crewmember · just added',
    href: '/@crewmember/71-chevelle-ss',
  }

  it('renders all three card eyebrow labels', () => {
    render(<PreviewTriptych nextEvent={nextEvent} latestBuild={latestBuild} freshBuild={freshBuild} />)
    expect(screen.getByText('NEXT EVENT NEAR YOU')).toBeInTheDocument()
    expect(screen.getByText('LATEST BUILD')).toBeInTheDocument()
    expect(screen.getByText('FRESH IN THE GARAGE')).toBeInTheDocument()
  })

  it('renders content titles and links', () => {
    render(<PreviewTriptych nextEvent={nextEvent} latestBuild={latestBuild} freshBuild={freshBuild} />)
    expect(screen.getByRole('link', { name: /warmuth cruise-in/i })).toHaveAttribute('href', '/events/mi/warmuth-cruise-in')
    expect(screen.getByRole('link', { name: /1964 pontiac tempest/i })).toHaveAttribute('href', '/@kmnord/64-tempest')
    expect(screen.getByRole('link', { name: /1971 chevelle ss/i })).toHaveAttribute('href', '/@crewmember/71-chevelle-ss')
  })

  it('renders the next-event empty state when nextEvent is null', () => {
    render(<PreviewTriptych nextEvent={null} latestBuild={latestBuild} freshBuild={freshBuild} />)
    expect(screen.getByText('NO SHOWS NEARBY')).toBeInTheDocument()
    const card = screen.getByText('NO SHOWS NEARBY').closest('a')
    expect(card).toHaveAttribute('href', '/events')
  })

  it('renders the no-builds empty state when latestBuild is null', () => {
    render(<PreviewTriptych nextEvent={nextEvent} latestBuild={null} freshBuild={freshBuild} />)
    expect(screen.getByText('NO BUILDS YET')).toBeInTheDocument()
    const card = screen.getByText('NO BUILDS YET').closest('a')
    expect(card).toHaveAttribute('href', '/garage/new')
  })

  it('renders the empty-garage state when freshBuild is null', () => {
    render(<PreviewTriptych nextEvent={nextEvent} latestBuild={latestBuild} freshBuild={null} />)
    expect(screen.getByText('THE GARAGE IS EMPTY')).toBeInTheDocument()
    const card = screen.getByText('THE GARAGE IS EMPTY').closest('a')
    expect(card).toHaveAttribute('href', '/garage/new')
  })
})
```

- [ ] **Step 2: Run the test — verify it fails**

Run: `npx vitest run tests/unit/components/landing/PreviewTriptych.test.tsx`
Expected: FAIL with `Cannot find module '@/components/landing/PreviewTriptych'` or similar.

- [ ] **Step 3: Create PreviewTriptych.tsx**

Create `src/components/landing/PreviewTriptych.tsx`:

```tsx
import Link from 'next/link'

export interface PreviewEvent {
  name: string
  dateLabel: string
  distanceLabel: string | null
  href: string
}

export interface PreviewBuild {
  title: string
  subtitle: string
  href: string
}

interface PreviewTriptychProps {
  nextEvent: PreviewEvent | null
  latestBuild: PreviewBuild | null
  freshBuild: PreviewBuild | null
}

interface CardProps {
  eyebrow: string
  title: string
  meta: string
  href: string
}

function Card({ eyebrow, title, meta, href }: CardProps) {
  return (
    <Link
      href={href}
      className="group flex min-h-[160px] flex-col border-t-2 border-[var(--accent)] bg-[var(--surface)] p-6 transition-colors hover:bg-[var(--surface-2)]"
    >
      <div className="display mb-3 text-[12px] uppercase tracking-[0.18em] text-[var(--accent)]">
        {eyebrow}
      </div>
      <div className="mb-2 text-[17px] font-semibold leading-snug text-[var(--text)]">
        {title}
      </div>
      <div className="mt-auto flex items-center justify-between border-t border-[var(--border)] pt-3 text-[12px] text-[var(--text-faint)]">
        <span>{meta}</span>
        <span className="text-[var(--text-muted)] transition-transform group-hover:translate-x-1">→</span>
      </div>
    </Link>
  )
}

export function PreviewTriptych({ nextEvent, latestBuild, freshBuild }: PreviewTriptychProps) {
  const eventCard: CardProps = nextEvent
    ? {
        eyebrow: 'NEXT EVENT NEAR YOU',
        title: nextEvent.name,
        meta: [nextEvent.dateLabel, nextEvent.distanceLabel].filter(Boolean).join(' · '),
        href: nextEvent.href,
      }
    : {
        eyebrow: 'NO SHOWS NEARBY',
        title: 'Browse all events →',
        meta: 'Find one to attend',
        href: '/events',
      }

  const latestCard: CardProps = latestBuild
    ? {
        eyebrow: 'LATEST BUILD',
        title: latestBuild.title,
        meta: latestBuild.subtitle,
        href: latestBuild.href,
      }
    : {
        eyebrow: 'NO BUILDS YET',
        title: 'Be the first — add your build →',
        meta: 'Start your garage',
        href: '/garage/new',
      }

  const freshCard: CardProps = freshBuild
    ? {
        eyebrow: 'FRESH IN THE GARAGE',
        title: freshBuild.title,
        meta: freshBuild.subtitle,
        href: freshBuild.href,
      }
    : {
        eyebrow: 'THE GARAGE IS EMPTY',
        title: 'Submit a build →',
        meta: 'Be the first',
        href: '/garage/new',
      }

  return (
    <div className="relative z-20 mx-auto -mt-16 grid max-w-6xl grid-cols-1 gap-4 px-6 sm:px-10 md:grid-cols-3 lg:px-16">
      <Card {...eventCard} />
      <Card {...latestCard} />
      <Card {...freshCard} />
    </div>
  )
}
```

- [ ] **Step 4: Run the test — verify it passes**

Run: `npx vitest run tests/unit/components/landing/PreviewTriptych.test.tsx`
Expected: all five tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/landing/PreviewTriptych.tsx tests/unit/components/landing/PreviewTriptych.test.tsx
git commit -m "feat: add PreviewTriptych landing component"
```

---

## Task 7: Delete ActionCards and its test

**Files:**
- Delete: `src/components/landing/ActionCards.tsx`
- Delete: `tests/unit/components/landing/ActionCards.test.tsx`

- [ ] **Step 1: Delete both files**

Run:
```bash
rm src/components/landing/ActionCards.tsx tests/unit/components/landing/ActionCards.test.tsx
```

- [ ] **Step 2: Verify nothing else imports ActionCards**

Run: `grep -rn "ActionCards" src/ tests/`
Expected: no results. `src/app/page.tsx` currently imports it, but Task 12 rewrites that file — if grep only finds `page.tsx`, that's acceptable because we're about to rewrite it. If it finds anything else, resolve before continuing.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "chore: remove ActionCards component and test (replaced by PreviewTriptych)"
```

---

## Task 8: Restyle EventFeed with new tokens and Bebas Neue heading

**Files:**
- Modify: `src/components/landing/EventFeed.tsx`

- [ ] **Step 1: Rewrite EventFeed.tsx**

Replace the entire contents of `src/components/landing/EventFeed.tsx` with:

```tsx
import Link from 'next/link'
import { formatEventType } from '@/lib/utils'
import type { EventType } from '@/lib/constants'

interface FeedEvent {
  name: string
  date: string
  city: string
  state: string
  event_type: EventType
  slug: string
  state_code: string
  distance_miles?: number | null
}

interface EventFeedProps {
  events: FeedEvent[]
}

function isThisWeekend(dateStr: string): boolean {
  const now = new Date()
  const eventDate = new Date(dateStr + 'T00:00:00')
  const diffMs = eventDate.getTime() - now.getTime()
  const diffDays = diffMs / (1000 * 60 * 60 * 24)
  return diffDays >= 0 && diffDays <= 7
}

function formatSubtitle(event: FeedEvent): string {
  const d = new Date(event.date + 'T00:00:00')
  const day = d.toLocaleDateString('en-US', { weekday: 'long' })
  const parts = [day, `${event.city}, ${event.state}`]
  if (event.distance_miles != null) {
    parts.push(`${Math.round(event.distance_miles)} mi`)
  }
  return parts.join(' \u00B7 ')
}

export function EventFeed({ events }: EventFeedProps) {
  const displayEvents = events.length > 0 ? events : PLACEHOLDER_EVENTS

  return (
    <section className="mx-auto max-w-6xl px-6 py-16 sm:px-10 lg:px-16">
      <div className="relative mb-6 flex items-baseline justify-between border-b border-[var(--border)] pb-4">
        <h2 className="display text-[32px] uppercase tracking-[0.05em] text-[var(--text)]">
          Upcoming Shows
        </h2>
        <Link
          href="/events"
          className="display text-[13px] uppercase tracking-[0.15em] text-[var(--text-muted)] transition-colors hover:text-[var(--accent)]"
        >
          View All →
        </Link>
        <span className="absolute -bottom-[1px] left-0 h-[2px] w-14 bg-[var(--accent)]" aria-hidden="true" />
      </div>

      <div className="flex flex-col gap-px border border-[var(--border)] bg-[var(--border)]">
        {displayEvents.map((event, i) => {
          const d = new Date(event.date + 'T00:00:00')
          const month = d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()
          const day = d.getDate()
          const weekend = i === 0 && isThisWeekend(event.date)

          return (
            <Link
              key={event.slug}
              href={`/events/${event.state_code.toLowerCase()}/${event.slug}`}
              className="grid grid-cols-[80px_1fr_auto] items-center gap-5 bg-[var(--surface)] px-6 py-4 transition-colors hover:bg-[var(--surface-2)]"
            >
              <div className="display leading-[1.1]">
                <div className="text-[14px] uppercase tracking-[0.1em] text-[var(--accent)]">{month}</div>
                <div className="text-[28px] text-[var(--text)]">{day}</div>
              </div>
              <div className="min-w-0">
                <div className="mb-1 flex items-center gap-2">
                  <span className="truncate text-[15px] font-semibold text-[var(--text)]">{event.name}</span>
                  {weekend && (
                    <span className="display flex-shrink-0 bg-[var(--accent)] px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-[var(--accent-ink)]">
                      This Weekend
                    </span>
                  )}
                </div>
                <div className="text-[12px] text-[var(--text-faint)]">{formatSubtitle(event)}</div>
              </div>
              <span className="display text-[12px] uppercase tracking-[0.15em] text-[var(--text-muted)]">
                {formatEventType(event.event_type)}
              </span>
            </Link>
          )
        })}
      </div>
    </section>
  )
}

const PLACEHOLDER_EVENTS: FeedEvent[] = [
  { name: 'Saturday Cruise-In at Sonic', date: '2026-04-05', city: 'Round Rock', state: 'TX', event_type: 'cruise_in', slug: 'saturday-cruise-in-at-sonic', state_code: 'tx', distance_miles: null },
  { name: 'Cars & Coffee \u2014 The Domain', date: '2026-04-06', city: 'Austin', state: 'TX', event_type: 'cars_and_coffee', slug: 'cars-and-coffee-the-domain', state_code: 'tx', distance_miles: null },
  { name: 'Lone Star Nationals', date: '2026-04-12', city: 'Fort Worth', state: 'TX', event_type: 'car_show', slug: 'lone-star-nationals', state_code: 'tx', distance_miles: null },
]
```

- [ ] **Step 2: Run existing EventFeed tests**

Run: `npx vitest run tests/unit/components/landing/EventFeed.test.tsx`
Expected: tests should still pass, but some may fail if they assert specific class names or the old "What's Happening Near You" header. If they fail, read the test and update the assertions to the new copy ("Upcoming Shows") or to role-based queries that don't depend on styling. Rerun until green.

- [ ] **Step 3: Commit**

```bash
git add src/components/landing/EventFeed.tsx tests/unit/components/landing/EventFeed.test.tsx
git commit -m "style: restyle EventFeed with Restomod tokens and Bebas Neue header"
```

---

## Task 9: Restyle TrendingBuilds with new tokens and Bebas Neue heading

**Files:**
- Modify: `src/components/landing/TrendingBuilds.tsx`

- [ ] **Step 1: Rewrite TrendingBuilds.tsx**

Replace the entire contents of `src/components/landing/TrendingBuilds.tsx` with:

```tsx
import Link from 'next/link'

interface Vehicle {
  year: number
  make: string
  model: string
  slug: string
  photo_url: string | null
  owner_name: string
}

interface TrendingBuildsProps {
  vehicles: Vehicle[]
}

const PLACEHOLDER_VEHICLES: Vehicle[] = [
  { year: 1969, make: 'Chevrolet', model: 'Camaro SS', slug: '69-camaro-ss', photo_url: null, owner_name: 'mike_builds' },
  { year: 1957, make: 'Chevrolet', model: 'Bel Air', slug: '57-bel-air', photo_url: null, owner_name: 'classic_joe' },
  { year: 1992, make: 'Acura', model: 'NSX', slug: '92-nsx', photo_url: null, owner_name: 'jdm_life' },
  { year: 1964, make: 'Pontiac', model: 'Tempest', slug: '64-tempest', photo_url: null, owner_name: 'kevnord' },
]

export function TrendingBuilds({ vehicles }: TrendingBuildsProps) {
  const displayVehicles = vehicles.length > 0 ? vehicles : PLACEHOLDER_VEHICLES

  return (
    <section className="mx-auto max-w-6xl px-6 py-16 sm:px-10 lg:px-16">
      <div className="relative mb-6 flex items-baseline justify-between border-b border-[var(--border)] pb-4">
        <h2 className="display text-[32px] uppercase tracking-[0.05em] text-[var(--text)]">
          Latest Builds
        </h2>
        <Link
          href="/vehicles"
          className="display text-[13px] uppercase tracking-[0.15em] text-[var(--text-muted)] transition-colors hover:text-[var(--accent)]"
        >
          View All →
        </Link>
        <span className="absolute -bottom-[1px] left-0 h-[2px] w-14 bg-[var(--accent)]" aria-hidden="true" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {displayVehicles.map((v) => {
          const title = `${v.year} ${v.make} ${v.model}`

          return (
            <Link
              key={v.slug}
              href={`/@${v.owner_name}/${v.slug}`}
              className="group overflow-hidden border border-[var(--border)] bg-[var(--surface)] transition-colors hover:border-[var(--border-strong)]"
            >
              <div className="relative" style={{ aspectRatio: '4/3' }}>
                {v.photo_url ? (
                  <img
                    src={v.photo_url}
                    alt={title}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
                    loading="lazy"
                  />
                ) : (
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        'linear-gradient(135deg, #1a1c20 0%, #24272d 50%, #12141a 100%)',
                    }}
                  />
                )}
                <div className="absolute inset-0 ring-1 ring-inset ring-[var(--border)]" aria-hidden="true" />
                <div
                  className="absolute inset-0"
                  style={{ boxShadow: 'inset 0 0 60px rgba(0,0,0,0.5)' }}
                  aria-hidden="true"
                />
              </div>
              <div className="p-4">
                <div className="text-[15px] font-semibold text-[var(--text)]">{title}</div>
                <div className="mt-1 text-[12px] text-[var(--text-faint)]">@{v.owner_name}</div>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Run existing TrendingBuilds tests**

Run: `npx vitest run tests/unit/components/landing/TrendingBuilds.test.tsx`
Expected: tests may fail if they assert the old "Trending Builds" header text or specific class names. If so, update the assertions to match "Latest Builds" or use role-based queries. Rerun until green.

- [ ] **Step 3: Commit**

```bash
git add src/components/landing/TrendingBuilds.tsx tests/unit/components/landing/TrendingBuilds.test.tsx
git commit -m "style: restyle TrendingBuilds grid with Restomod tokens"
```

---

## Task 10: Restyle NavBar

**Files:**
- Modify: `src/components/layout/NavBar.tsx`

- [ ] **Step 1: Rewrite NavBar.tsx**

Replace the entire contents of `src/components/layout/NavBar.tsx` with:

```tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createBrowserClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

const NAV_LINKS = [
  { label: 'Events', href: '/events' },
  { label: 'Vehicles', href: '/vehicles' },
  { label: 'Map', href: '/events/map' },
]

export function NavBar() {
  const [user, setUser] = useState<User | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const supabase = createBrowserClient()
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
    })
  }, [])

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--nav-bg)] backdrop-blur-md">
      <nav
        className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 sm:px-10 lg:px-16"
        aria-label="Main navigation"
      >
        {/* Left: brand + nav links */}
        <div className="flex items-center gap-10">
          <Link href="/" className="group flex items-center gap-3" aria-label="Cars & Crews home">
            <span
              className="relative inline-flex h-7 w-7 items-center justify-center bg-[var(--accent)]"
              style={{ transform: 'skew(-8deg)' }}
              aria-hidden="true"
            >
              <img src="/logo.png" alt="" className="h-5 w-auto" style={{ transform: 'skew(8deg)' }} />
            </span>
            <span className="display text-[20px] uppercase tracking-[0.1em] text-[var(--text)]">
              Cars &amp; Crews
            </span>
          </Link>
          <div className="hidden items-center gap-7 md:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="display text-[15px] uppercase tracking-[0.12em] text-[var(--text-muted)] transition-colors hover:text-[var(--text)]"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Right: auth buttons (desktop) */}
        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <>
              <Link
                href="/dashboard"
                className="display inline-flex h-10 items-center bg-[var(--accent)] px-5 text-[14px] uppercase tracking-[0.1em] text-[var(--accent-ink)] transition-colors hover:bg-[var(--accent-hover)]"
              >
                Dashboard
              </Link>
              <Link
                href="/settings"
                className="display text-[14px] uppercase tracking-[0.12em] text-[var(--text-muted)] transition-colors hover:text-[var(--text)]"
              >
                Settings
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="display text-[14px] uppercase tracking-[0.12em] text-[var(--text-muted)] transition-colors hover:text-[var(--text)]"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="display inline-flex h-10 items-center bg-[var(--accent)] px-5 text-[14px] uppercase tracking-[0.1em] text-[var(--accent-ink)] transition-colors hover:bg-[var(--accent-hover)]"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile: hamburger */}
        <div className="flex items-center gap-1 md:hidden">
          <button
            className="inline-flex items-center justify-center p-2 text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            {menuOpen ? (
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            )}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="border-t border-[var(--border)] bg-[var(--bg)] px-6 py-5 md:hidden">
          <div className="flex flex-col gap-3">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="display px-3 py-2 text-[15px] uppercase tracking-[0.12em] text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-2 border-t border-[var(--border)] pt-3">
              {user ? (
                <div className="flex flex-col gap-2">
                  <Link
                    href="/dashboard"
                    className="display block bg-[var(--accent)] px-4 py-3 text-center text-[14px] uppercase tracking-[0.1em] text-[var(--accent-ink)] transition-colors hover:bg-[var(--accent-hover)]"
                    onClick={() => setMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/settings"
                    className="display block px-3 py-2 text-center text-[14px] uppercase tracking-[0.12em] text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
                    onClick={() => setMenuOpen(false)}
                  >
                    Settings
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link
                    href="/sign-in"
                    className="display block px-3 py-2 text-center text-[14px] uppercase tracking-[0.12em] text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
                    onClick={() => setMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/sign-up"
                    className="display block bg-[var(--accent)] px-4 py-3 text-center text-[14px] uppercase tracking-[0.1em] text-[var(--accent-ink)] transition-colors hover:bg-[var(--accent-hover)]"
                    onClick={() => setMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
```

Note: the ThemeToggle import was already removed in Task 3. This task replaces the rest of the nav styling.

- [ ] **Step 2: Commit**

```bash
git add src/components/layout/NavBar.tsx
git commit -m "style: restyle NavBar with Bebas Neue links and red logo mark"
```

---

## Task 11: Restyle Footer

**Files:**
- Modify: `src/components/layout/Footer.tsx`

- [ ] **Step 1: Rewrite Footer.tsx**

Replace the entire contents of `src/components/layout/Footer.tsx` with:

```tsx
import Link from 'next/link'

const FOOTER_LINKS = [
  { label: 'Events', href: '/events' },
  { label: 'Vehicles', href: '/vehicles' },
  { label: 'Map', href: '/events/map' },
]

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="mt-auto border-t border-[var(--border)] bg-[var(--surface)]">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-6 py-10 sm:flex-row sm:justify-between sm:px-10 lg:px-16">
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="display text-[18px] uppercase tracking-[0.1em] text-[var(--text)]"
          >
            Cars &amp; Crews
          </Link>
          <div className="flex gap-5">
            {FOOTER_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="display text-[12px] uppercase tracking-[0.12em] text-[var(--text-muted)] transition-colors hover:text-[var(--accent)]"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
        <p className="text-[11px] text-[var(--text-faint)]">
          &copy; {year} Cars &amp; Crews · Where builds live
        </p>
      </div>
    </footer>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/layout/Footer.tsx
git commit -m "style: restyle Footer with Bebas Neue brand and token colors"
```

---

## Task 12: Update page.tsx — query newest vehicle, wire hero and triptych

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Rewrite page.tsx**

Replace the entire contents of `src/app/page.tsx` with:

```tsx
import { headers } from 'next/headers'
import { createServer } from '@/lib/supabase/server'
import { US_STATES, type EventType } from '@/lib/constants'
import { parseVercelHeaders } from '@/lib/location/detect'
import { HeroTagline, type FeaturedBuild } from '@/components/landing/HeroTagline'
import { PreviewTriptych, type PreviewEvent, type PreviewBuild } from '@/components/landing/PreviewTriptych'
import { SearchBarLanding } from '@/components/landing/SearchBarLanding'
import { EventFeed } from '@/components/landing/EventFeed'
import { TrendingBuilds } from '@/components/landing/TrendingBuilds'

function stateToCode(state: string): string {
  const found = US_STATES.find(
    (s) => s.name.toLowerCase() === state.toLowerCase() || s.code.toLowerCase() === state.toLowerCase()
  )
  return found ? found.code.toLowerCase() : state.toLowerCase().replace(/\s+/g, '-')
}

type FeedEvent = {
  name: string
  date: string
  city: string
  state: string
  event_type: EventType
  slug: string
  state_code: string
  distance_miles?: number | null
}

type VehicleRow = {
  year: number
  make: string
  model: string
  slug: string
  photo_url: string | null
  owner_name: string
}

export default async function HomePage() {
  const supabase = await createServer()
  const reqHeaders = await headers()
  const location = parseVercelHeaders(reqHeaders)

  const today = new Date().toISOString().split('T')[0]
  const thirtyDays = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]

  let events: FeedEvent[]

  if (location) {
    const { data: nearbyData } = await supabase.rpc('nearby_events', {
      user_lat: location.lat,
      user_lng: location.lng,
      radius_miles: 150,
      max_results: 8,
    })

    if (nearbyData && nearbyData.length > 0) {
      events = nearbyData.map((e: Record<string, unknown>) => ({
        name: e.name as string,
        date: e.date as string,
        city: e.city as string,
        state: e.state as string,
        event_type: e.event_type as EventType,
        slug: e.slug as string,
        state_code: stateToCode(e.state as string),
        distance_miles: e.distance_miles as number,
      }))
    } else {
      events = await fetchFallbackEvents(supabase, today, thirtyDays)
    }
  } else {
    events = await fetchFallbackEvents(supabase, today, thirtyDays)
  }

  const [trendingRes, newestRes] = await Promise.all([
    supabase
      .from('vehicles')
      .select('year, make, model, slug, vehicle_photos(url, position), profiles(username)')
      .eq('visibility', 'public')
      .order('created_at', { ascending: false })
      .limit(6),
    supabase
      .from('vehicles')
      .select('year, make, model, slug, vehicle_photos(url, position), profiles(username)')
      .eq('visibility', 'public')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ])

  const vehicles: VehicleRow[] = (trendingRes.data ?? []).map((v: Record<string, unknown>) => {
    const photos = (v.vehicle_photos as Array<{ url: string; position: number }>) || []
    const firstPhoto = photos.sort((a, b) => a.position - b.position)[0]
    return {
      year: v.year as number,
      make: v.make as string,
      model: v.model as string,
      slug: v.slug as string,
      photo_url: firstPhoto?.url || null,
      owner_name: ((v.profiles as Record<string, string>)?.username as string) || 'unknown',
    }
  })

  const newestVehicleRow = newestRes.data as Record<string, unknown> | null
  const newestVehicle: VehicleRow | null = newestVehicleRow
    ? {
        year: newestVehicleRow.year as number,
        make: newestVehicleRow.make as string,
        model: newestVehicleRow.model as string,
        slug: newestVehicleRow.slug as string,
        photo_url:
          ((newestVehicleRow.vehicle_photos as Array<{ url: string; position: number }>) || []).sort(
            (a, b) => a.position - b.position
          )[0]?.url || null,
        owner_name:
          ((newestVehicleRow.profiles as Record<string, string>)?.username as string) || 'unknown',
      }
    : null

  // Featured build for hero = first trending vehicle with a photo (fallback: first trending)
  const featuredBuildSource = vehicles.find((v) => v.photo_url) ?? vehicles[0] ?? null
  const featuredBuild: FeaturedBuild | null = featuredBuildSource
    ? {
        year: featuredBuildSource.year,
        make: featuredBuildSource.make,
        model: featuredBuildSource.model,
        photoUrl: featuredBuildSource.photo_url,
        slug: featuredBuildSource.slug,
        ownerName: featuredBuildSource.owner_name,
      }
    : null

  const nextEvent: PreviewEvent | null =
    events.length > 0
      ? {
          name: events[0].name,
          dateLabel: new Date(events[0].date + 'T00:00:00').toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          }),
          distanceLabel:
            events[0].distance_miles != null
              ? `${Math.round(events[0].distance_miles)} mi away`
              : `${events[0].city}, ${events[0].state}`,
          href: `/events/${events[0].state_code.toLowerCase()}/${events[0].slug}`,
        }
      : null

  const latestBuild: PreviewBuild | null = vehicles[0]
    ? {
        title: `${vehicles[0].year} ${vehicles[0].make} ${vehicles[0].model}`,
        subtitle: `@${vehicles[0].owner_name}`,
        href: `/@${vehicles[0].owner_name}/${vehicles[0].slug}`,
      }
    : null

  const freshBuild: PreviewBuild | null = newestVehicle
    ? {
        title: `${newestVehicle.year} ${newestVehicle.make} ${newestVehicle.model}`,
        subtitle: `@${newestVehicle.owner_name} · just added`,
        href: `/@${newestVehicle.owner_name}/${newestVehicle.slug}`,
      }
    : null

  const locationStr = location ? `${location.city}, ${location.state}` : null

  return (
    <div className="w-full">
      <HeroTagline featuredBuild={featuredBuild} />
      <PreviewTriptych nextEvent={nextEvent} latestBuild={latestBuild} freshBuild={freshBuild} />
      <div className="mx-auto max-w-6xl px-6 pt-12 sm:px-10 lg:px-16">
        <SearchBarLanding location={locationStr} />
      </div>
      <EventFeed events={events} />
      <TrendingBuilds vehicles={vehicles} />
    </div>
  )
}

async function fetchFallbackEvents(
  supabase: Awaited<ReturnType<typeof createServer>>,
  today: string,
  thirtyDays: string
): Promise<FeedEvent[]> {
  const { data } = await supabase
    .from('events')
    .select('name, date, city, state, event_type, slug, banner_url, status')
    .eq('status', 'published')
    .gte('date', today)
    .lte('date', thirtyDays)
    .order('date', { ascending: true })
    .limit(8)

  return (data ?? []).map((e) => ({
    name: e.name,
    date: e.date,
    city: e.city,
    state: e.state,
    event_type: e.event_type,
    slug: e.slug,
    state_code: stateToCode(e.state),
    distance_miles: null as number | null,
  }))
}
```

Key changes from the previous version:
- Import `FeaturedBuild`, `PreviewTriptych`, `PreviewEvent`, `PreviewBuild` (drop `ActionCards`)
- Rename `vehiclesRes` → `trendingRes`; add a second parallel query `newestRes` with `.limit(1).maybeSingle()`
- Derive `featuredBuild` (first trending vehicle with a photo)
- Derive `nextEvent`, `latestBuild`, `freshBuild` preview shapes for the triptych
- Drop the old `eventCount` query (nothing uses it after ActionCards is gone)
- Pass props to `<HeroTagline>` and `<PreviewTriptych>`
- Removed the `max-w-3xl` wrapper — sections now control their own max-widths for the full-bleed hero

- [ ] **Step 2: Typecheck and build**

Run: `npm run build`
Expected: successful build. If anything fails, read the error, fix inline, rerun.

- [ ] **Step 3: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: wire HeroTagline and PreviewTriptych into landing page"
```

---

## Task 13: Full verification

**Files:** none modified

- [ ] **Step 1: Run the full unit test suite**

Run: `npm run test`
Expected: all tests pass. If anything fails, read the failure, fix the component or test, commit the fix, then rerun.

- [ ] **Step 2: Run lint**

Run: `npm run lint`
Expected: no errors. Warnings about the `<img>` tag in TrendingBuilds/NavBar may appear if the project uses `@next/next/no-img-element` — those existed before this refactor and are not blocking. If lint is clean otherwise, proceed.

- [ ] **Step 3: Run production build**

Run: `npm run build`
Expected: successful build, no TypeScript errors.

- [ ] **Step 4: Start dev server and visual-check**

Run: `npm run dev` (background or separate shell)

Open `http://localhost:3000/` in a browser. Verify against `Gemini_Generated_Image_.png` and `docs/mockups/2026-04-11-showfield-overhaul.html`:

- [ ] Nav bar: dark, Bebas Neue uppercase links, red skewed logo mark, no theme toggle
- [ ] Hero: full-bleed with vehicle photo background + left-to-right dark overlay
- [ ] Hero headline in Bebas Neue, large and condensed
- [ ] Featured build eyebrow ("FEATURED BUILD · YEAR MAKE MODEL") visible
- [ ] Red squared "Explore Builds" primary CTA; ghost "Submit Your Build →" secondary
- [ ] Three preview cards overlap the bottom of the hero (`-mt-16`)
- [ ] Cards have red top border, Bebas Neue eyebrow in red, dark surface
- [ ] "Upcoming Shows" section: Bebas Neue header with red underline rule
- [ ] Event rows: dark cards with red month text, large day numeral
- [ ] "Latest Builds" section: Bebas Neue header, grid of vehicle tiles
- [ ] Footer: dark surface, Bebas Neue brand, red on hover
- [ ] At `<768px` (mobile): nav collapses to hamburger, hero headline reflows, triptych stacks

- [ ] **Step 5: Hard-refresh and check for regressions on other routes**

Navigate to `/events`, `/vehicles`, `/sign-in`, `/dashboard` (if signed in). These inherit the new palette via CSS variables. They don't need to look redesigned, but they should not be broken: no invisible text, no missing backgrounds, no JS errors in console.

If any page is visibly broken because it hardcoded amber or light-mode colors, note it in a follow-up issue — do not try to fix it in this plan (out of scope).

- [ ] **Step 6: Final commit (if any fixes were made during verification)**

If you made any fixes in step 5, commit them with a clear message. Otherwise, skip this step.

---

## Self-review checklist

After the last commit:

- Every spec requirement from `docs/specs/2026-04-11-showfield-visual-overhaul-design.md` is covered by at least one task in this plan ✓
- No placeholders, no "TODO", no "similar to Task N" ✓
- Types are consistent: `FeaturedBuild`, `PreviewEvent`, `PreviewBuild` are defined in Task 5/6 and imported in Task 12 ✓
- Font variable `--font-bebas-neue` is declared in Task 2 and consumed by the `--font-display` alias in Task 1 ✓
- `ActionCards` is referenced in Task 7 (deletion) and Task 12 (removed from page.tsx) — no dangling references ✓
- `ThemeToggle` is deleted in Task 3 and all references removed ✓
