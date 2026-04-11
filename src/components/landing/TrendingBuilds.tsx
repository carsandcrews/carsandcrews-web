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

export function TrendingBuilds({ vehicles }: TrendingBuildsProps) {
  const displayVehicles = vehicles.length > 0 ? vehicles : PLACEHOLDER_VEHICLES

  return (
    <section className="mx-auto max-w-6xl px-6 py-16 sm:px-10 lg:px-16">
      <div className="relative mb-6 flex items-baseline justify-between border-b border-[var(--border)] pb-4">
        <h2 className="display text-[32px] uppercase tracking-[0.05em] text-[var(--text)]">
          Latest Builds
        </h2>
        <Link
          href="/vehicles"
          className="display text-[13px] uppercase tracking-[0.15em] text-[var(--text-muted)] transition-colors hover:text-[var(--accent)]"
        >
          View All →
        </Link>
        <span className="absolute -bottom-[1px] left-0 h-[2px] w-14 bg-[var(--accent)]" aria-hidden="true" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {displayVehicles.map((v) => {
          const title = `${v.year} ${v.make} ${v.model}`

          return (
            <Link
              key={v.slug}
              href={`/@${v.owner_name}/${v.slug}`}
              className="group overflow-hidden border border-[var(--border)] bg-[var(--surface)] transition-colors hover:border-[var(--border-strong)]"
            >
              <div className="relative" style={{ aspectRatio: '4/3' }}>
                {v.photo_url ? (
                  <img
                    src={v.photo_url}
                    alt={title}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
                    loading="lazy"
                  />
                ) : (
                  <div
                    className="absolute inset-0"
                    data-testid="vehicle-gradient-placeholder"
                    style={{
                      background:
                        'linear-gradient(135deg, #1a1c20 0%, #24272d 50%, #12141a 100%)',
                    }}
                  />
                )}
                <div className="absolute inset-0 ring-1 ring-inset ring-[var(--border)]" aria-hidden="true" />
                <div
                  className="absolute inset-0"
                  style={{ boxShadow: 'inset 0 0 60px rgba(0,0,0,0.5)' }}
                  aria-hidden="true"
                />
              </div>
              <div className="p-4">
                <div className="text-[15px] font-semibold text-[var(--text)]">{title}</div>
                <div className="mt-1 text-[12px] text-[var(--text-faint)]">@{v.owner_name}</div>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
