import { formatEventDate } from '@/lib/utils'

interface EventMetaProps {
  date: string
  endDate: string | null
  startTime: string | null
  endTime: string | null
  city: string
  state: string
  locationName: string | null
  address: string | null
  rsvpCount: number
}

function formatTime(time: string): string {
  const [hours, minutes] = time.split(':').map(Number)
  const period = hours >= 12 ? 'PM' : 'AM'
  const displayHours = hours % 12 || 12
  return minutes === 0 ? `${displayHours} ${period}` : `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`
}

export function EventMeta({
  date,
  endDate,
  startTime,
  endTime,
  city,
  state,
  locationName,
  address,
  rsvpCount
}: EventMetaProps) {
  const dateStr = formatEventDate(date, endDate)

  const timeStr = startTime
    ? endTime
      ? `${formatTime(startTime)} – ${formatTime(endTime)}`
      : formatTime(startTime)
    : null

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-5 text-amber-500 mt-0.5">
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
            <path fillRule="evenodd" d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 015.75 2zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75z" clipRule="evenodd" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-medium text-[#f5f5f0]">{dateStr}</p>
          {timeStr ? <p className="text-sm text-[#888]">{timeStr}</p> : null}
        </div>
      </div>

      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-5 text-amber-500 mt-0.5">
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
            <path fillRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433a19.695 19.695 0 002.683-2.006c1.648-1.46 3.445-3.597 3.445-6.343 0-3.866-3.134-7-7-7s-7 3.134-7 7c0 2.746 1.797 4.883 3.445 6.343a19.695 19.695 0 002.683 2.006 11.28 11.28 0 00.757.433 5.741 5.741 0 00.281.14l.018.008.006.003zM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" clipRule="evenodd" />
          </svg>
        </div>
        <div>
          {locationName ? (
            <p className="text-sm font-medium text-[#f5f5f0]">{locationName}</p>
          ) : null}
          {address ? <p className="text-sm text-[#888]">{address}</p> : null}
          <p className="text-sm text-[#888]">{city}, {state}</p>
        </div>
      </div>

      {rsvpCount > 0 ? (
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-5 text-amber-500">
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path d="M7 8a3 3 0 100-6 3 3 0 000 6zM14.5 9a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM1.615 16.428a1.224 1.224 0 01-.569-1.175 6.002 6.002 0 0111.908 0c.058.467-.172.92-.57 1.174A9.953 9.953 0 017 18a9.953 9.953 0 01-5.385-1.572zM14.5 16h-.106c.07-.297.088-.611.048-.933a7.47 7.47 0 00-1.588-3.755 4.502 4.502 0 015.874 2.636.818.818 0 01-.36.98A7.465 7.465 0 0114.5 16z" />
            </svg>
          </div>
          <p className="text-sm text-[#f5f5f0]">{rsvpCount} going</p>
        </div>
      ) : null}
    </div>
  )
}
