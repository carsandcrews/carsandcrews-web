import Link from 'next/link'

interface FeedEventRowProps {
  name: string
  date: string
  city: string
  state: string
  eventType: string
  slug: string
  stateCode: string
}

export function FeedEventRow({ name, date, city, state, eventType, slug, stateCode }: FeedEventRowProps) {
  const d = new Date(date + 'T00:00:00')
  const month = d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()
  const day = d.getDate()

  return (
    <Link
      href={`/events/${stateCode.toLowerCase()}/${slug}`}
      className="flex items-center gap-4 border-b border-white/[0.04] py-4 transition-colors duration-150 hover:bg-surface/50"
    >
      <div className="w-12 flex-shrink-0 text-center">
        <div className="text-[11px] font-bold tracking-wide text-accent">{month}</div>
        <div className="text-2xl font-black leading-none text-text-primary">{day}</div>
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[15px] font-semibold text-text-primary">{name}</div>
        <div className="text-xs text-text-faint">{city}, {state} · {eventType}</div>
      </div>
      <span className="flex-shrink-0 text-xs font-semibold text-accent">RSVP</span>
    </Link>
  )
}
