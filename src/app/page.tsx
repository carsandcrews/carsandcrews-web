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
