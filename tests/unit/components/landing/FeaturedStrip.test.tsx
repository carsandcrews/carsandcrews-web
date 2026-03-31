import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { FeaturedStrip } from '@/components/landing/FeaturedStrip'

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  )
}))

describe('FeaturedStrip', () => {
  const mockEvent = {
    name: 'Cars & Coffee at The Domain',
    date: '2026-04-05',
    city: 'Austin',
    state: 'TX',
    slug: 'cars-and-coffee-at-the-domain',
    stateCode: 'tx',
    bannerUrl: null,
  }

  const mockVehicle = {
    year: 1969,
    make: 'Chevrolet',
    model: 'Camaro SS',
    slug: '1969-chevrolet-camaro-ss',
    photoUrl: null,
    ownerName: 'mike_builds',
    statusTag: 'Restored',
  }

  it('renders event name', () => {
    render(<FeaturedStrip event={mockEvent} vehicle={mockVehicle} />)
    expect(screen.getByText('Cars & Coffee at The Domain')).toBeInTheDocument()
  })

  it('renders event location', () => {
    render(<FeaturedStrip event={mockEvent} vehicle={mockVehicle} />)
    expect(screen.getByText(/Austin, TX/)).toBeInTheDocument()
  })

  it('renders vehicle info', () => {
    render(<FeaturedStrip event={mockEvent} vehicle={mockVehicle} />)
    expect(screen.getByText("'69 Chevrolet Camaro SS")).toBeInTheDocument()
  })

  it('renders call-to-action buttons', () => {
    render(<FeaturedStrip event={mockEvent} vehicle={mockVehicle} />)
    expect(screen.getByText("I'm Going")).toBeInTheDocument()
    expect(screen.getByText('Details')).toBeInTheDocument()
  })

  it('renders trending build label', () => {
    render(<FeaturedStrip event={mockEvent} vehicle={mockVehicle} />)
    expect(screen.getByText('Trending Build')).toBeInTheDocument()
  })

  it('renders fallback content when no event or vehicle', () => {
    render(<FeaturedStrip event={null} vehicle={null} />)
    expect(screen.getByText('Cars & Coffee at The Domain')).toBeInTheDocument()
    expect(screen.getByText("'69 Camaro SS")).toBeInTheDocument()
  })

  it('links to event detail page', () => {
    render(<FeaturedStrip event={mockEvent} vehicle={mockVehicle} />)
    const links = screen.getAllByRole('link')
    const goingLink = links.find(l => l.textContent === "I'm Going")
    expect(goingLink).toHaveAttribute('href', '/events/tx/cars-and-coffee-at-the-domain')
  })
})
