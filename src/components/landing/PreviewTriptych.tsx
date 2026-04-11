import Link from 'next/link'

export interface PreviewEvent {
  name: string
  dateLabel: string
  distanceLabel: string | null
  href: string
}

export interface PreviewBuild {
  title: string
  subtitle: string
  href: string
}

interface PreviewTriptychProps {
  nextEvent: PreviewEvent | null
  latestBuild: PreviewBuild | null
  freshBuild: PreviewBuild | null
}

interface CardProps {
  eyebrow: string
  title: string
  meta: string
  href: string
}

function Card({ eyebrow, title, meta, href }: CardProps) {
  return (
    <Link
      href={href}
      className="group flex min-h-[160px] flex-col border-t-2 border-[var(--accent)] bg-[var(--surface)] p-6 transition-colors hover:bg-[var(--surface-2)]"
    >
      <div className="display mb-3 text-[12px] uppercase tracking-[0.18em] text-[var(--accent)]">
        {eyebrow}
      </div>
      <div className="mb-2 text-[17px] font-semibold leading-snug text-[var(--text)]">
        {title}
      </div>
      <div className="mt-auto flex items-center justify-between border-t border-[var(--border)] pt-3 text-[12px] text-[var(--text-faint)]">
        <span>{meta}</span>
        <span className="text-[var(--text-muted)] transition-transform group-hover:translate-x-1">→</span>
      </div>
    </Link>
  )
}

export function PreviewTriptych({ nextEvent, latestBuild, freshBuild }: PreviewTriptychProps) {
  const eventCard: CardProps = nextEvent
    ? {
        eyebrow: 'NEXT EVENT NEAR YOU',
        title: nextEvent.name,
        meta: [nextEvent.dateLabel, nextEvent.distanceLabel].filter(Boolean).join(' · '),
        href: nextEvent.href,
      }
    : {
        eyebrow: 'NO SHOWS NEARBY',
        title: 'Browse all events →',
        meta: 'Find one to attend',
        href: '/events',
      }

  const latestCard: CardProps = latestBuild
    ? {
        eyebrow: 'LATEST BUILD',
        title: latestBuild.title,
        meta: latestBuild.subtitle,
        href: latestBuild.href,
      }
    : {
        eyebrow: 'NO BUILDS YET',
        title: 'Be the first — add your build →',
        meta: 'Start your garage',
        href: '/garage/new',
      }

  const freshCard: CardProps = freshBuild
    ? {
        eyebrow: 'FRESH IN THE GARAGE',
        title: freshBuild.title,
        meta: freshBuild.subtitle,
        href: freshBuild.href,
      }
    : {
        eyebrow: 'THE GARAGE IS EMPTY',
        title: 'Submit a build →',
        meta: 'Be the first',
        href: '/garage/new',
      }

  return (
    <div className="relative z-20 mx-auto -mt-16 grid max-w-6xl grid-cols-1 gap-4 px-6 sm:px-10 md:grid-cols-3 lg:px-16">
      <Card {...eventCard} />
      <Card {...latestCard} />
      <Card {...freshCard} />
    </div>
  )
}
