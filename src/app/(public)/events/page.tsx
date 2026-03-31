import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { createServer } from '@/lib/supabase/server'
import { parseVercelHeaders } from '@/lib/location/detect'
import { EventsExploreClient } from './events-explore-client'
import type { EventType } from '@/lib/constants'

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
  sort?: string
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

  const supabase = await createServer()
  const reqHeaders = await headers()
  const location = parseVercelHeaders(reqHeaders)

  const sortByDistance = location && params.sort !== 'date'

  let eventItems: { id: string; name: string; slug: string; date: string; city: string; state: string; eventType: EventType; stateCode: string; distance?: number | null }[]
  let totalPages = 1

  if (sortByDistance && !params.q && !params.from && !params.to) {
    // Use RPC for nearby events — supports distance sorting
    const { data: nearbyData } = await supabase.rpc('nearby_events', {
      user_lat: location.lat,
      user_lng: location.lng,
      radius_miles: 500,
      max_results: 200,
    })

    let filtered = nearbyData ?? []

    if (params.type) {
      const types = params.type.split(',')
      filtered = filtered.filter((e: Record<string, unknown>) => types.includes(e.event_type as string))
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
    // Standard query — no location or explicit date sort or search active
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

  const locationStr = location ? `${location.city}, ${location.state}` : null

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
          serverLocation={locationStr}
          sortByDistance={!!sortByDistance}
        />
      </div>
    </main>
  )
}
