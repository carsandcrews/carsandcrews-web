'use client'

import { useState, useEffect } from 'react'
import { getGPSLocation, type UserLocation } from '@/lib/location/detect'

interface UseLocationOptions {
  serverLocation?: UserLocation | null
}

export function useLocation({ serverLocation }: UseLocationOptions = {}) {
  const [location, setLocation] = useState<UserLocation | null>(serverLocation ?? null)
  const [loading, setLoading] = useState(!serverLocation)

  useEffect(() => {
    if (location?.source === 'gps') return

    async function tryGPS() {
      setLoading(true)
      const gps = await getGPSLocation()
      if (gps) {
        setLocation(gps)
      }
      setLoading(false)
    }

    tryGPS()
  }, [])

  function setManualLocation(city: string, state: string, lat: number, lng: number) {
    setLocation({ city, state, lat, lng, source: 'manual' })
  }

  return { location, loading, setManualLocation }
}
