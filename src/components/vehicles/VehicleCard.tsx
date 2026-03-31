import { VEHICLE_STATUS_LABELS, type VehicleStatusTag } from '@/lib/constants'

interface VehicleCardProps {
  year: number
  make: string
  model: string
  statusTag: VehicleStatusTag
  slug: string
  photoUrl: string | null
  ownerName: string
}

export function VehicleCard({
  year,
  make,
  model,
  statusTag,
  slug,
  photoUrl,
  ownerName
}: VehicleCardProps) {
  const title = `${year} ${make} ${model}`

  return (
    <a
      href={`/vehicles/${slug}`}
      className="group block overflow-hidden rounded-2xl bg-[#1a1a1d] border border-white/[0.04] transition-all duration-200 hover:border-white/10 hover:shadow-lg"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[#1a1a1d]">
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-10 w-10 text-white/10">
              <path d="M1 8.25a1.25 1.25 0 112.5 0v7.5a1.25 1.25 0 11-2.5 0v-7.5zM7.25 3v1.325C8.692 5.186 9.998 6.312 10.745 7.5H15.5A1.5 1.5 0 0117 9v1a1.5 1.5 0 01-1.5 1.5h-.628a5.003 5.003 0 01-2.872 3.5V17.5a1.5 1.5 0 01-1.5 1.5h-2A1.5 1.5 0 017 17.5V15H5.5A1.5 1.5 0 014 13.5V8.25A1.25 1.25 0 015.25 7h2V3z" />
            </svg>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#111113]/70 via-transparent to-transparent" />
        <div className="absolute inset-0" style={{ boxShadow: 'inset 0 0 30px rgba(0,0,0,0.2)' }} />
        <span className="absolute top-3 left-3 inline-flex items-center rounded-full bg-black/50 backdrop-blur-sm px-2.5 py-0.5 text-[11px] font-semibold text-amber-400 border border-amber-500/20">
          {VEHICLE_STATUS_LABELS[statusTag]}
        </span>
      </div>
      <div className="px-4 py-3">
        <p className="text-sm font-semibold text-[#f5f5f0] truncate">{title}</p>
        <p className="text-xs text-[#666] mt-0.5">{ownerName}</p>
      </div>
    </a>
  )
}
