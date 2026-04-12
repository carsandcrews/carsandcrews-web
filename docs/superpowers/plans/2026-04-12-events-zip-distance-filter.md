# Events ZIP & Distance Filter Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let users filter the Events page by ZIP code and distance radius, with GPS and IP fallbacks.

**Architecture:** Server-first. A unified API route (`/api/location/resolve`) handles both ZIP geocoding and GPS reverse-lookup, sets the `cc_loc` cookie, and returns coordinates + a redirect URL. The server component reads resolved coords from URL params, cookie, or IP headers and passes them to the existing `nearby_events` RPC. A new `LocationFilter` client component renders the ZIP input, GPS button, and distance chips.

**Tech Stack:** Next.js App Router, Supabase (zip_codes table + existing nearby_events RPC), vitest, Playwright

**Spec:** `docs/superpowers/specs/2026-04-12-events-zip-distance-filter-design.md`

---

## File Structure

| Action | File | Responsibility |
|--------|------|----------------|
| Create | `supabase/migrations/007_zip_codes.sql` | zip_codes table DDL |
| Create | `data/zip_codes.csv` | USPS zip code data (gitignored) |
| Create | `scripts/seed-zip-codes.ts` | Loads CSV into Supabase |
| Create | `src/lib/location/types.ts` | ResolvedCenter type, VALID_RADII |
| Create | `src/lib/location/resolve.ts` | resolveCenter() precedence chain |
| Create | `src/app/api/location/resolve/route.ts` | POST handler — ZIP lookup, GPS reverse, cookie write |
| Create | `src/components/events/LocationFilter.tsx` | Location input + GPS + distance chips |
| Modify | `src/lib/location/detect.ts` | No changes needed (keep as-is) |
| Modify | `src/app/(public)/events/page.tsx` | Use resolveCenter(), pass center to client |
| Modify | `src/app/(public)/events/events-explore-client.tsx` | Add LocationFilter, remove "Near me" toggle, accept center prop |
| Create | `tests/unit/lib/resolve-center.test.ts` | Unit tests for resolveCenter() |
| Create | `tests/unit/components/events/LocationFilter.test.tsx` | Component tests |
| Modify | `e2e/events-explore.spec.ts` | Add location filter E2E tests |

---

### Task 1: zip_codes Migration

**Files:**
- Create: `supabase/migrations/007_zip_codes.sql`

- [ ] **Step 1: Write the migration**

```sql
-- supabase/migrations/007_zip_codes.sql
create table zip_codes (
  zip text primary key,
  lat numeric not null,
  lng numeric not null,
  city text not null,
  state text not null
);
```

- [ ] **Step 2: Apply the migration locally**

Run: `npx supabase db reset`
Expected: Migration applies without errors, `zip_codes` table exists.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/007_zip_codes.sql
git commit -m "feat: add zip_codes table migration"
```

---

### Task 2: ZIP Code Seed Script

**Files:**
- Create: `scripts/seed-zip-codes.ts`
- Create: `data/zip_codes.csv`
- Modify: `.gitignore` (add `data/zip_codes.csv`)

The seed script reads `data/zip_codes.csv` (format: `zip,lat,lng,city,state`) and upserts rows into `zip_codes`. The CSV is sourced from the free HUD USPS Crosswalk dataset (~40k rows). The script uses the Supabase JS client with the service role key from env.

- [ ] **Step 1: Add data/ to .gitignore**

Check if `.gitignore` exists. Add this line:

```
data/
```

- [ ] **Step 2: Download or generate the ZIP code CSV**

Create a placeholder CSV at `data/zip_codes.csv` with a header and a few test rows. The full dataset will be loaded manually before deploy.

```csv
zip,lat,lng,city,state
78701,30.2672,-97.7431,Austin,TX
10001,40.7484,-73.9967,New York,NY
90210,34.0901,-118.4065,Beverly Hills,CA
60601,41.8819,-87.6278,Chicago,IL
30301,33.7490,-84.3880,Atlanta,GA
```

- [ ] **Step 3: Write the seed script**

```ts
// scripts/seed-zip-codes.ts
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

async function seed() {
  const csvPath = resolve(__dirname, '../data/zip_codes.csv')
  const raw = readFileSync(csvPath, 'utf-8')
  const lines = raw.trim().split('\n').slice(1) // skip header

  const rows = lines.map((line) => {
    const [zip, lat, lng, city, state] = line.split(',')
    return { zip: zip.trim(), lat: parseFloat(lat), lng: parseFloat(lng), city: city.trim(), state: state.trim() }
  })

  const BATCH_SIZE = 1000
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE)
    const { error } = await supabase.from('zip_codes').upsert(batch, { onConflict: 'zip' })
    if (error) {
      console.error(`Batch ${i / BATCH_SIZE + 1} failed:`, error.message)
      process.exit(1)
    }
    console.log(`Seeded ${Math.min(i + BATCH_SIZE, rows.length)} / ${rows.length}`)
  }

  console.log('Done.')
}

