import { createServer } from '@/lib/supabase/server'
import { VehiclesExploreClient } from './vehicles-explore-client'
import type { VehicleStatusTag } from '@/lib/constants'

interface PageProps {
  searchParams: Promise<Record<string, string | undefined>>
}

const PAGE_SIZE = 24

function getEraRange(era: string): [number, number] | null {
  if (era === 'pre-1950') return [1886, 1949]
  const decade = parseInt(era)
  if (!isNaN(decade)) return [decade, decade + 9]
  return null
}

export default async function VehiclesExplorePage({ searchParams }: PageProps) {
  const params = await searchParams
  const make = params.make || ''
  const era = params.era || ''
  const status = params.status || ''
  const page = Math.max(1, parseInt(params.page || '1'))

  const supabase = await createServer()
  let query = supabase
    .from('vehicles')
    .select('id, year, make, model, status_tag, slug, vehicle_photos(url, thumbnail_url, position), owner:profiles!owner_id(username, display_name)', { count: 'exact' })
    .eq('visibility', 'public')
    .order('created_at', { ascending: false })

  if (make) query = query.ilike('make', make)
  if (status) query = query.eq('status_tag', status)

  const eraRange = era ? getEraRange(era) : null
  if (eraRange) {
    query = query.gte('year', eraRange[0]).lte('year', eraRange[1])
  }

  const from = (page - 1) * PAGE_SIZE
  query = query.range(from, from + PAGE_SIZE - 1)

  const { data, count } = await query

  const vehicles = (data || []).map((v: Record<string, unknown>) => {
    const photos = (v.vehicle_photos as Array<{ url: string; thumbnail_url: string | null; position: number }>) || []
    const hero = photos.sort((a, b) => a.position - b.position)[0]
    const owner = v.owner as { username: string; display_name: string } | null
    return {
      id: v.id as string,
      year: v.year as number,
      make: v.make as string,
      model: v.model as string,
      statusTag: v.status_tag as VehicleStatusTag,
      slug: v.slug as string,
      photoUrl: hero?.thumbnail_url || hero?.url || null,
      ownerName: owner?.display_name || 'Unknown',
      ownerUsername: owner?.username || ''
    }
  })

  const totalPages = Math.ceil((count || 0) / PAGE_SIZE)

  return (
    <main className="min-h-screen bg-[#111113]">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-7">
        <h1 className="mb-6 text-2xl font-bold text-[#f5f5f0]">Explore Vehicles</h1>
        <VehiclesExploreClient
          initialVehicles={vehicles}
          initialMake={make}
          initialEra={era}
          initialStatus={status}
          currentPage={page}
          totalPages={totalPages}
        />
      </div>
    </main>
  )
}
