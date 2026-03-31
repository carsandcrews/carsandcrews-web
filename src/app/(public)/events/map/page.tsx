import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { parseVercelHeaders } from '@/lib/location/detect'
import { MapViewClient } from './map-view-client'

export const metadata: Metadata = {
  title: 'Event Map | Cars & Crews',
  description: 'Find car shows, cruise-ins, and automotive events near you on the map.'
}

export default async function MapPage() {
  const hdrs = await headers()
  const location = parseVercelHeaders(hdrs)

  return (
    <main className="min-h-screen bg-bg">
      <MapViewClient
        initialLat={location?.lat ?? null}
        initialLng={location?.lng ?? null}
        initialCity={location?.city ?? null}
        initialState={location?.state ?? null}
      />
    </main>
  )
}
