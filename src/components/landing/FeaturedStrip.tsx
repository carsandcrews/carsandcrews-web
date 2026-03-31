import Link from 'next/link'

interface FeaturedEvent {
  name: string
  date: string
  city: string
  state: string
  slug: string
  stateCode: string
  bannerUrl: string | null
}

interface FeaturedVehicle {
  year: number
  make: string
  model: string
  slug: string
  photoUrl: string | null
  ownerName: string
  statusTag: string
}

interface FeaturedStripProps {
  event: FeaturedEvent | null
  vehicle: FeaturedVehicle | null
}

export function FeaturedStrip({ event, vehicle }: FeaturedStripProps) {
  return (
    <div className="flex flex-col gap-3.5 px-4 pt-5 pb-4 sm:px-6 md:flex-row lg:px-7">
      {/* Featured event */}
      <div className="relative min-h-[140px] flex-[1.2] overflow-hidden rounded-2xl md:min-h-[160px]">
        {event?.bannerUrl ? (
          <img src={event.bannerUrl} alt={event.name} className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a3e] via-[#1e3a5f] to-[#0f2847]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
        <div className="relative z-10 flex min-h-[140px] flex-col justify-end p-5 md:min-h-[160px]">
          <span className="mb-2 text-[9px] font-semibold uppercase tracking-[2.5px] text-accent">This Weekend</span>
          <h2 className="mb-1.5 text-lg font-extrabold leading-tight text-white md:text-[22px]">
            {event?.name ?? 'Cars & Coffee at The Domain'}
          </h2>
          <p className="mb-3.5 text-xs text-[#aaa]">
            {event ? `${formatDate(event.date)} · ${event.city}, ${event.state}` : 'Sunday 8am · Austin, TX'}
          </p>
          <div className="flex gap-2">
            <Link
              href={event ? `/events/${event.stateCode.toLowerCase()}/${event.slug}` : '/events'}
              className="inline-flex items-center rounded-full bg-accent px-4 py-2 text-[11px] font-bold text-black transition-colors duration-150 hover:bg-accent-hover"
            >
              I&apos;m Going
            </Link>
            <Link
              href={event ? `/events/${event.stateCode.toLowerCase()}/${event.slug}` : '/events'}
              className="inline-flex items-center rounded-full bg-white/8 px-4 py-2 text-[11px] text-[#ccc] transition-colors duration-150 hover:bg-white/12"
            >
              Details
            </Link>
          </div>
        </div>
      </div>

      {/* Trending vehicle */}
      <div className="relative min-h-[140px] flex-1 overflow-hidden rounded-2xl md:min-h-[160px]">
        {vehicle?.photoUrl ? (
          <img src={vehicle.photoUrl} alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`} className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#2a2020] via-[#3a2525] to-[#151520]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/10" />
        <div className="relative z-10 flex min-h-[140px] flex-col justify-end p-5 md:min-h-[160px]">
          <span className="mb-2 text-[9px] font-semibold uppercase tracking-[2.5px] text-[#60a5fa]">Trending Build</span>
          <h2 className="mb-1 text-lg font-extrabold leading-tight text-white md:text-xl">
            {vehicle ? `'${String(vehicle.year).slice(-2)} ${vehicle.make} ${vehicle.model}` : "'69 Camaro SS"}
          </h2>
          <p className="text-xs text-[#aaa]">
            {vehicle ? `${vehicle.statusTag} by @${vehicle.ownerName}` : 'Full restore by @mike_builds'}
          </p>
        </div>
      </div>
    </div>
  )
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const hours = d.getHours()
  const ampm = hours >= 12 ? 'pm' : 'am'
  const hour12 = hours % 12 || 12
  return `${days[d.getDay()]} ${hour12}${ampm}`
}
