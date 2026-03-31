'use client'

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { MapMarker } from '@/lib/maps/cluster'
import { formatEventType, formatEventDate } from '@/lib/utils'

interface EventMapProps {
  markers: MapMarker[]
  center?: [number, number]
  zoom?: number
}

export function EventMap({ markers, center = [39.8283, -98.5795], zoom = 4 }: EventMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    const map = L.map(mapRef.current).setView(center, zoom)
    mapInstanceRef.current = map

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      maxZoom: 19
    }).addTo(map)

    const markerIcon = L.divIcon({
      className: 'custom-marker',
      html: '<div style="width:12px;height:12px;background:#f59e0b;border-radius:50%;border:2px solid #111113;box-shadow:0 2px 6px rgba(0,0,0,0.4)"></div>',
      iconSize: [12, 12],
      iconAnchor: [6, 6]
    })

    markers.forEach((m) => {
      const popup = `
        <div style="font-family:system-ui;min-width:200px">
          <div style="font-size:14px;font-weight:700;color:#111;margin-bottom:4px">${m.name}</div>
          <div style="font-size:12px;color:#666;margin-bottom:6px">${formatEventDate(m.date, null)} · ${formatEventType(m.eventType)}</div>
          <a href="/events/${m.state.toLowerCase()}/${m.slug}" style="font-size:12px;color:#d97706;font-weight:600;text-decoration:none">View details →</a>
        </div>
      `
      L.marker([m.lat, m.lng], { icon: markerIcon })
        .addTo(map)
        .bindPopup(popup)
    })

    if (markers.length > 0) {
      const group = L.featureGroup(
        markers.map((m) => L.marker([m.lat, m.lng]))
      )
      map.fitBounds(group.getBounds().pad(0.1))
    }

    return () => {
      map.remove()
      mapInstanceRef.current = null
    }
  }, [markers, center, zoom])

  return (
    <div
      ref={mapRef}
      className="h-full w-full rounded-xl"
      style={{ minHeight: '500px' }}
    />
  )
}
