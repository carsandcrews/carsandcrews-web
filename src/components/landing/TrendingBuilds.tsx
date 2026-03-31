import Link from 'next/link'

interface Vehicle {
  year: number
  make: string
  model: string
  slug: string
  photo_url: string | null
  owner_name: string
}

interface TrendingBuildsProps {
  vehicles: Vehicle[]
}

const PLACEHOLDER_VEHICLES: Vehicle[] = [
  { year: 1969, make: 'Chevrolet', model: 'Camaro SS', slug: '69-camaro-ss', photo_url: null, owner_name: 'mike_builds' },
  { year: 1957, make: 'Chevrolet', model: 'Bel Air', slug: '57-bel-air', photo_url: null, owner_name: 'classic_joe' },
  { year: 1992, make: 'Acura', model: 'NSX', slug: '92-nsx', photo_url: null, owner_name: 'jdm_life' },
  { year: 1964, make: 'Pontiac', model: 'Tempest', slug: '64-tempest', photo_url: null, owner_name: 'kevnord' },
]

const GRADIENT_COLORS = [
  'from-[#3a2828] via-[#4a2020] to-[#1a1218]',
  'from-[#1a2a1a] via-[#2a3a2a] to-[#121a12]',
  'from-[#2a2a1a] via-[#3a3520] to-[#1a1a10]',
  'from-[#2a201a] via-[#3a3020] to-[#1a1810]',
]

export function TrendingBuilds({ vehicles }: TrendingBuildsProps) {
  const displayVehicles = vehicles.length > 0 ? vehicles : PLACEHOLDER_VEHICLES

  return (
    <div className="px-4 sm:px-7">
      <div className="flex items-center justify-between py-3">
        <div className="text-[11px] font-semibold uppercase tracking-[1.5px] text-text-faint">
          Trending Builds
        </div>
        <Link href="/vehicles" className="text-[11px] font-semibold text-[#60a5fa] hover:text-[#93bbfd]">
          See all &rarr;
        </Link>
      </div>

      <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-7 sm:-mx-7 sm:px-7">
        {displayVehicles.map((v, i) => {
          const title = `'${String(v.year).slice(-2)} ${v.make} ${v.model}`
          const gradient = GRADIENT_COLORS[i % GRADIENT_COLORS.length]

          return (
            <Link
              key={v.slug}
              href={`/vehicles/${v.slug}`}
              className="group flex-shrink-0 overflow-hidden rounded-[14px]"
              style={{ width: 200 }}
            >
              <div className="relative" style={{ aspectRatio: '4/5' }}>
                {v.photo_url ? (
                  <img
                    src={v.photo_url}
                    alt={`${v.year} ${v.make} ${v.model}`}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
                    loading="lazy"
                  />
                ) : (
                  <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`} />
                )}
                <div className="absolute inset-0" style={{ boxShadow: 'inset 0 0 40px rgba(0,0,0,0.3)' }} />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0a0a12]/95 via-transparent to-transparent p-3 pt-10">
                  <p className="text-[13px] font-bold text-white">{title}</p>
                  <p className="mt-0.5 text-[10px] text-[#aaa]">@{v.owner_name}</p>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
