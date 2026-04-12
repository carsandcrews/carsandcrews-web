'use client'

import { useState, useCallback, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { VALID_RADII, type ResolvedCenter } from '@/lib/location/types'

interface LocationFilterProps {
  center: ResolvedCenter | null
}

export function LocationFilter({ center }: LocationFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [editing, setEditing] = useState(false)
  const [zipInput, setZipInput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [gpsLoading, setGpsLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  function handleLocationClick() {
    if (center && !editing) {
      setEditing(true)
      // Focus input after state update
      setTimeout(() => inputRef.current?.focus(), 0)
    } else {
      inputRef.current?.focus()
    }
  }

  const activeRadius = center?.radius ?? 100

  const buildUrl = useCallback((overrides: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString())
    Object.entries(overrides).forEach(([key, value]) => {
      if (value) params.set(key, value)
      else params.delete(key)
    })
    params.delete('page')
    return `/events?${params.toString()}`
  }, [searchParams])

  async function handleZipSubmit() {
    const zip = zipInput.trim()
    if (!/^\d{5}$/.test(zip)) {
      setError('Enter a 5-digit ZIP code')
      return
    }
    setError(null)

    const res = await fetch('/api/location/resolve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ zip, radius: activeRadius })
    })

    if (!res.ok) {
      setError("We don't have coordinates for that ZIP")
      return
    }

    const data = await res.json()
    setEditing(false)
    setZipInput('')
    router.push(data.url)
  }

  async function handleGps() {
    if (!navigator.geolocation) {
      setError('GPS not available in this browser')
      return
    }
    setGpsLoading(true)
    setError(null)

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const res = await fetch('/api/location/resolve', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            radius: activeRadius
          })
        })

        if (res.ok) {
          const data = await res.json()
          router.push(data.url)
        } else {
          setError("Couldn't resolve your location")
        }
        setGpsLoading(false)
      },
      () => {
        setError("Couldn't get your location. You can enter a ZIP instead.")
        setGpsLoading(false)
      },
      { timeout: 8000, maximumAge: 600000 }
    )
  }

  function handleClear() {
    document.cookie = 'cc_loc=; Max-Age=0; Path=/events'
    const params = new URLSearchParams(searchParams.toString())
    params.delete('zip')
    params.delete('lat')
    params.delete('lng')
    params.delete('radius')
    params.delete('page')
    const qs = params.toString()
    router.push(qs ? `/events?${qs}` : '/events')
  }

  function handleRadiusChange(radius: number) {
    router.push(buildUrl({ radius: String(radius) }))
  }

  const sourceBadge = center?.source?.toUpperCase()

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        {/* Location display / input — whole area is clickable */}
        <div
          onClick={handleLocationClick}
          className="flex items-center gap-2 flex-1 min-w-0 cursor-pointer rounded-full py-2 px-3 -mx-3 hover:bg-white/[0.03] transition-colors"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-[#888] flex-shrink-0">
            <path fillRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 002.274 1.765 11.842 11.842 0 00.976.544l.062.029.018.008.006.003zM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" clipRule="evenodd" />
          </svg>

          {editing || !center ? (
            <input
              ref={inputRef}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={5}
              placeholder="Enter ZIP code"
              value={zipInput}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => { setZipInput(e.target.value); setError(null) }}
              onKeyDown={(e) => { if (e.key === 'Enter') handleZipSubmit() }}
              onBlur={() => { if (!zipInput && center) setEditing(false) }}
              autoFocus={editing}
              className="w-28 bg-transparent text-sm text-[#f5f5f0] placeholder:text-[#666] focus:outline-none"
            />
          ) : (
            <span className="text-sm text-[#f5f5f0] truncate">
              {center.label}
            </span>
          )}

          {sourceBadge && !editing && center && (
            <span className="text-[10px] font-bold tracking-wider text-[#555] uppercase flex-shrink-0">
              {sourceBadge}
            </span>
          )}

          {center && !editing && (
            <button
              onClick={(e) => { e.stopPropagation(); handleClear() }}
              className="text-[#555] hover:text-[#999] transition-colors flex-shrink-0"
              aria-label="Clear location"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
              </svg>
            </button>
          )}
        </div>

        {/* GPS button */}
        <button
          onClick={handleGps}
          disabled={gpsLoading}
          aria-label="Use GPS location"
          className="text-[#555] hover:text-amber-500 transition-colors flex-shrink-0 disabled:opacity-40"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className={`w-5 h-5 ${gpsLoading ? 'animate-pulse' : ''}`}>
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-1.503.204A6.5 6.5 0 1110.796 3.503a.75.75 0 00-.592-1.378 8 8 0 106.67 6.671.75.75 0 00-1.377-.592zM10 11.25a1.25 1.25 0 100-2.5 1.25 1.25 0 000 2.5z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {/* Error */}
      {error && (
        <p className="text-xs text-red-400 pl-6">{error}</p>
      )}

      {/* Distance chips */}
      {center && (
        <div className="flex items-center gap-2 pl-6">
          <span className="text-xs text-[#555]">Within</span>
          {VALID_RADII.map((r) => (
            <button
              key={r}
              onClick={() => handleRadiusChange(r)}
              className={`
                rounded-full px-3 py-1 text-xs font-semibold transition-all duration-150
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50
                ${r === activeRadius
                  ? 'bg-amber-500/10 text-amber-500'
                  : 'text-[#555] hover:text-[#888] hover:bg-white/5'
                }
              `}
            >
              {r}
            </button>
          ))}
          <span className="text-xs text-[#555]">mi</span>
        </div>
      )}
    </div>
  )
}
