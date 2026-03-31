'use client'

import { useState, useEffect, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { createBrowserClient } from '@/lib/supabase/client'
import type { MapMarker } from '@/lib/maps/cluster'
import { formatEventType } from '@/lib/utils'

const EventMap = dynamic(
  () => import('@/components/maps/EventMap').then((mod) => mod.EventMap),
  { ssr: false, loading: () => <div className="h-[80vh] rounded-xl bg-surface animate-pulse" /> }
)

const RADIUS_OPTIONS = [25, 50, 100, 200, 500]

interface MapViewClientProps {
  initialLat: number | null
  initialLng: number | null
  initialCity: string | null
  initialState: string | null
}

interface MapEvent {
  id: string
  name: string
  slug: string
  date: string
  city: string
  state: string
  event_type: string
  lat: number
  lng: number
  distance_miles?: number
}

export function MapViewClient({ initialLat, initialLng, initialCity, initialState }: MapViewClientProps) {
  const [markers, setMarkers] = useState<MapMarker[]>([])
  const [loading, setLoading] = useState(true)
  const [radius, setRadius] = useState(100)
  const [lat, setLat] = useState(initialLat)
  const [lng, setLng] = useState(initialLng)
  const [locationLabel, setLocationLabel] = useState(
    initialCity && initialState ? `${initialCity}, ${initialState}` : 'All events'
  )
  const [showLocationInput, setShowLocationInput] = useState(false)
  const [locationQuery, setLocationQuery] = useState('')
  const [eventCount, setEventCount] = useState(0)

  const fetchEvents = useCallback(async () => {
    setLoading(true)
    const supabase = createBrowserClient()

    let events: MapEvent[] = []

    if (lat && lng) {
      // Use nearby_events RPC
      const { data } = await supabase.rpc('nearby_events', {
        user_lat: lat,
        user_lng: lng,
        radius_miles: radius,
        max_results: 300
      })
      events = (data || []) as MapEvent[]
    } else {
      // No location — load all upcoming with coords
      const { data } = await supabase
        .from('events')
        .select('id, name, slug, date, city, state, event_type, lat, lng')
        .eq('status', 'published')
        .gte('date', new Date().toISOString().split('T')[0])
        .not('lat', 'is', null)
        .not('lng', 'is', null)
        .order('date', { ascending: true })
        .limit(300)
      events = (data || []) as MapEvent[]
    }

    const mapped: MapMarker[] = events.map(e => ({
      id: e.id,
      name: e.name,
      lat: e.lat,
      lng: e.lng,
      slug: e.slug,
      state: e.state,
      eventType: e.event_type,
      date: e.date,
      distanceMiles: e.distance_miles
    }))

    setMarkers(mapped)
    setEventCount(mapped.length)
    setLoading(false)
  }, [lat, lng, radius])

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  async function handleLocationSearch() {
    if (!locationQuery.trim()) return
    // Use Nominatim for geocoding
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(locationQuery)}&format=json&limit=1&countrycodes=us`,
        { headers: { 'User-Agent': 'CarsAndCrews/1.0' } }
      )
      const data = await res.json()
      if (data.length > 0) {
        setLat(parseFloat(data[0].lat))
        setLng(parseFloat(data[0].lon))
        setLocationLabel(data[0].display_name.split(',').slice(0, 2).join(','))
        setShowLocationInput(false)
        setLocationQuery('')
      }
    } catch {
      // ignore
    }
  }

  function handleClearLocation() {
    setLat(null)
    setLng(null)
    setLocationLabel('All events')
    setShowLocationInput(false)
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6 lg:px-7">
      {/* Controls bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-bold text-text-primary">Event Map</h1>
          <span className="text-xs text-text-faint">
            {loading ? '...' : `${eventCount} events`}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Location */}
          <div className="relative">
            <button
              onClick={() => setShowLocationInput(!showLocationInput)}
              className="flex items-center gap-1.5 rounded-full bg-surface border border-border px-3 py-1.5 text-xs text-text-muted transition-colors hover:text-text-primary"
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              {locationLabel}
            </button>

            {showLocationInput && (
              <div className="absolute right-0 top-full mt-2 z-50 w-72 rounded-xl bg-surface border border-border p-3 shadow-xl">
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={locationQuery}
                    onChange={(e) => setLocationQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleLocationSearch()}
                    placeholder="City, state or zip..."
                    className="flex-1 rounded-lg bg-bg border border-border px-3 py-2 text-xs text-text-primary placeholder:text-text-faint outline-none focus:border-accent/50"
                    autoFocus
                  />
                  <button
                    onClick={handleLocationSearch}
                    className="rounded-lg bg-accent px-3 py-2 text-xs font-semibold text-black"
                  >
                    Go
                  </button>
                </div>
                {lat && (
                  <button
                    onClick={handleClearLocation}
                    className="text-xs text-text-faint hover:text-text-muted"
                  >
                    Show all events (no location filter)
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Radius pills */}
          {lat && (
            <div className="flex gap-1">
              {RADIUS_OPTIONS.map((r) => (
                <button
                  key={r}
                  onClick={() => setRadius(r)}
                  className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                    radius === r
                      ? 'bg-accent/15 text-accent'
                      : 'text-text-faint hover:text-text-muted'
                  }`}
                >
                  {r}mi
                </button>
              ))}
            </div>
          )}

          <a
            href="/events"
            className="text-xs text-accent hover:text-accent-hover transition-colors"
          >
            List view
          </a>
        </div>
      </div>

      {/* Map */}
      <div className="h-[80vh] rounded-xl overflow-hidden">
        {loading ? (
          <div className="h-full rounded-xl bg-surface animate-pulse" />
        ) : (
          <EventMap
            markers={markers}
            center={lat && lng ? [lat, lng] : [39.8283, -98.5795]}
            zoom={lat && lng ? (radius <= 50 ? 10 : radius <= 100 ? 9 : radius <= 200 ? 7 : 5) : 4}
          />
        )}
      </div>
    </div>
  )
}
