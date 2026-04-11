import Link from 'next/link'

export interface FeaturedBuild {
  year: number
  make: string
  model: string
  photoUrl: string | null
  slug?: string
  ownerName?: string
}

interface HeroTaglineProps {
  featuredBuild: FeaturedBuild | null
  headline?: string
}

const DEFAULT_HEADLINE = 'Where builds\nlive, loud.'

export function HeroTagline({ featuredBuild, headline = DEFAULT_HEADLINE }: HeroTaglineProps) {
  const bgStyle: React.CSSProperties = featuredBuild?.photoUrl
    ? { backgroundImage: `url(${featuredBuild.photoUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : {}

  return (
    <section className="relative overflow-hidden" style={{ minHeight: '70vh' }}>
      <div
        data-hero-bg="true"
        className="absolute inset-0"
        style={bgStyle}
        aria-hidden="true"
      >
        {!featuredBuild?.photoUrl && (
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse 60% 45% at 72% 55%, rgba(60,70,85,0.45) 0%, transparent 70%), linear-gradient(135deg, #0a0b0d 0%, #14161a 40%, #1c1e24 65%, #0f1113 100%)',
            }}
          />
        )}
      </div>

      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(90deg, rgba(13,14,16,0.96) 0%, rgba(13,14,16,0.7) 48%, rgba(13,14,16,0.15) 100%)',
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto flex min-h-[70vh] max-w-6xl items-center px-6 py-24 sm:px-10 lg:px-16">
        <div className="max-w-2xl">
          {featuredBuild && (
            <p className="display mb-6 flex items-center gap-3 text-[13px] uppercase tracking-[0.2em] text-[var(--text-muted)]">
              <span className="inline-block h-[2px] w-8 bg-[var(--accent)]" aria-hidden="true" />
              FEATURED BUILD · {featuredBuild.year} {featuredBuild.make} {featuredBuild.model}
            </p>
          )}

          <h1
            className="display mb-8 whitespace-pre-line uppercase text-[var(--text)]"
            style={{ fontSize: 'clamp(3rem, 7vw, 6rem)', lineHeight: 0.92 }}
          >
            {headline}
          </h1>

          <div className="flex flex-wrap items-center gap-5">
            <Link
              href="/vehicles"
              className="display inline-flex h-12 items-center bg-[var(--accent)] px-8 text-[17px] uppercase tracking-[0.1em] text-[var(--accent-ink)] transition-colors hover:bg-[var(--accent-hover)]"
            >
              Explore Builds
            </Link>
            <Link
              href="/garage/new"
              className="display text-[15px] uppercase tracking-[0.1em] text-[var(--text-muted)] transition-colors hover:text-[var(--accent)]"
            >
              Submit Your Build →
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
