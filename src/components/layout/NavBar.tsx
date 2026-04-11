'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createBrowserClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

const NAV_LINKS = [
  { label: 'Events', href: '/events' },
  { label: 'Vehicles', href: '/vehicles' },
  { label: 'Map', href: '/events/map' },
]

export function NavBar() {
  const [user, setUser] = useState<User | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const supabase = createBrowserClient()
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
    })
  }, [])

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--nav-bg)] backdrop-blur-md">
      <nav
        className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 sm:px-10 lg:px-16"
        aria-label="Main navigation"
      >
        {/* Left: brand + nav links */}
        <div className="flex items-center gap-10">
          <Link href="/" className="group flex items-center gap-3" aria-label="Cars & Crews home">
            <span
              className="relative inline-flex h-7 w-7 items-center justify-center bg-[var(--accent)]"
              style={{ transform: 'skew(-8deg)' }}
              aria-hidden="true"
            >
              <img src="/logo.png" alt="" className="h-5 w-auto" style={{ transform: 'skew(8deg)' }} />
            </span>
            <span className="display text-[20px] uppercase tracking-[0.1em] text-[var(--text)]">
              Cars &amp; Crews
            </span>
          </Link>
          <div className="hidden items-center gap-7 md:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="display text-[15px] uppercase tracking-[0.12em] text-[var(--text-muted)] transition-colors hover:text-[var(--text)]"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Right: auth buttons (desktop) */}
        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <>
              <Link
                href="/dashboard"
                className="display inline-flex h-10 items-center bg-[var(--accent)] px-5 text-[14px] uppercase tracking-[0.1em] text-[var(--accent-ink)] transition-colors hover:bg-[var(--accent-hover)]"
              >
                Dashboard
              </Link>
              <Link
                href="/settings"
                className="display text-[14px] uppercase tracking-[0.12em] text-[var(--text-muted)] transition-colors hover:text-[var(--text)]"
              >
                Settings
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="display text-[14px] uppercase tracking-[0.12em] text-[var(--text-muted)] transition-colors hover:text-[var(--text)]"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="display inline-flex h-10 items-center bg-[var(--accent)] px-5 text-[14px] uppercase tracking-[0.1em] text-[var(--accent-ink)] transition-colors hover:bg-[var(--accent-hover)]"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile: hamburger */}
        <div className="flex items-center gap-1 md:hidden">
          <button
            className="inline-flex items-center justify-center p-2 text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            {menuOpen ? (
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            )}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="border-t border-[var(--border)] bg-[var(--bg)] px-6 py-5 md:hidden">
          <div className="flex flex-col gap-3">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="display px-3 py-2 text-[15px] uppercase tracking-[0.12em] text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-2 border-t border-[var(--border)] pt-3">
              {user ? (
                <div className="flex flex-col gap-2">
                  <Link
                    href="/dashboard"
                    className="display block bg-[var(--accent)] px-4 py-3 text-center text-[14px] uppercase tracking-[0.1em] text-[var(--accent-ink)] transition-colors hover:bg-[var(--accent-hover)]"
                    onClick={() => setMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/settings"
                    className="display block px-3 py-2 text-center text-[14px] uppercase tracking-[0.12em] text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
                    onClick={() => setMenuOpen(false)}
                  >
                    Settings
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link
                    href="/sign-in"
                    className="display block px-3 py-2 text-center text-[14px] uppercase tracking-[0.12em] text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
                    onClick={() => setMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/sign-up"
                    className="display block bg-[var(--accent)] px-4 py-3 text-center text-[14px] uppercase tracking-[0.1em] text-[var(--accent-ink)] transition-colors hover:bg-[var(--accent-hover)]"
                    onClick={() => setMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
