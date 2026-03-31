import Link from 'next/link'
import { formatEventType } from '@/lib/utils'
import type { EventType } from '@/lib/constants'

interface FeedEvent {
  name: string
  date: string
  city: string
  state: string
  event_type: EventType
  slug: string
  state_code: string
  distance_miles?: number | null
}

interface EventFeedProps {
  events: FeedEvent[]
}

function isThisWeekend(dateStr: string): boolean {
  const now = new Date()
  const eventDate = new Date(dateStr + 'T00:00:00')
  const diffMs = eventDate.getTime() - now.getTime()
  const diffDays = diffMs / (1000 * 60 * 60 * 24)
  return diffDays >= 0 && diffDays <= 7
}

function formatSubtitle(event: FeedEvent): string {
  const d = new Date(event.date + 'T00:00:00')
  const day = d.toLocaleDateString('en-US', { weekday: 'long' })
  const parts = [day]
  parts.push(`${event.city}, ${event.state}`)
  if (event.distance_miles != null) {
    parts.push(`${Math.round(event.distance_miles)} mi`)
  }
  return parts.join(' \u00B7 ')
}

export function EventFeed({ events }: EventFeedProps) {
  const displayEvents = events.length > 0 ? events : PLACEHOLDER_EVENTS

  return (
    <div className="px-4 sm:px-7">
      <div className="pb-3 pt-4 text-[11px] font-semibold uppercase tracking-[1.5px] text-text-faint">
        What&apos;s Happening Near You
      </div>

      {displayEvents.map((event, i) => {
        const d = new Date(event.date + 'T00:00:00')
        const month = d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()
        const day = d.getDate()
        const weekend = i === 0 && isThisWeekend(event.date)

        return (
          <Link
            key={event.slug}
            href={`/events/${event.state_code.toLowerCase()}/${event.slug}`}
            className="flex items-center gap-3.5 border-b border-white/[0.04] py-3.5 transition-colors duration-150 hover:bg-surface/50"
          >
            <div className="w-[46px] flex-shrink-0 text-center">
              <div className="text-[10px] font-bold text-accent">{month}</div>
              <div className="text-[22px] font-black leading-none text-white">{day}</div>
            </div>
            <div className="min-w-0 flex-1">
              <div className="mb-0.5 flex items-center gap-2">
                <span className="truncate text-sm font-semibold text-white">{event.name}</span>
                {weekend && (
                  <span className="flex-shrink-0 rounded-[10px] bg-accent/15 px-2 py-0.5 text-[9px] font-bold text-accent">
                    THIS WEEKEND
                  </span>
                )}
              </div>
              <div className="text-[11px] text-text-faint">{formatSubtitle(event)}</div>
            </div>
            <span className="flex-shrink-0 text-[11px] font-semibold text-accent">RSVP</span>
          </Link>
        )
      })}

      <div className="py-3">
        <Link href="/events" className="text-xs font-semibold text-accent hover:text-accent-hover">
          See all events near you &rarr;
        </Link>
      </div>
    </div>
  )
}

const PLACEHOLDER_EVENTS: FeedEvent[] = [
  { name: 'Saturday Cruise-In at Sonic', date: '2026-04-05', city: 'Round Rock', state: 'TX', event_type: 'cruise_in', slug: 'saturday-cruise-in-at-sonic', state_code: 'tx', distance_miles: null },
  { name: 'Cars & Coffee \u2014 The Domain', date: '2026-04-06', city: 'Austin', state: 'TX', event_type: 'cars_and_coffee', slug: 'cars-and-coffee-the-domain', state_code: 'tx', distance_miles: null },
  { name: 'Lone Star Nationals', date: '2026-04-12', city: 'Fort Worth', state: 'TX', event_type: 'car_show', slug: 'lone-star-nationals', state_code: 'tx', distance_miles: null },
]
