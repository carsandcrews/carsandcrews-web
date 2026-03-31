interface AttendingVehicle {
  id: string
  year: number
  make: string
  model: string
  thumbnail_url: string | null
}

interface VehiclesAttendingProps {
  vehicles: AttendingVehicle[]
}

export function VehiclesAttending({ vehicles }: VehiclesAttendingProps) {
  if (vehicles.length === 0) return null

  return (
    <div className="border-t border-white/5 pt-6">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#888]">
        Vehicles Attending
      </h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {vehicles.map((v) => (
          <div key={v.id} className="space-y-2">
            <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-[#1a1a1d]">
              {v.thumbnail_url ? (
                <img
                  src={v.thumbnail_url}
                  alt={`${v.year} ${v.make} ${v.model}`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <svg viewBox="0 0 20 20" fill="currentColor" className="h-8 w-8 text-white/20">
                    <path d="M1 8.25a1.25 1.25 0 112.5 0v7.5a1.25 1.25 0 11-2.5 0v-7.5zM7.25 3v1.325C8.692 5.186 9.998 6.312 10.745 7.5H15.5A1.5 1.5 0 0117 9v1a1.5 1.5 0 01-1.5 1.5h-.628a5.003 5.003 0 01-2.872 3.5V17.5a1.5 1.5 0 01-1.5 1.5h-2A1.5 1.5 0 017 17.5V15H5.5A1.5 1.5 0 014 13.5V8.25A1.25 1.25 0 015.25 7h2V3z" />
                  </svg>
                </div>
              )}
            </div>
            <p className="text-xs text-[#f5f5f0]/80 truncate">
              {v.year} {v.make} {v.model}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
