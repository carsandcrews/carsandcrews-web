import type { EventType } from '@/lib/constants'

export interface MapEvent {
  id: string
  name: string
  lat: number | null
  lng: number | null
  slug: string
  state: string
  eventType: EventType | string
  date: string
}

export interface MapMarker {
  id: string
  name: string
  lat: number
  lng: number
  slug: string
  state: string
  eventType: string
  date: string
}

export function clusterEvents(events: MapEvent[]): MapMarker[] {
  return events
    .filter((e): e is MapEvent & { lat: number; lng: number } =>
      e.lat !== null && e.lng !== null
    )
    .map((e) => ({
      id: e.id,
      name: e.name,
      lat: e.lat,
      lng: e.lng,
      slug: e.slug,
      state: e.state,
      eventType: e.eventType,
      date: e.date
    }))
}
