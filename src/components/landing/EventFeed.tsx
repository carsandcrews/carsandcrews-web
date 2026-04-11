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
  const parts = [day, `${event.city}, ${event.state}`]
  if (event.distance_miles != null) {
    parts.push(`${Math.round(event.distance_miles)} mi`)
  }
  return parts.join(' \u00B7 ')
}

export function EventFeed({ events }: EventFeedProps) {
  const displayEvents = events.length > 0 ? events : PLACEHOLDER_EVENTS

  return (
    <section className="mx-auto max-w-6xl px-6 py-16 sm:px-10 lg:px-16">
      <div className="relative mb-6 flex items-baseline justify-between border-b border-[var(--border)] pb-4">
        <h2 className="display text-[32px] uppercase tracking-[0.05em] text-[var(--text)]">
          Upcoming Shows
        </h2>
        <Link
          href="/events"
          className="display text-[13px] uppercase tracking-[0.15em] text-[var(--text-muted)] transition-colors hover:text-[var(--accent)]"
        >
          View All →
        </Link>
        <span className="absolute -bottom-[1px] left-0 h-[2px] w-14 bg-[var(--accent)]" aria-hidden="true" />
      </div>

      <div className="flex flex-col gap-px border border-[var(--border)] bg-[var(--border)]">
        {displayEvents.map((event, i) => {
          const d = new Date(event.date + 'T00:00:00')
          const month = d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()
          const day = d.getDate()
          const weekend = i === 0 && isThisWeekend(event.date)

          return (
            <Link
              key={event.slug}
              href={`/events/${event.state_code.toLowerCase()}/${event.slug}`}
              className="grid grid-cols-[80px_1fr_auto] items-center gap-5 bg-[var(--surface)] px-6 py-4 transition-colors hover:bg-[var(--surface-2)]"
            >
              <div className="display leading-[1.1]">
                <div className="text-[14px] uppercase tracking-[0.1em] text-[var(--accent)]">{month}</div>
                <div className="text-[28px] text-[var(--text)]">{day}</div>
              </div>
              <div className="min-w-0">
                <div className="mb-1 flex items-center gap-2">
                  <span className="truncate text-[15px] font-semibold text-[var(--text)]">{event.name}</span>
                  {weekend && (
                    <span className="display flex-shrink-0 bg-[var(--accent)] px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-[var(--accent-ink)]">
                      This Weekend
                    </span>
                  )}
                </div>
                <div className="text-[12px] text-[var(--text-faint)]">{formatSubtitle(event)}</div>
              </div>
              <span className="display text-[12px] uppercase tracking-[0.15em] text-[var(--text-muted)]">
                {formatEventType(event.event_type)}
              </span>
            </Link>
          )
        })}
      </div>
    </section>
  )
}

const PLACEHOLDER_EVENTS: FeedEvent[] = [
  { name: 'Saturday Cruise-In at Sonic', date: '2026-04-05', city: 'Round Rock', state: 'TX', event_type: 'cruise_in', slug: 'saturday-cruise-in-at-sonic', state_code: 'tx', distance_miles: null },
  { name: 'Cars & Coffee \u2014 The Domain', date: '2026-04-06', city: 'Austin', state: 'TX', event_type: 'cars_and_coffee', slug: 'cars-and-coffee-the-domain', state_code: 'tx', distance_miles: null },
  { name: 'Lone Star Nationals', date: '2026-04-12', city: 'Fort Worth', state: 'TX', event_type: 'car_show', slug: 'lone-star-nationals', state_code: 'tx', distance_miles: null },
]
