import { VEHICLE_STATUS_LABELS, type VehicleStatusTag } from '@/lib/constants'

interface VehicleDetailHeaderProps {
  year: number
  make: string
  model: string
  statusTag: VehicleStatusTag
  heroPhotoUrl: string | null
  ownerName: string
  ownerUsername: string
}

export function VehicleDetailHeader({
  year,
  make,
  model,
  statusTag,
  heroPhotoUrl,
  ownerName,
  ownerUsername
}: VehicleDetailHeaderProps) {
  const title = `${year} ${make} ${model}`

  return (
    <div className="space-y-4">
      {heroPhotoUrl ? (
        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl">
          <img
            src={heroPhotoUrl}
            alt={title}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#111113]/90 via-transparent to-transparent" />
          <div className="absolute inset-0" style={{ boxShadow: 'inset 0 0 50px rgba(0,0,0,0.3)' }} />
        </div>
      ) : null}

      <div className="flex items-center gap-3">
        <span className="inline-flex items-center rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-400 border border-amber-500/20">
          {VEHICLE_STATUS_LABELS[statusTag]}
        </span>
      </div>

      <h1 className="text-2xl font-bold text-[#f5f5f0] sm:text-3xl lg:text-4xl">
        {title}
      </h1>

      <a
        href={`/@${ownerUsername}`}
        className="inline-flex items-center gap-1.5 text-sm text-[#888] hover:text-[#f5f5f0] transition-colors duration-150"
      >
        Owned by {ownerName}
      </a>
    </div>
  )
}
