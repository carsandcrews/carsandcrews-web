import Link from 'next/link'

const FOOTER_LINKS = [
  { label: 'Events', href: '/events' },
  { label: 'Vehicles', href: '/vehicles' },
  { label: 'Map', href: '/events/map' },
]

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="mt-auto border-t border-[var(--border)] bg-[var(--surface)]">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-6 py-10 sm:flex-row sm:justify-between sm:px-10 lg:px-16">
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="display text-[18px] uppercase tracking-[0.1em] text-[var(--text)]"
          >
            Cars &amp; Crews
          </Link>
          <div className="flex gap-5">
            {FOOTER_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="display text-[12px] uppercase tracking-[0.12em] text-[var(--text-muted)] transition-colors hover:text-[var(--accent)]"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
        <p className="text-[11px] text-[var(--text-faint)]">
          &copy; {year} Cars &amp; Crews · Where builds live
        </p>
      </div>
    </footer>
  )
}
