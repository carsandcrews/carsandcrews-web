'use client'

import { EVENT_TYPES, EVENT_TYPE_LABELS, type EventType } from '@/lib/constants'

interface EventFiltersProps {
  selectedTypes: EventType[]
  onTypeToggle: (type: EventType) => void
}

export function EventFilters({ selectedTypes, onTypeToggle }: EventFiltersProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {EVENT_TYPES.map((type) => {
        const isSelected = selectedTypes.includes(type)
        return (
          <button
            key={type}
            type="button"
            onClick={() => onTypeToggle(type)}
            className={`
              rounded-full px-4 py-1.5 text-xs font-semibold transition-all duration-150
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50
              ${isSelected
                ? 'bg-amber-500/10 text-amber-500'
                : 'text-[#555] hover:text-[#888] hover:bg-white/5'
              }
            `}
          >
            {EVENT_TYPE_LABELS[type]}
          </button>
        )
      })}
    </div>
  )
}
