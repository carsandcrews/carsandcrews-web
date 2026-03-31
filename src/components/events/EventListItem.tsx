import { formatEventType } from '@/lib/utils'
import type { EventType } from '@/lib/constants'

interface EventListItemProps {
  name: string
  date: string
  city: string
  state: string
  eventType: EventType
  slug: string
  stateCode: string
  rsvpCount?: number
  distance?: number | null
}

export function EventListItem({
  name,
  date,
  city,
  state,
  eventType,
  slug,
  stateCode,
  rsvpCount,
  distance
}: EventListItemProps) {
  const d = new Date(date + 'T00:00:00')
  const month = d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()
  const day = d.getDate()

  return (
    <a
      href={`/events/${stateCode.toLowerCase()}/${slug}`}
      className="flex items-center gap-4 py-4 border-b border-white/[0.04] transition-colors duration-150 hover:bg-white/[0.02] -mx-2 px-2 rounded-lg"
    >
      <div className="w-12 text-center flex-shrink-0">
        <div className="text-[11px] font-bold text-amber-500 tracking-wide">{month}</div>
        <div className="text-2xl font-black text-[#f5f5f0] leading-none">{day}</div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[15px] font-semibold text-[#f5f5f0] truncate">{name}</div>
        <div className="text-xs text-[#666]">
          {city}, {state}{distance != null ? ` · ${Math.round(distance)} mi` : ''} · {formatEventType(eventType)}
          {rsvpCount && rsvpCount > 0 ? ` · ${rsvpCount} going` : ''}
        </div>
      </div>
    </a>
  )
}
