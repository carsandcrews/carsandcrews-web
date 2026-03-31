'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useCallback } from 'react'
import { EventListItem } from '@/components/events/EventListItem'
import { EventFilters } from '@/components/events/EventFilters'
import { SearchBar } from '@/components/events/SearchBar'
import type { EventType } from '@/lib/constants'

interface EventItem {
  id: string
  name: string
  slug: string
  date: string
  city: string
  state: string
  eventType: EventType
  stateCode: string
  distance?: number | null
}

interface EventsExploreClientProps {
  initialEvents: EventItem[]
  initialQuery: string
  initialTypes: EventType[]
  currentPage: number
  totalPages: number
  serverLocation?: string | null
  sortByDistance?: boolean
}

export function EventsExploreClient({
  initialEvents,
  initialQuery,
  initialTypes,
  currentPage,
  totalPages,
  serverLocation,
  sortByDistance
}: EventsExploreClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [query, setQuery] = useState(initialQuery)
  const [selectedTypes, setSelectedTypes] = useState<EventType[]>(initialTypes)

  const buildUrl = useCallback((overrides: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString())
    Object.entries(overrides).forEach(([key, value]) => {
      if (value) params.set(key, value)
      else params.delete(key)
    })
    params.delete('page')
    return `/events?${params.toString()}`
  }, [searchParams])

  function handleSearch(value: string) {
    setQuery(value)
  }

  function handleSearchSubmit() {
    router.push(buildUrl({ q: query || undefined }))
  }

  function handleTypeToggle(type: EventType) {
    const next = selectedTypes.includes(type)
      ? selectedTypes.filter((t) => t !== type)
      : [...selectedTypes, type]
    setSelectedTypes(next)
    router.push(buildUrl({ type: next.length > 0 ? next.join(',') : undefined }))
  }

  function handleSortToggle() {
    if (sortByDistance) {
      router.push(buildUrl({ sort: 'date' }))
    } else {
      router.push(buildUrl({ sort: undefined }))
    }
  }

  return (
    <div className="space-y-6">
      <div onKeyDown={(e) => { if (e.key === 'Enter') handleSearchSubmit() }}>
        <SearchBar value={query} onChange={handleSearch} location={serverLocation} />
      </div>

      <div className="flex items-center justify-between gap-4">
        <EventFilters selectedTypes={selectedTypes} onTypeToggle={handleTypeToggle} />
        <div className="flex items-center gap-3 flex-shrink-0">
          {serverLocation && (
            <button
              onClick={handleSortToggle}
              className={`text-sm transition-colors duration-150 ${sortByDistance ? 'text-amber-500 font-semibold' : 'text-[#666] hover:text-[#999]'}`}
            >
              Near me
            </button>
          )}
          <a
            href="/events/map"
            className="text-sm text-amber-500 hover:text-amber-400 transition-colors duration-150"
          >
            Map view
          </a>
        </div>
      </div>

      <div>
        {initialEvents.length === 0 ? (
          <p className="py-12 text-center text-sm text-[#555]">No events found</p>
        ) : (
          initialEvents.map((event) => (
            <EventListItem
              key={event.id}
              name={event.name}
              date={event.date}
              city={event.city}
              state={event.state}
              eventType={event.eventType}
              slug={event.slug}
              stateCode={event.stateCode}
              distance={event.distance}
            />
          ))
        )}
      </div>

      {totalPages > 1 ? (
        <div className="flex items-center justify-center gap-2 pt-4">
          {currentPage > 1 ? (
            <a
              href={`/events?${new URLSearchParams({ ...Object.fromEntries(searchParams), page: String(currentPage - 1) }).toString()}`}
              className="rounded-full px-4 py-2 text-sm font-semibold text-white/70 hover:text-white hover:bg-white/5 transition-all duration-150"
            >
              Previous
            </a>
          ) : null}
          <span className="text-sm text-[#888]">
            Page {currentPage} of {totalPages}
          </span>
          {currentPage < totalPages ? (
            <a
              href={`/events?${new URLSearchParams({ ...Object.fromEntries(searchParams), page: String(currentPage + 1) }).toString()}`}
              className="rounded-full px-4 py-2 text-sm font-semibold text-white/70 hover:text-white hover:bg-white/5 transition-all duration-150"
            >
              Next
            </a>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
