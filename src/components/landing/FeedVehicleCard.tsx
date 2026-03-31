import Link from 'next/link'

interface FeedVehicleCardProps {
  year: number
  make: string
  model: string
  slug: string
  photoUrl: string | null
  ownerName: string
  ownerUsername?: string
  aspect?: '21/9' | '16/10' | '4/3'
}

export function FeedVehicleCard({ year, make, model, slug, photoUrl, ownerName, ownerUsername, aspect = '21/9' }: FeedVehicleCardProps) {
  const title = `'${String(year).slice(-2)} ${make} ${model}`
  const linkUsername = ownerUsername || ownerName

  return (
    <Link href={`/@${linkUsername}/${slug}`} className="group my-5 block overflow-hidden rounded-2xl">
      <div className="relative overflow-hidden" style={{ aspectRatio: aspect }}>
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={`${year} ${make} ${model}`}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#3a2828] via-[#4a2020] to-[#1a1218]" />
        )}
        <div className="absolute inset-0" style={{ boxShadow: 'inset 0 0 50px rgba(0,0,0,0.3)' }} />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-4 pt-10">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-base font-bold text-white">{title}</p>
              <p className="mt-0.5 text-xs text-[#aaa]">@{ownerName}</p>
            </div>
            <span className="text-xs font-semibold text-[#60a5fa] transition-colors duration-150 group-hover:text-[#93bbfd]">
              View Build &rarr;
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
