import { createServer } from '@/lib/supabase/server'
import { FeaturedStrip } from '@/components/landing/FeaturedStrip'
import { SearchBarLanding } from '@/components/landing/SearchBarLanding'
import { LandingFeed } from '@/components/landing/LandingFeed'

export default async function HomePage() {
  const supabase = await createServer()

  // Fetch upcoming events (next 30 days, ordered by date)
  const today = new Date().toISOString().split('T')[0]
  const thirtyDays = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]

  const [eventsRes, vehiclesRes, membersRes] = await Promise.all([
    supabase
      .from('events')
      .select('name, date, city, state, event_type, slug, state_code, banner_url, status')
      .eq('status', 'published')
      .gte('date', today)
      .lte('date', thirtyDays)
      .order('date', { ascending: true })
      .limit(8),
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

  const events = (eventsRes.data ?? []).map((e) => ({
    name: e.name,
    date: e.date,
    city: e.city,
    state: e.state,
    event_type: e.event_type,
    slug: e.slug,
    state_code: e.state_code,
  }))

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
        stateCode: events[0].state_code,
        bannerUrl: (eventsRes.data?.[0] as Record<string, unknown>)?.banner_url as string | null,
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

  return (
    <div className="mx-auto w-full max-w-3xl">
      <FeaturedStrip event={featuredEvent} vehicle={featuredVehicle} />
      <SearchBarLanding />
      <LandingFeed events={events} vehicles={vehicles} members={members} />
    </div>
  )
}
