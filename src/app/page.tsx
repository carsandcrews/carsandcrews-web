import { headers } from 'next/headers'
import { createServer } from '@/lib/supabase/server'
import { US_STATES, type EventType } from '@/lib/constants'
import { parseVercelHeaders } from '@/lib/location/detect'
import { FeaturedStrip } from '@/components/landing/FeaturedStrip'
import { SearchBarLanding } from '@/components/landing/SearchBarLanding'
import { LandingFeed } from '@/components/landing/LandingFeed'

function stateToCode(state: string): string {
  const found = US_STATES.find(s => s.name.toLowerCase() === state.toLowerCase() || s.code.toLowerCase() === state.toLowerCase())
  return found ? found.code.toLowerCase() : state.toLowerCase().replace(/\s+/g, '-')
}

export default async function HomePage() {
  const supabase = await createServer()
  const reqHeaders = await headers()
  const location = parseVercelHeaders(reqHeaders)

  // Fetch upcoming events — use nearby_events RPC if location available, else fallback
  const today = new Date().toISOString().split('T')[0]
  const thirtyDays = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]

  let events: { name: string; date: string; city: string; state: string; event_type: EventType; slug: string; state_code: string; distance_miles?: number | null }[]

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
      // No nearby events — fall back to standard query
      events = await fetchFallbackEvents(supabase, today, thirtyDays)
    }
  } else {
    events = await fetchFallbackEvents(supabase, today, thirtyDays)
  }

  const [vehiclesRes, membersRes] = await Promise.all([
    supabase
      .from('vehicles')
      .select('year, make, model, slug, photo_url, profiles(username)')
      .order('created_at', { ascending: false })
      .limit(6),
    supabase
      .from('profiles')
      .select('username, display_name, avatar_url, tagline')
      .order('created_at', { ascending: false })
      .limit(4),
  ])

  const vehicles = (vehiclesRes.data ?? []).map((v: Record<string, unknown>) => ({
    year: v.year as number,
    make: v.make as string,
    model: v.model as string,
    slug: v.slug as string,
    photo_url: (v.photo_url as string) || null,
    owner_name: ((v.profiles as Record<string, string>)?.username as string) || 'unknown',
  }))

  const members = (membersRes.data ?? []).map((m) => ({
    username: m.username,
    display_name: m.display_name,
    avatar_url: m.avatar_url,
    tagline: m.tagline,
  }))

  // Featured: first event with a banner, or first event
  const featuredEvent = events.length > 0
    ? {
        name: events[0].name,
        date: events[0].date,
        city: events[0].city,
        state: events[0].state,
        slug: events[0].slug,
        stateCode: stateToCode(events[0].state),
        bannerUrl: null as string | null,
      }
    : null

  const featuredVehicle = vehicles.length > 0
    ? {
        year: vehicles[0].year,
        make: vehicles[0].make,
        model: vehicles[0].model,
        slug: vehicles[0].slug,
        photoUrl: vehicles[0].photo_url,
        ownerName: vehicles[0].owner_name,
        statusTag: 'Restored',
      }
    : null

  const locationStr = location ? `${location.city}, ${location.state}` : null

  return (
    <div className="mx-auto w-full max-w-3xl">
      <FeaturedStrip event={featuredEvent} vehicle={featuredVehicle} />
      <SearchBarLanding location={locationStr} />
      <LandingFeed events={events} vehicles={vehicles} members={members} />
    </div>
  )
}

async function fetchFallbackEvents(supabase: Awaited<ReturnType<typeof createServer>>, today: string, thirtyDays: string) {
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
