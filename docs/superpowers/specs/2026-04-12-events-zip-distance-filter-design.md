# Events: ZIP Code & Distance Filter

**Date:** 2026-04-12
**Scope:** `/events` page only (vehicles deferred)

## Summary

Replace the auto-detected "Near me" toggle on the Events page with an explicit location filter. Users can set their center via GPS, IP detection, or manual ZIP code entry, then choose a distance radius from preset chips. The server resolves the center on every request, passes it to the existing `nearby_events` RPC, and renders the list sorted by distance.

## Location sources (precedence order)

1. **URL `zip` param** — 5-digit ZIP, resolved via `zip_codes` table lookup
2. **URL `lat`/`lng` params** — GPS-originated coordinates
3. **`cc_loc` cookie** — persisted from last explicit user choice
4. **Vercel IP headers** — existing `parseVercelHeaders()` behavior
5. **null** — no center, list sorted by date ascending

If both `zip` and `lat/lng` are present, `zip` wins and `lat/lng` are stripped.

## URL params

| Param    | Example              | Notes                                    |
|----------|----------------------|------------------------------------------|
| `zip`    | `78701`              | 5-digit string. Exclusive with `lat/lng` |
| `lat`    | `30.267`             | GPS only. Paired with `lng`              |
| `lng`    | `-97.743`            | GPS only. Paired with `lat`              |
| `radius` | `100`                | 25/50/100/250/500. Default 100           |
| `q`      | `mustang`            | Existing — search term                   |
| `type`   | `car_show,cruise_in` | Existing — event type filter             |
| `page`   | `2`                  | Existing — pagination                    |
| `from`   | `2026-05-01`         | Existing — date range start              |
| `to`     | `2026-06-01`         | Existing — date range end                |

The `sort` param is removed. Distance sort is implicit when a center is active; date sort is the fallback when no center exists.

## Cookie: `cc_loc`

```json
{"lat":30.267,"lng":-97.743,"label":"78701 - Austin, TX","source":"zip","radius":100}
```

- **Written** only on explicit user action (ZIP entry or GPS), never from IP detection
- `Max-Age`: 30 days
- `Path`: `/events`
- `SameSite`: `Lax`
- `HttpOnly`: false (client reads the label for instant display)
- **Cleared** when user clicks the clear button

## Database: `zip_codes` table

**Migration: `007_zip_codes.sql`**

```sql
create table zip_codes (
  zip text primary key,
  lat numeric not null,
  lng numeric not null,
  city text not null,
  state text not null  -- 2-letter code
);
```

~40k rows loaded from HUD/USPS crosswalk CSV via `scripts/seed-zip-codes.ts`. The CSV is stored at `data/zip_codes.csv` and gitignored.

## Server resolution: `src/lib/location/resolve.ts`

```ts
interface ResolvedCenter {
  lat: number
  lng: number
  label: string       // "78701 - Austin, TX" or "GPS" or "Austin, TX"
  source: 'zip' | 'gps' | 'ip'
  radius: number      // validated to 25/50/100/250/500
  setCookie: boolean   // true for ZIP and GPS sources
}

function resolveCenter(
  searchParams: Record<string, string | undefined>,
  cookies: RequestCookies,
  headers: Headers
): Promise<ResolvedCenter | null>
```

Walks the precedence chain. ZIP resolution is a single PK lookup on `zip_codes`. Returns `null` if no location can be determined.

## Changes to existing `nearby_events` RPC

None. The RPC already accepts `radius_miles` and `max_results`. The events page currently hardcodes `radius_miles: 500` — this changes to pass the user's chosen radius. `max_results` stays at 200.

## Changes to `page.tsx`

The `EventsExplorePage` server component replaces the inline IP detection block with:

1. Call `resolveCenter(params, cookies, headers)`
2. If resolved: call `nearby_events` with `center.lat`, `center.lng`, `center.radius`
3. If null: fall back to existing date-sorted Supabase query
4. If `center.setCookie`: write `cc_loc` cookie (mechanism TBD per Next.js version — Server Action, middleware, or `cookies().set()` if supported during render)
5. Pass `center` (or null) and `radius` to `EventsExploreClient`

## GPS API endpoint: `POST /api/location/gps`

**Route:** `src/app/api/location/gps/route.ts`

**Request:**
```json
{ "lat": 30.267, "lng": -97.743, "radius": 100 }
```

**Behavior:**
1. Validate lat (-90..90), lng (-180..180), radius (must be one of 25/50/100/250/500)
2. Reverse-lookup nearest `zip_codes` row for a city/state label
3. Set `cc_loc` cookie
4. Return `{ url: "/events?lat=30.267&lng=-97.743&radius=100", label: "Austin, TX" }`

**Errors:** Invalid body returns 400 with `{ error: "Invalid coordinates" }`.

## UI: `LocationFilter` component

**File:** `src/components/events/LocationFilter.tsx`

**Props:**
```ts
interface LocationFilterProps {
  center: ResolvedCenter | null
  radius: number
}
```

**Layout:**
```
┌─ Location row ─────────────────────────────────────┐
│ 📍 78701 - Austin, TX          [×]       🎯 GPS   │
│ Within: [25] [50] (100) [250] [500] mi             │
└────────────────────────────────────────────────────┘
```

**Behavior:**
- Displays resolved center with source indicator (IP/GPS/ZIP) as a small badge
- Click label to edit → becomes a text input for 5-digit ZIP
- On Enter with valid ZIP: `router.push('/events?zip=…&radius=…')`
- `x` clear: `router.push('/events')`, clears cookie
- GPS button: calls `navigator.geolocation`, POSTs to `/api/location/gps`, then `router.push(response.url)`
- Distance chips: single-select pills matching existing amber pill style. Click updates `radius` param.

**Error states:**
- Unknown ZIP: input shakes red, helper text "We don't have coordinates for that ZIP"
- GPS denied/timeout: inline message "Couldn't get your location. You can enter a ZIP instead."

**Removed:** The existing "Near me" toggle button. Its behavior is now implicit.

## Mobile considerations

- Location row stacks above type chips
- Distance chips scroll horizontally if needed (matches existing chip patterns)
- ZIP input is tap-friendly with standard mobile keyboard

## Testing

### Unit tests (vitest)

- `resolveCenter()` — each precedence level, invalid ZIP, radius clamping
- `LocationFilter` — render states, ZIP submission, clear, chip selection
- GPS endpoint — valid/invalid bodies, cookie setting

### Integration tests (playwright)

- `/events?zip=78701&radius=50` — list renders with distances, correct UI state
- Type new ZIP → URL changes, list updates
- Clear → date-sorted fallback
- Invalid ZIP → error state, URL unchanged
- GPS via `context.setGeolocation()` + `grantPermissions`

### Manual test checklist

- GPS prompt → location resolves → list updates
- Cookie persistence: set ZIP, close tab, reopen `/events` → same center
- Clear → fresh visit uses IP
- Mobile layout: chips scroll, input is tappable
- `/events/map` works independently (no regression)

## Out of scope

- Vehicles page (separate spec)
- City/state free-text (future: add Mapbox geocoding)
- Rate limiting on GPS endpoint
- `zip_codes` data accuracy validation
