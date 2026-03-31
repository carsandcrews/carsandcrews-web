import { describe, it, expect } from 'vitest'
import { clusterEvents, type MapEvent } from '@/lib/maps/cluster'

describe('clusterEvents', () => {
  const events: MapEvent[] = [
    { id: '1', name: 'Event A', lat: 30.267, lng: -97.743, slug: 'event-a', state: 'tx', eventType: 'car_show', date: '2026-04-05' },
    { id: '2', name: 'Event B', lat: 30.268, lng: -97.744, slug: 'event-b', state: 'tx', eventType: 'cruise_in', date: '2026-04-06' },
    { id: '3', name: 'Event C', lat: 40.758, lng: -73.985, slug: 'event-c', state: 'ny', eventType: 'meetup', date: '2026-04-07' }
  ]

  it('returns all events as map markers', () => {
    const result = clusterEvents(events)
    expect(result).toHaveLength(3)
  })

  it('includes required fields for each marker', () => {
    const result = clusterEvents(events)
    const marker = result[0]
    expect(marker).toHaveProperty('id')
    expect(marker).toHaveProperty('lat')
    expect(marker).toHaveProperty('lng')
    expect(marker).toHaveProperty('name')
    expect(marker).toHaveProperty('slug')
  })

  it('filters out events with missing coordinates', () => {
    const withMissing: MapEvent[] = [
      ...events,
      { id: '4', name: 'No Coords', lat: null, lng: null, slug: 'no-coords', state: 'tx', eventType: 'other', date: '2026-04-08' }
    ]
    const result = clusterEvents(withMissing)
    expect(result).toHaveLength(3)
  })
})