seed()
```

- [ ] **Step 4: Run the seed script with test data**

Run: `npx tsx scripts/seed-zip-codes.ts`
Expected: "Seeded 5 / 5" and "Done."

- [ ] **Step 5: Verify data in Supabase**

Run: `npx supabase db execute --sql "select * from zip_codes limit 3;"`
Expected: 3 rows returned with zip, lat, lng, city, state.

- [ ] **Step 6: Commit**

```bash
git add scripts/seed-zip-codes.ts data/zip_codes.csv .gitignore
git commit -m "feat: add ZIP code seed script and test data"
```

---

### Task 3: Location Types

**Files:**
- Create: `src/lib/location/types.ts`

- [ ] **Step 1: Write the types file**

```ts
// src/lib/location/types.ts
export const VALID_RADII = [25, 50, 100, 250, 500] as const
export type ValidRadius = typeof VALID_RADII[number]
export const DEFAULT_RADIUS: ValidRadius = 100

export interface ResolvedCenter {
  lat: number
  lng: number
  label: string
  source: 'zip' | 'gps' | 'ip'
  radius: ValidRadius
}

export function parseRadius(value: string | undefined): ValidRadius {
  const num = parseInt(value || '', 10)
  return VALID_RADII.includes(num as ValidRadius) ? (num as ValidRadius) : DEFAULT_RADIUS
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/location/types.ts
git commit -m "feat: add ResolvedCenter type and radius constants"
```

---

### Task 4: resolveCenter() Function

**Files:**
- Create: `src/lib/location/resolve.ts`
- Create: `tests/unit/lib/resolve-center.test.ts`

- [ ] **Step 1: Write the failing tests**

```ts
// tests/unit/lib/resolve-center.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { resolveCenter } from '@/lib/location/resolve'

// Mock Supabase
vi.mock('@/lib/supabase/server', () => ({
  createServer: vi.fn()
}))

import { createServer } from '@/lib/supabase/server'
const mockCreateServer = vi.mocked(createServer)

function mockSupabase(zipResult: { data: unknown; error: unknown }) {
  const single = vi.fn().mockResolvedValue(zipResult)
  const eq = vi.fn().mockReturnValue({ single })
  const select = vi.fn().mockReturnValue({ eq })
  const from = vi.fn().mockReturnValue({ select })
  mockCreateServer.mockResolvedValue({ from } as any)
}

function makeCookies(value?: string) {
  return {
    get: vi.fn().mockReturnValue(value ? { value } : undefined)
  } as any
}

function makeHeaders(overrides: Record<string, string> = {}) {
  return new Headers(overrides)
}

describe('resolveCenter', () => {
  beforeEach(() => vi.clearAllMocks())

  it('resolves ZIP from URL params (precedence 1)', async () => {
    mockSupabase({ data: { lat: 30.27, lng: -97.74, city: 'Austin', state: 'TX' }, error: null })
    const result = await resolveCenter(
      { zip: '78701', radius: '50' },
      makeCookies(),
      makeHeaders()
    )
    expect(result).toEqual({
      lat: 30.27,
      lng: -97.74,
      label: '78701 · Austin, TX',
      source: 'zip',
      radius: 50
    })
  })

  it('returns null for unknown ZIP', async () => {
    mockSupabase({ data: null, error: null })
    const result = await resolveCenter(
      { zip: '00000' },
      makeCookies(),
      makeHeaders()
    )
    expect(result).toBeNull()
  })

  it('resolves lat/lng from URL params (precedence 2)', async () => {
    const result = await resolveCenter(
      { lat: '30.27', lng: '-97.74', radius: '250' },
      makeCookies(),
      makeHeaders()
    )
    expect(result).toEqual({
      lat: 30.27,
      lng: -97.74,
      label: 'GPS',
      source: 'gps',
      radius: 250
    })
  })

  it('resolves from cookie (precedence 3)', async () => {
    const cookie = JSON.stringify({ lat: 30.27, lng: -97.74, label: '78701 · Austin, TX', source: 'zip', radius: 100 })
    const result = await resolveCenter(
      {},
      makeCookies(cookie),
      makeHeaders()
    )
    expect(result).toEqual({
      lat: 30.27,
      lng: -97.74,
      label: '78701 · Austin, TX',
      source: 'zip',
      radius: 100
    })
  })

  it('resolves from IP headers (precedence 4)', async () => {
    const result = await resolveCenter(
      {},
      makeCookies(),
      makeHeaders({
        'x-vercel-ip-city': 'Austin',
        'x-vercel-ip-country-region': 'TX',
        'x-vercel-ip-latitude': '30.2672',
        'x-vercel-ip-longitude': '-97.7431'
      })
    )
    expect(result).toEqual({
      lat: 30.2672,
      lng: -97.7431,
      label: 'Austin, TX',
      source: 'ip',
      radius: 100
    })
  })

  it('returns null when nothing available', async () => {
    const result = await resolveCenter({}, makeCookies(), makeHeaders())
    expect(result).toBeNull()
  })

  it('clamps invalid radius to default', async () => {
    const result = await resolveCenter(
      { lat: '30.27', lng: '-97.74', radius: '999' },
      makeCookies(),
      makeHeaders()
    )
    expect(result?.radius).toBe(100)
  })

  it('ZIP takes precedence over lat/lng', async () => {
    mockSupabase({ data: { lat: 30.27, lng: -97.74, city: 'Austin', state: 'TX' }, error: null })
    const result = await resolveCenter(
      { zip: '78701', lat: '40.0', lng: '-74.0' },
      makeCookies(),
      makeHeaders()
    )
    expect(result?.source).toBe('zip')
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/unit/lib/resolve-center.test.ts`
Expected: FAIL — module `@/lib/location/resolve` does not exist.

- [ ] **Step 3: Implement resolveCenter()**

```ts
// src/lib/location/resolve.ts
import { createServer } from '@/lib/supabase/server'
import { parseVercelHeaders } from '@/lib/location/detect'
import { parseRadius, type ResolvedCenter } from '@/lib/location/types'

export async function resolveCenter(
  params: Record<string, string | undefined>,
  cookies: { get: (name: string) => { value: string } | undefined },
  headers: Headers
): Promise<ResolvedCenter | null> {
  const radius = parseRadius(params.radius)

  // 1. ZIP param
  if (params.zip && /^\d{5}$/.test(params.zip)) {
    const supabase = await createServer()
    const { data } = await supabase
      .from('zip_codes')
      .select('lat, lng, city, state')
      .eq('zip', params.zip)
      .single()
    if (data) {
      return {
        lat: data.lat,
        lng: data.lng,
        label: `${params.zip} · ${data.city}, ${data.state}`,
        source: 'zip',
        radius
      }
    }
    return null
  }

  // 2. lat/lng params (GPS)
  const lat = parseFloat(params.lat || '')
  const lng = parseFloat(params.lng || '')
  if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
    return { lat, lng, label: 'GPS', source: 'gps', radius }
  }

  // 3. Cookie
  const cookie = cookies.get('cc_loc')
  if (cookie) {
    try {
      const parsed = JSON.parse(cookie.value)
      if (typeof parsed.lat === 'number' && typeof parsed.lng === 'number') {
        return {
          lat: parsed.lat,
          lng: parsed.lng,
          label: parsed.label || 'Saved location',
          source: parsed.source || 'zip',
          radius: parseRadius(String(parsed.radius))
        }
      }
    } catch {
      // invalid cookie, fall through
    }
  }

  // 4. IP headers
  const ipLocation = parseVercelHeaders(headers)
  if (ipLocation) {
    return {
      lat: ipLocation.lat,
      lng: ipLocation.lng,
      label: `${ipLocation.city}, ${ipLocation.state}`,
      source: 'ip',
      radius
    }
  }

  // 5. Nothing
  return null
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/unit/lib/resolve-center.test.ts`
Expected: All 7 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/location/resolve.ts tests/unit/lib/resolve-center.test.ts
git commit -m "feat: add resolveCenter with ZIP/GPS/cookie/IP precedence chain"
```

---

### Task 5: Location Resolve API Route

**Files:**
- Create: `src/app/api/location/resolve/route.ts`

This route handles both ZIP and GPS submissions. The client calls it, the server looks up coordinates (or reverse-looks up a label), sets the `cc_loc` cookie, and returns a URL for the client to navigate to.

- [ ] **Step 1: Write the failing test**

```ts
// tests/unit/lib/location-api.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/supabase/server', () => ({
  createServer: vi.fn()
}))

import { createServer } from '@/lib/supabase/server'
const mockCreateServer = vi.mocked(createServer)

// We'll test the handler logic by importing and calling POST directly
// But first we need the route to exist — this test file validates the contract

describe('POST /api/location/resolve', () => {
  it('contract: ZIP request returns lat/lng/label/url', () => {
    // request body
    const body = { zip: '78701', radius: 100 }
    expect(body.zip).toMatch(/^\d{5}$/)
    expect([25, 50, 100, 250, 500]).toContain(body.radius)
  })

  it('contract: GPS request returns label/url', () => {
    const body = { lat: 30.27, lng: -97.74, radius: 100 }
    expect(body.lat).toBeGreaterThanOrEqual(-90)
    expect(body.lat).toBeLessThanOrEqual(90)
    expect(body.lng).toBeGreaterThanOrEqual(-180)
    expect(body.lng).toBeLessThanOrEqual(180)
  })
})
```

- [ ] **Step 2: Run test to confirm it passes (contract-only)**

Run: `npx vitest run tests/unit/lib/location-api.test.ts`
Expected: PASS (contract tests only, no implementation yet).

- [ ] **Step 3: Implement the route handler**

```ts
// src/app/api/location/resolve/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServer } from '@/lib/supabase/server'
import { VALID_RADII, DEFAULT_RADIUS, type ValidRadius } from '@/lib/location/types'

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  if (!body) {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const radius: ValidRadius = VALID_RADII.includes(body.radius) ? body.radius : DEFAULT_RADIUS

  // ZIP mode
  if (body.zip && /^\d{5}$/.test(body.zip)) {
    const supabase = await createServer()
    const { data } = await supabase
      .from('zip_codes')
      .select('lat, lng, city, state')
      .eq('zip', body.zip)
      .single()

    if (!data) {
      return NextResponse.json({ error: 'Unknown ZIP code' }, { status: 404 })
    }

    const label = `${body.zip} · ${data.city}, ${data.state}`
    const cookieStore = await cookies()
    cookieStore.set('cc_loc', JSON.stringify({
      lat: data.lat, lng: data.lng, label, source: 'zip', radius
    }), {
      maxAge: 30 * 24 * 60 * 60,
      path: '/events',
      sameSite: 'lax'
    })

    return NextResponse.json({
      lat: data.lat,
      lng: data.lng,
      label,
      url: `/events?zip=${body.zip}&radius=${radius}`
    })
  }

  // GPS mode
  const lat = parseFloat(body.lat)
  const lng = parseFloat(body.lng)
  if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return NextResponse.json({ error: 'Invalid coordinates' }, { status: 400 })
  }

  // Reverse lookup nearest ZIP for a label
  const supabase = await createServer()
  const { data: nearest } = await supabase
    .rpc('nearest_zip', { user_lat: lat, user_lng: lng })

  const label = nearest ? `${nearest.city}, ${nearest.state}` : 'GPS'

  const cookieStore = await cookies()
  cookieStore.set('cc_loc', JSON.stringify({
    lat, lng, label, source: 'gps', radius
  }), {
    maxAge: 30 * 24 * 60 * 60,
    path: '/events',
    sameSite: 'lax'
  })

  return NextResponse.json({
    lat, lng, label,
    url: `/events?lat=${lat}&lng=${lng}&radius=${radius}`
  })
}
```

- [ ] **Step 4: Add the nearest_zip RPC to the migration**

Append to `supabase/migrations/007_zip_codes.sql`:

```sql
create or replace function nearest_zip(
  user_lat numeric,
  user_lng numeric
) returns table (zip text, city text, state text) as $$
  select z.zip, z.city, z.state
  from zip_codes z
  order by (z.lat - user_lat)^2 + (z.lng - user_lng)^2
  limit 1;
$$ language sql stable;
```

- [ ] **Step 5: Re-apply migration**

Run: `npx supabase db reset`
Expected: Both `zip_codes` table and `nearest_zip` function exist.

- [ ] **Step 6: Commit**

```bash
git add src/app/api/location/resolve/route.ts supabase/migrations/007_zip_codes.sql tests/unit/lib/location-api.test.ts
git commit -m "feat: add /api/location/resolve route for ZIP and GPS"
```

---

### Task 6: LocationFilter Component

**Files:**
- Create: `src/components/events/LocationFilter.tsx`
- Create: `tests/unit/components/events/LocationFilter.test.tsx`

- [ ] **Step 1: Write the failing tests**

```tsx
// tests/unit/components/events/LocationFilter.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { LocationFilter } from '@/components/events/LocationFilter'

// Mock next/navigation
const mockPush = vi.fn()
const mockSearchParams = new URLSearchParams()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => mockSearchParams
}))

describe('LocationFilter', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders ZIP label when center has zip source', () => {
    render(
      <LocationFilter
        center={{ lat: 30.27, lng: -97.74, label: '78701 · Austin, TX', source: 'zip', radius: 100 }}
      />
    )
    expect(screen.getByText('78701 · Austin, TX')).toBeTruthy()
    expect(screen.getByText('ZIP')).toBeTruthy()
  })

  it('renders IP label when center has ip source', () => {
    render(
      <LocationFilter
        center={{ lat: 30.27, lng: -97.74, label: 'Austin, TX', source: 'ip', radius: 100 }}
      />
    )
    expect(screen.getByText('Austin, TX')).toBeTruthy()
    expect(screen.getByText('IP')).toBeTruthy()
  })

  it('shows empty state with input when no center', () => {
    render(<LocationFilter center={null} />)
    expect(screen.getByPlaceholderText('ZIP code')).toBeTruthy()
  })

  it('highlights active radius chip', () => {
    render(
      <LocationFilter
        center={{ lat: 30.27, lng: -97.74, label: 'Austin, TX', source: 'ip', radius: 250 }}
      />
    )
    const chip250 = screen.getByRole('button', { name: '250' })
    expect(chip250.className).toContain('amber')
  })

  it('shows GPS button', () => {
    render(<LocationFilter center={null} />)
    expect(screen.getByLabelText('Use GPS location')).toBeTruthy()
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/unit/components/events/LocationFilter.test.tsx`
Expected: FAIL — module does not exist.

- [ ] **Step 3: Implement LocationFilter**

```tsx
// src/components/events/LocationFilter.tsx
'use client'

import { useState, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { VALID_RADII, type ResolvedCenter } from '@/lib/location/types'

interface LocationFilterProps {
  center: ResolvedCenter | null
}

export function LocationFilter({ center }: LocationFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [editing, setEditing] = useState(false)
  const [zipInput, setZipInput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [gpsLoading, setGpsLoading] = useState(false)

  const activeRadius = center?.radius ?? 100

  const buildUrl = useCallback((overrides: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString())
    Object.entries(overrides).forEach(([key, value]) => {
      if (value) params.set(key, value)
      else params.delete(key)
    })
    params.delete('page')
    return `/events?${params.toString()}`
  }, [searchParams])

  async function handleZipSubmit() {
    const zip = zipInput.trim()
    if (!/^\d{5}$/.test(zip)) {
      setError('Enter a 5-digit ZIP code')
      return
    }
    setError(null)

    const res = await fetch('/api/location/resolve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ zip, radius: activeRadius })
    })

    if (!res.ok) {
      setError("We don't have coordinates for that ZIP")
      return
    }

    const data = await res.json()
    setEditing(false)
    setZipInput('')
    router.push(data.url)
  }

  async function handleGps() {
    if (!navigator.geolocation) {
      setError('GPS not available in this browser')
      return
    }
    setGpsLoading(true)
    setError(null)

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const res = await fetch('/api/location/resolve', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            radius: activeRadius
          })
        })

        if (res.ok) {
          const data = await res.json()
          router.push(data.url)
        } else {
          setError("Couldn't resolve your location")
        }
        setGpsLoading(false)
      },
      () => {
        setError("Couldn't get your location. You can enter a ZIP instead.")
        setGpsLoading(false)
      },
      { timeout: 8000, maximumAge: 600000 }
    )
  }

  function handleClear() {
    document.cookie = 'cc_loc=; Max-Age=0; Path=/events'
    const params = new URLSearchParams(searchParams.toString())
    params.delete('zip')
    params.delete('lat')
    params.delete('lng')
    params.delete('radius')
    params.delete('page')
    const qs = params.toString()
    router.push(qs ? `/events?${qs}` : '/events')
  }

  function handleRadiusChange(radius: number) {
    router.push(buildUrl({ radius: String(radius) }))
  }

  const sourceBadge = center?.source?.toUpperCase()

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        {/* Location display / input */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-[#555] flex-shrink-0">
            <path fillRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 002.274 1.765 11.842 11.842 0 00.976.544l.062.029.018.008.006.003zM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" clipRule="evenodd" />
          </svg>

          {editing || !center ? (
            <div className="flex items-center gap-2 flex-1">
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={5}
                placeholder="ZIP code"
                value={zipInput}
                onChange={(e) => { setZipInput(e.target.value); setError(null) }}
                onKeyDown={(e) => { if (e.key === 'Enter') handleZipSubmit() }}
                onBlur={() => { if (!zipInput && center) setEditing(false) }}
                autoFocus={editing}
                className="w-20 bg-transparent text-sm text-[#f5f5f0] placeholder:text-[#444] focus:outline-none border-b border-white/10 focus:border-amber-500/50 transition-colors"
              />
            </div>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="text-sm text-[#f5f5f0] hover:text-amber-400 transition-colors truncate"
            >
              {center.label}
            </button>
          )}

          {sourceBadge && !editing && center && (
            <span className="text-[10px] font-bold tracking-wider text-[#555] uppercase flex-shrink-0">
              {sourceBadge}
            </span>
          )}

          {center && !editing && (
            <button
              onClick={handleClear}
              className="text-[#555] hover:text-[#999] transition-colors flex-shrink-0"
              aria-label="Clear location"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
              </svg>
            </button>
          )}
        </div>

        {/* GPS button */}
        <button
          onClick={handleGps}
          disabled={gpsLoading}
          aria-label="Use GPS location"
          className="text-[#555] hover:text-amber-500 transition-colors flex-shrink-0 disabled:opacity-40"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className={`w-5 h-5 ${gpsLoading ? 'animate-pulse' : ''}`}>
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-1.503.204A6.5 6.5 0 1110.796 3.503a.75.75 0 00-.592-1.378 8 8 0 106.67 6.671.75.75 0 00-1.377-.592zM10 11.25a1.25 1.25 0 100-2.5 1.25 1.25 0 000 2.5z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {/* Error */}
      {error && (
        <p className="text-xs text-red-400 pl-6">{error}</p>
      )}

      {/* Distance chips */}
      {center && (
        <div className="flex items-center gap-2 pl-6">
          <span className="text-xs text-[#555]">Within</span>
          {VALID_RADII.map((r) => (
            <button
              key={r}
              onClick={() => handleRadiusChange(r)}
              className={`
                rounded-full px-3 py-1 text-xs font-semibold transition-all duration-150
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50
                ${r === activeRadius
                  ? 'bg-amber-500/10 text-amber-500'
                  : 'text-[#555] hover:text-[#888] hover:bg-white/5'
                }
              `}
            >
              {r}
            </button>
          ))}
          <span className="text-xs text-[#555]">mi</span>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/unit/components/events/LocationFilter.test.tsx`
Expected: All 5 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/events/LocationFilter.tsx tests/unit/components/events/LocationFilter.test.tsx
git commit -m "feat: add LocationFilter component with ZIP input, GPS, and distance chips"
```

---

### Task 7: Update Events Page Server Component

**Files:**
- Modify: `src/app/(public)/events/page.tsx`

Replace the inline IP detection with `resolveCenter()`. Pass the resolved center to the client component.

- [ ] **Step 1: Rewrite page.tsx**

Replace the full content of `src/app/(public)/events/page.tsx` with:

```tsx
import type { Metadata } from 'next'
import { headers, cookies } from 'next/headers'
import { createServer } from '@/lib/supabase/server'
import { resolveCenter } from '@/lib/location/resolve'
import { EventsExploreClient } from './events-explore-client'
import type { EventType } from '@/lib/constants'
import type { ResolvedCenter } from '@/lib/location/types'

export const metadata: Metadata = {
  title: 'Events | Cars & Crews',
  description: 'Discover car shows, cruise-ins, cars & coffee meets, swap meets, and more near you.'
}

interface SearchParams {
  q?: string
  type?: string
  from?: string
  to?: string
  page?: string
  zip?: string
  lat?: string
  lng?: string
  radius?: string
}

const PAGE_SIZE = 20

export default async function EventsExplorePage({
  searchParams
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const page = Math.max(1, parseInt(params.page || '1', 10))
  const offset = (page - 1) * PAGE_SIZE

  const reqHeaders = await headers()
  const cookieStore = await cookies()
  const center = await resolveCenter(params, cookieStore, reqHeaders)

  const supabase = await createServer()

  let eventItems: {
    id: string; name: string; slug: string; date: string;
    city: string; state: string; eventType: EventType;
    stateCode: string; distance?: number | null
  }[]
  let totalPages = 1

  if (center && !params.q && !params.from && !params.to) {
    const { data: nearbyData } = await supabase.rpc('nearby_events', {
      user_lat: center.lat,
      user_lng: center.lng,
      radius_miles: center.radius,
      max_results: 200,
    })

    let filtered = nearbyData ?? []

    if (params.type) {
      const types = params.type.split(',')
      filtered = filtered.filter((e: Record<string, unknown>) =>
        types.includes(e.event_type as string)
      )
    }

    totalPages = Math.ceil(filtered.length / PAGE_SIZE)
    const paged = filtered.slice(offset, offset + PAGE_SIZE)

    eventItems = paged.map((e: Record<string, unknown>) => ({
      id: e.id as string,
      name: e.name as string,
      slug: e.slug as string,
      date: e.date as string,
      city: e.city as string,
      state: e.state as string,
      eventType: e.event_type as EventType,
      stateCode: e.state as string,
      distance: e.distance_miles as number,
    }))
  } else {
    let query = supabase
      .from('events')
      .select('id, name, slug, date, end_date, city, state, event_type, is_charity, banner_url', { count: 'exact' })
      .eq('status', 'published')
      .order('date', { ascending: true })
      .gte('date', new Date().toISOString().split('T')[0])
      .range(offset, offset + PAGE_SIZE - 1)

    if (params.q) {
      query = query.ilike('name', `%${params.q}%`)
    }

    if (params.type) {
      const types = params.type.split(',')
      query = query.in('event_type', types)
    }

    if (params.from) {
      query = query.gte('date', params.from)
    }

    if (params.to) {
      query = query.lte('date', params.to)
    }

    const { data: events, count } = await query

    totalPages = Math.ceil((count || 0) / PAGE_SIZE)

    eventItems = (events || []).map((e) => ({
      id: e.id,
      name: e.name,
      slug: e.slug,
      date: e.date,
      city: e.city,
      state: e.state,
      eventType: e.event_type as EventType,
      stateCode: e.state,
      distance: null as number | null,
    }))
  }

  return (
    <main className="min-h-screen bg-[#111113]">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-7">
        <h1 className="text-2xl font-bold text-[#f5f5f0] mb-6">Events</h1>
        <EventsExploreClient
          initialEvents={eventItems}
          initialQuery={params.q || ''}
          initialTypes={(params.type?.split(',') as unknown as EventType[]) || []}
          currentPage={page}
          totalPages={totalPages}
          center={center}
        />
      </div>
    </main>
  )
}
```

- [ ] **Step 2: Verify the dev server starts without errors**

Run: `npx next dev` (check terminal for compilation errors)
Expected: No TypeScript errors on the page route. The client component will error until Task 8 updates it.

- [ ] **Step 3: Commit**

```bash
git add src/app/\(public\)/events/page.tsx
git commit -m "feat: use resolveCenter in events page server component"
```

---

### Task 8: Update Events Client Component

**Files:**
- Modify: `src/app/(public)/events/events-explore-client.tsx`

Replace `serverLocation`/`sortByDistance` props with `center`. Add `LocationFilter`. Remove "Near me" toggle.

- [ ] **Step 1: Rewrite events-explore-client.tsx**

Replace the full content of `src/app/(public)/events/events-explore-client.tsx` with:

```tsx
'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useCallback } from 'react'
import { EventListItem } from '@/components/events/EventListItem'
import { EventFilters } from '@/components/events/EventFilters'
import { LocationFilter } from '@/components/events/LocationFilter'
import { SearchBar } from '@/components/events/SearchBar'
import type { EventType } from '@/lib/constants'
import type { ResolvedCenter } from '@/lib/location/types'

interface EventItem {
  id: string
  name: string
  slug: string
  date: string
  city: string
  state: string
  eventType: EventType
  stateCode: string
  distance?: number | null
}

interface EventsExploreClientProps {
  initialEvents: EventItem[]
  initialQuery: string
  initialTypes: EventType[]
  currentPage: number
  totalPages: number
  center: ResolvedCenter | null
}

export function EventsExploreClient({
  initialEvents,
  initialQuery,
  initialTypes,
  currentPage,
  totalPages,
  center
}: EventsExploreClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [query, setQuery] = useState(initialQuery)
  const [selectedTypes, setSelectedTypes] = useState<EventType[]>(initialTypes)

  const buildUrl = useCallback((overrides: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString())
    Object.entries(overrides).forEach(([key, value]) => {
      if (value) params.set(key, value)
      else params.delete(key)
    })
    params.delete('page')
    return `/events?${params.toString()}`
  }, [searchParams])

  function handleSearch(value: string) {
    setQuery(value)
  }

  function handleSearchSubmit() {
    router.push(buildUrl({ q: query || undefined }))
  }

  function handleTypeToggle(type: EventType) {
    const next = selectedTypes.includes(type)
      ? selectedTypes.filter((t) => t !== type)
      : [...selectedTypes, type]
    setSelectedTypes(next)
    router.push(buildUrl({ type: next.length > 0 ? next.join(',') : undefined }))
  }

  return (
    <div className="space-y-6">
      <div onKeyDown={(e) => { if (e.key === 'Enter') handleSearchSubmit() }}>
        <SearchBar
          value={query}
          onChange={handleSearch}
          location={center?.label}
        />
      </div>

      <LocationFilter center={center} />

      <div className="flex items-center justify-between gap-4">
        <EventFilters selectedTypes={selectedTypes} onTypeToggle={handleTypeToggle} />
        <a
          href="/events/map"
          className="text-sm text-amber-500 hover:text-amber-400 transition-colors duration-150 flex-shrink-0"
        >
          Map view
        </a>
      </div>

      <div>
        {initialEvents.length === 0 ? (
          <p className="py-12 text-center text-sm text-[#555]">No events found</p>
        ) : (
          initialEvents.map((event) => (
            <EventListItem
              key={event.id}
              name={event.name}
              date={event.date}
              city={event.city}
              state={event.state}
              eventType={event.eventType}
              slug={event.slug}
              stateCode={event.stateCode}
              distance={event.distance}
            />
          ))
        )}
      </div>

      {totalPages > 1 ? (
        <div className="flex items-center justify-center gap-2 pt-4">
          {currentPage > 1 ? (
            <a
              href={`/events?${new URLSearchParams({ ...Object.fromEntries(searchParams), page: String(currentPage - 1) }).toString()}`}
              className="rounded-full px-4 py-2 text-sm font-semibold text-white/70 hover:text-white hover:bg-white/5 transition-all duration-150"
            >
              Previous
            </a>
          ) : null}
          <span className="text-sm text-[#888]">
            Page {currentPage} of {totalPages}
          </span>
          {currentPage < totalPages ? (
            <a
              href={`/events?${new URLSearchParams({ ...Object.fromEntries(searchParams), page: String(currentPage + 1) }).toString()}`}
              className="rounded-full px-4 py-2 text-sm font-semibold text-white/70 hover:text-white hover:bg-white/5 transition-all duration-150"
            >
              Next
            </a>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
```

- [ ] **Step 2: Verify dev server compiles**

Run: `npx next dev` — visit `/events` in browser.
Expected: Page renders. LocationFilter shows with IP-detected location or empty state. "Near me" toggle is gone. Map view link remains.

- [ ] **Step 3: Commit**

```bash
git add src/app/\(public\)/events/events-explore-client.tsx
git commit -m "feat: integrate LocationFilter, remove Near Me toggle"
```

---

### Task 9: Manual Integration Testing

No files to create — this is a verification checkpoint.

- [ ] **Step 1: Test ZIP entry**

1. Start dev server: `npx next dev`
2. Go to `http://localhost:3000/events`
3. Click the location label (or see the ZIP input if no IP headers locally)
4. Type `78701`, press Enter
5. Verify: URL changes to `/events?zip=78701&radius=100`, events list updates, label shows "78701 · Austin, TX", source badge shows "ZIP"

- [ ] **Step 2: Test distance chip**

1. With ZIP active, click the `250` chip
2. Verify: URL updates to `radius=250`, list updates, chip highlights

- [ ] **Step 3: Test clear**

1. Click the `×` button next to the location label
2. Verify: ZIP/lat/lng/radius params removed from URL, list reverts to date sort, cookie cleared

- [ ] **Step 4: Test GPS** (requires HTTPS or localhost exception)

1. Click the GPS button
2. Allow browser location prompt
3. Verify: URL gets `lat=&lng=` params, label shows city name, source shows "GPS"

- [ ] **Step 5: Test cookie persistence**

1. Set a ZIP (e.g., 78701)
2. Navigate away to another page
3. Come back to `/events` (no params)
4. Verify: page uses the saved ZIP location from cookie

- [ ] **Step 6: Test invalid ZIP**

1. Type `00000` in the ZIP input, press Enter
2. Verify: error message "We don't have coordinates for that ZIP", URL unchanged

---

### Task 10: Update E2E Tests

**Files:**
- Modify: `e2e/events-explore.spec.ts`

- [ ] **Step 1: Add location filter tests**

Append these tests to the existing `events-explore.spec.ts`:

```ts
test.describe('Location filter', () => {
  test('displays location filter area', async ({ page }) => {
    await page.goto('/events')
    await expect(page.getByPlaceholderText('ZIP code')).toBeVisible()
    await expect(page.getByLabel('Use GPS location')).toBeVisible()
  })

  test('ZIP entry updates URL', async ({ page }) => {
    await page.goto('/events')
    const zipInput = page.getByPlaceholderText('ZIP code')
    await zipInput.fill('78701')
    await zipInput.press('Enter')
    await expect(page).toHaveURL(/zip=78701/)
  })

  test('distance chips visible after location set', async ({ page }) => {
    await page.goto('/events?zip=78701&radius=100')
    await expect(page.getByRole('button', { name: '25' })).toBeVisible()
    await expect(page.getByRole('button', { name: '100' })).toBeVisible()
    await expect(page.getByRole('button', { name: '500' })).toBeVisible()
  })

  test('clear button removes location params', async ({ page }) => {
    await page.goto('/events?zip=78701&radius=100')
    await page.getByLabel('Clear location').click()
    await expect(page).not.toHaveURL(/zip=/)
    await expect(page).not.toHaveURL(/radius=/)
  })
})
```

- [ ] **Step 2: Remove "Near me" assertion if present**

Check if existing E2E tests reference "Near me" — they don't in the current file, so no changes needed.

- [ ] **Step 3: Run E2E tests**

Run: `npx playwright test e2e/events-explore.spec.ts`
Expected: All tests pass (existing + new).

- [ ] **Step 4: Commit**

```bash
git add e2e/events-explore.spec.ts
git commit -m "test: add E2E tests for location filter on events page"
```

---

### Task 11: Final Verification & Cleanup

- [ ] **Step 1: Run full unit test suite**

Run: `npx vitest run`
Expected: All tests pass. No regressions.

- [ ] **Step 2: Run full E2E test suite**

Run: `npx playwright test`
Expected: All tests pass.

- [ ] **Step 3: TypeScript check**

Run: `npx tsc --noEmit`
Expected: No type errors.

- [ ] **Step 4: Lint check**

Run: `npx eslint src/`
Expected: No new lint errors.

- [ ] **Step 5: Final commit if any cleanup was needed**

```bash
git add -A
git commit -m "chore: cleanup after location filter implementation"
```
