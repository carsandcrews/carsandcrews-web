# Cars & Crews — Conventions

Living document. Update as decisions are made during implementation.

---

## Color System: Warm Amber + Charcoal

### Dark Mode (default)
| Token | Value | Usage |
|---|---|---|
| `accent` | `#f59e0b` | Primary actions, active states, highlights |
| `accent-hover` | `#d97706` | Hover state for accent elements |
| `bg` | `#111113` | Page background (warm charcoal) |
| `surface` | `#1a1a1d` | Cards, elevated surfaces |
| `text` | `#f5f5f0` | Primary text (warm off-white) |
| `text-muted` | `#888888` | Secondary text |
| `text-faint` | `#555555` | Tertiary text, inactive tabs |
| `border` | `rgba(255,255,255,0.05)` | Dividers, hairlines |

### Light Mode
| Token | Value | Usage |
|---|---|---|
| `accent` | `#f59e0b` | Primary actions (same as dark) |
| `accent-hover` | `#d97706` | Hover state |
| `accent-text` | `#92400e` | Accent used as text (darkened for contrast) |
| `bg` | `#faf9f6` | Page background (warm off-white) |
| `surface` | `#ffffff` | Cards, elevated surfaces |
| `text` | `#1a1a18` | Primary text |
| `text-muted` | `#888888` | Secondary text |
| `text-faint` | `#aaaaaa` | Tertiary text, inactive tabs |
| `border` | `rgba(0,0,0,0.06)` | Dividers, hairlines |

---

## Design Principles (Quick Reference)

1. **Cards are earned** — Only photos and featured content get card containers. List items use typography + spacing + hairline dividers.
2. **Consistent interaction feedback** — Every interactive element needs: hover state (desktop), active/pressed state, focus-visible ring, loading state where applicable. Define once, reuse everywhere.
3. **Pill shapes for interactive elements** — Buttons, tabs, filter chips, search bar use rounded-full / high border-radius. Consistent across the site.
4. **Photo containers** — Fixed aspect-ratio with `object-fit: cover`. Bottom gradient overlay for text. Inner `box-shadow: inset` vignette to normalize mixed-quality uploads.
5. **No vanity metrics** — No standalone count boxes. Contextual numbers on listings are fine ("64 going").
6. **Responsive breakpoints** — Test every page at: 375px (phone), 768px (tablet), 1024px (small desktop), 1440px (desktop).

---

## Component Patterns

### Buttons
- `primary` — Accent background, black text, pill shape
- `secondary` — Subtle background (`white/5` dark, `black/5` light), border, pill shape
- `ghost` — No background, text only, hover reveals background
- All buttons: `transition-all duration-150`, `focus-visible:ring-2`

### Transitions
- Default: `150ms` for interactive feedback (hover, active)
- Content changes: `200ms` for appearing/disappearing content
- Never exceed `300ms` — keep everything snappy

### Spacing
- Use Tailwind's scale. Prefer `gap` over margins for flex/grid layouts.
- Page padding: `px-4` mobile, `px-6` tablet, `px-7` desktop (28px matches mockups)

---

## File Naming

- Components: PascalCase (`EventCard.tsx`, `PhotoUpload.tsx`)
- Utilities/hooks: camelCase (`useLocation.ts`, `formatEventDate.ts`)
- Route files: `page.tsx`, `layout.tsx`, `route.ts` (Next.js convention)
- Tests mirror source: `src/components/events/EventCard.tsx` → `tests/unit/components/events/EventCard.test.tsx`

---

## Testing Conventions

- **Unit tests:** Vitest + Testing Library. Test behavior, not implementation.
- **Integration tests:** Vitest. Test API routes and database operations.
- **E2E tests:** Playwright. Test critical user flows end-to-end.
- **Naming:** `describe('ComponentName')` or `describe('functionName')`. Test names should read as sentences: `it('renders RSVP button for published events')`.
- **Mocking:** Mock external services (Supabase, R2), not internal modules. Prefer dependency injection over `vi.mock` where possible.
- **No feature is complete without tests.** This is a hard gate.

---

## Git Conventions

- Commit style: `type: short description` (feat, fix, test, ci, refactor, docs)
- Branch naming: `feat/event-detail`, `fix/photo-upload-resize`
- PRs: tests must pass before merge (CI gate)

---

## URL Slugs

- Generated from names: lowercase, alphanumeric + hyphens, max 60 chars, no trailing hyphens
- Must be unique per table (enforced by DB constraint)
- User slugs: validated against reserved words (events, vehicles, admin, settings, dashboard, sign-in, sign-up, map)
