'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createBrowserClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import { ThemeToggle } from './ThemeToggle'

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
    <header className="sticky top-0 z-50 border-b border-border backdrop-blur-md bg-[var(--nav-bg)]">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-7" aria-label="Main navigation">
        {/* Left: brand + nav links */}
        <div className="flex items-center gap-7">
          <Link href="/" className="text-lg font-extrabold tracking-tight text-text-primary" aria-label="Cars & Crews home">
            Cars & Crews
          </Link>
          <div className="hidden items-center gap-5 md:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-[13px] font-medium text-text-muted transition-colors duration-150 hover:text-text-primary"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Right: auth buttons + theme toggle (desktop) */}
        <div className="hidden items-center gap-3 md:flex">
          <ThemeToggle />
          {user ? (
            <>
              <Link
                href="/dashboard"
                className="inline-flex items-center rounded-full bg-accent px-4 py-1.5 text-xs font-semibold text-black transition-colors duration-150 hover:bg-accent-hover"
              >
                Dashboard
              </Link>
              <Link
                href="/settings"
                className="text-[13px] font-medium text-text-muted transition-colors duration-150 hover:text-text-primary"
              >
                Settings
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="text-[13px] font-medium text-text-muted transition-colors duration-150 hover:text-text-primary"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="inline-flex items-center rounded-full bg-accent px-4 py-1.5 text-xs font-semibold text-black transition-colors duration-150 hover:bg-accent-hover"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile: theme toggle + hamburger */}
        <div className="flex items-center gap-1 md:hidden">
          <ThemeToggle />
          <button
            className="inline-flex items-center justify-center rounded-lg p-2 text-text-muted transition-colors hover:bg-surface hover:text-text-primary"
            onClick={() => setMenuOpen((prev) => !prev)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          {menuOpen ? (
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
          ) : (
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" /></svg>
          )}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="border-t border-border px-4 py-4 md:hidden">
          <div className="flex flex-col gap-3">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg px-3 py-2 text-sm font-medium text-text-muted transition-colors duration-150 hover:bg-surface hover:text-text-primary"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-2 border-t border-border pt-3">
              {user ? (
                <div className="flex flex-col gap-2">
                  <Link
                    href="/dashboard"
                    className="block rounded-full bg-accent px-4 py-2 text-center text-sm font-semibold text-black transition-colors duration-150 hover:bg-accent-hover"
                    onClick={() => setMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/settings"
                    className="block rounded-lg px-3 py-2 text-center text-sm font-medium text-text-muted transition-colors duration-150 hover:bg-surface hover:text-text-primary"
                    onClick={() => setMenuOpen(false)}
                  >
                    Settings
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link
                    href="/sign-in"
                    className="block rounded-lg px-3 py-2 text-center text-sm font-medium text-text-muted transition-colors duration-150 hover:bg-surface hover:text-text-primary"
                    onClick={() => setMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/sign-up"
                    className="block rounded-full bg-accent px-4 py-2 text-center text-sm font-semibold text-black transition-colors duration-150 hover:bg-accent-hover"
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
