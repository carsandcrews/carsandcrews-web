import Link from 'next/link'

interface ActionCardsProps {
  eventCount: number
}

const cards = [
  {
    icon: '\u{1F4C5}',
    title: 'Find Events',
    description: 'Car shows, cruise-ins, and meets near you',
    href: '/events',
    gradient: 'from-[#1a1a3e] to-[#0f2040]',
    border: 'border-accent/15',
    accentColor: 'text-accent',
    ctaPrefix: null as string | null,
    ctaSuffix: 'events \u2192',
  },
  {
    icon: '\u{1F3CE}\uFE0F',
    title: 'Browse Builds',
    description: 'Restored, modified, barn finds, and survivors',
    href: '/vehicles',
    gradient: 'from-[#2a1a1a] to-[#1a1018]',
    border: 'border-[#60a5fa]/15',
    accentColor: 'text-[#60a5fa]',
    ctaPrefix: null as string | null,
    ctaSuffix: 'Explore garage \u2192',
  },
  {
    icon: '\u{1F465}',
    title: 'Join the Crew',
    description: 'Connect with local enthusiasts and clubs',
    href: '/sign-up',
    gradient: 'from-[#1a2a1a] to-[#0f1a10]',
    border: 'border-[#10b981]/15',
    accentColor: 'text-[#10b981]',
    ctaPrefix: null as string | null,
    ctaSuffix: 'Sign up free \u2192',
  },
] as const

export function ActionCards({ eventCount }: ActionCardsProps) {
  const formattedCount = eventCount > 0
    ? `${eventCount.toLocaleString()} events \u2192`
    : cards[0].ctaSuffix

  return (
    <div className="flex flex-col gap-3 px-4 py-6 sm:flex-row sm:px-7">
      {cards.map((card, i) => (
        <Link
          key={card.title}
          href={card.href}
          className={`flex-1 rounded-2xl border ${card.border} bg-gradient-to-br ${card.gradient} p-5 transition-colors duration-150 hover:brightness-110`}
        >
          <div className="mb-2.5 text-2xl">{card.icon}</div>
          <div className="mb-1 text-[15px] font-bold text-white">{card.title}</div>
          <div className="text-[11px] leading-relaxed text-text-muted">{card.description}</div>
          <div className={`mt-3.5 text-[11px] font-semibold ${card.accentColor}`}>
            {i === 0 ? formattedCount : card.ctaSuffix}
          </div>
        </Link>
      ))}
    </div>
  )
}
