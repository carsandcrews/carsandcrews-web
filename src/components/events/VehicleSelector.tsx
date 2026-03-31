'use client'

interface Vehicle {
  id: string
  year: number
  make: string
  model: string
  thumbnail_url: string | null
}

interface VehicleSelectorProps {
  vehicles: Vehicle[]
  selectedId: string | null
  onSelect: (vehicleId: string | null) => void
}

export function VehicleSelector({ vehicles, selectedId, onSelect }: VehicleSelectorProps) {
  if (vehicles.length === 0) return null

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-white/80">Bringing a vehicle?</p>
      <div className="flex flex-col gap-2">
        {vehicles.map((v) => (
          <button
            key={v.id}
            type="button"
            onClick={() => onSelect(selectedId === v.id ? null : v.id)}
            className={`flex items-center gap-3 rounded-xl px-4 py-3 text-left transition-all duration-150 border ${
              selectedId === v.id
                ? 'border-amber-500 bg-amber-500/10'
                : 'border-white/10 bg-white/5 hover:bg-white/10'
            }`}
          >
            {v.thumbnail_url ? (
              <img
                src={v.thumbnail_url}
                alt={`${v.year} ${v.make} ${v.model}`}
                className="h-10 w-10 rounded-lg object-cover"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10">
                <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 text-white/40">
                  <path d="M1 8.25a1.25 1.25 0 112.5 0v7.5a1.25 1.25 0 11-2.5 0v-7.5zM7.25 3v1.325C8.692 5.186 9.998 6.312 10.745 7.5H15.5A1.5 1.5 0 0117 9v1a1.5 1.5 0 01-1.5 1.5h-.628a5.003 5.003 0 01-2.872 3.5V17.5a1.5 1.5 0 01-1.5 1.5h-2A1.5 1.5 0 017 17.5V15H5.5A1.5 1.5 0 014 13.5V8.25A1.25 1.25 0 015.25 7h2V3z" />
                </svg>
              </div>
            )}
            <span className="text-sm text-[#f5f5f0]">
              {v.year} {v.make} {v.model}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
