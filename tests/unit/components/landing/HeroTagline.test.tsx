import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { HeroTagline } from '@/components/landing/HeroTagline'

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  )
}))

describe('HeroTagline', () => {
  const featuredBuild = {
    year: 1969,
    make: 'Pontiac',
    model: 'GTO',
    photoUrl: 'https://cdn.example.com/gto.jpg',
  }

  it('renders a level-1 heading', () => {
    render(<HeroTagline featuredBuild={featuredBuild} />)
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
  })

  it('renders the featured-build eyebrow when a build is provided', () => {
    render(<HeroTagline featuredBuild={featuredBuild} />)
    expect(screen.getByText(/FEATURED BUILD/)).toBeInTheDocument()
    expect(screen.getByText(/1969 Pontiac GTO/)).toBeInTheDocument()
  })

  it('renders the primary CTA linking to /vehicles', () => {
    render(<HeroTagline featuredBuild={featuredBuild} />)
    const cta = screen.getByRole('link', { name: /explore builds/i })
    expect(cta).toHaveAttribute('href', '/vehicles')
  })

  it('renders the secondary Submit Your Build link', () => {
    render(<HeroTagline featuredBuild={featuredBuild} />)
    const link = screen.getByRole('link', { name: /submit your build/i })
    expect(link).toHaveAttribute('href', '/garage/new')
  })

  it('falls back gracefully when featuredBuild is null', () => {
    render(<HeroTagline featuredBuild={null} />)
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
    expect(screen.queryByText(/FEATURED BUILD/)).not.toBeInTheDocument()
  })

  it('uses the featured build photo as a background image when provided', () => {
    const { container } = render(<HeroTagline featuredBuild={featuredBuild} />)
    const bg = container.querySelector('[data-hero-bg="true"]') as HTMLElement
    expect(bg).not.toBeNull()
    expect(bg.style.backgroundImage).toContain('gto.jpg')
  })
})
