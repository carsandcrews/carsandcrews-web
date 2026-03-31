import { EventBadge } from './EventBadge'
import type { EventType } from '@/lib/constants'

interface EventDetailHeaderProps {
  name: string
  bannerUrl: string | null
  eventType: EventType
  isCharity: boolean
  claimed?: boolean
}

export function EventDetailHeader({
  name,
  bannerUrl,
  eventType,
  isCharity,
  claimed = true
}: EventDetailHeaderProps) {
  return (
    <div className="space-y-4">
      {bannerUrl ? (
        <div className="relative aspect-[21/9] w-full overflow-hidden rounded-2xl">
          <img
            src={bannerUrl}
            alt={name}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#111113]/90 via-transparent to-transparent" />
          <div className="absolute inset-0" style={{ boxShadow: 'inset 0 0 50px rgba(0,0,0,0.3)' }} />
        </div>
      ) : null}

      <EventBadge type={eventType} isCharity={isCharity} />

      <h1 className="text-2xl font-bold text-[#f5f5f0] sm:text-3xl lg:text-4xl">
        {name}
      </h1>

      {!claimed ? (
        <a
          href="/events/claim"
          className="inline-flex items-center gap-1.5 text-sm text-amber-500 hover:text-amber-400 transition-colors duration-150"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M16.403 12.652a3 3 0 000-5.304 3 3 0 00-3.75-3.751 3 3 0 00-5.305 0 3 3 0 00-3.751 3.75 3 3 0 000 5.305 3 3 0 003.75 3.751 3 3 0 005.305 0 3 3 0 003.751-3.75zm-2.546-4.46a.75.75 0 00-1.214-.883l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
          </svg>
          Claim this event
        </a>
      ) : null}
    </div>
  )
}
