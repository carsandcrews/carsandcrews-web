import type { Metadata } from 'next'
import { createServer } from '@/lib/supabase/server'
import { clusterEvents, type MapEvent } from '@/lib/maps/cluster'
import { MapViewClient } from './map-view-client'

export const metadata: Metadata = {
  title: 'Event Map | Cars & Crews',
  description: 'Find car shows, cruise-ins, and automotive events near you on the map.'
}

export default async function MapPage() {
  const supabase = await createServer()
  const { data: events } = await supabase
    .from('events')
    .select('id, name, slug, date, city, state, event_type, lat, lng')
    .eq('status', 'published')
    .gte('date', new Date().toISOString().split('T')[0])
    .not('lat', 'is', null)
    .not('lng', 'is', null)
    .order('date', { ascending: true })
    .limit(500)

  const mapEvents: MapEvent[] = (events || []).map((e) => ({
    id: e.id,
    name: e.name,
    lat: e.lat,
    lng: e.lng,
    slug: e.slug,
    state: e.state,
    eventType: e.event_type,
    date: e.date
  }))

  const markers = clusterEvents(mapEvents)

  return (
    <main className="min-h-screen bg-[#111113]">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-7">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-[#f5f5f0]">Event Map</h1>
          <a
            href="/events"
            className="text-sm text-amber-500 hover:text-amber-400 transition-colors duration-150"
          >
            List view
          </a>
        </div>
        <MapViewClient markers={markers} />
      </div>
    </main>
  )
}
