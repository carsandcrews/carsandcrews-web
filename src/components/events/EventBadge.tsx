import { formatEventType } from '@/lib/utils'
import type { EventType } from '@/lib/constants'

interface EventBadgeProps {
  type: EventType
  isCharity?: boolean
}

export function EventBadge({ type, isCharity }: EventBadgeProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="inline-flex items-center rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-500">
        {formatEventType(type)}
      </span>
      {isCharity ? (
        <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
          Charity
        </span>
      ) : null}
    </div>
  )
}
