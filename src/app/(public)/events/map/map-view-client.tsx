'use client'

import dynamic from 'next/dynamic'
import type { MapMarker } from '@/lib/maps/cluster'

const EventMap = dynamic(
  () => import('@/components/maps/EventMap').then((mod) => mod.EventMap),
  { ssr: false, loading: () => <div className="h-[70vh] rounded-xl bg-[#1a1a1d] animate-pulse" /> }
)

interface MapViewClientProps {
  markers: MapMarker[]
}

export function MapViewClient({ markers }: MapViewClientProps) {
  return (
    <div className="h-[70vh] rounded-xl overflow-hidden">
      <EventMap markers={markers} />
    </div>
  )
}
