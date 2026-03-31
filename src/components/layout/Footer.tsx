import Link from 'next/link'

const FOOTER_LINKS = [
  { label: 'Events', href: '/events' },
  { label: 'Vehicles', href: '/vehicles' },
  { label: 'Map', href: '/events/map' },
]

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="mt-auto border-t border-border bg-bg">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-8 sm:flex-row sm:justify-between sm:px-6 lg:px-7">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-sm font-bold text-text-primary">
            Cars & Crews
          </Link>
          <div className="flex gap-4">
            {FOOTER_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xs text-text-faint transition-colors duration-150 hover:text-text-muted"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
        <p className="text-xs text-text-faint">
          &copy; {year} Cars & Crews. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
