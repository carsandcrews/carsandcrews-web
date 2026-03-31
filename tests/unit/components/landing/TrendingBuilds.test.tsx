import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TrendingBuilds } from '@/components/landing/TrendingBuilds'

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  )
}))

const mockVehicles = [
  { year: 1969, make: 'Chevrolet', model: 'Camaro SS', slug: '69-camaro-ss', photo_url: null, owner_name: 'mike_builds' },
  { year: 1957, make: 'Chevrolet', model: 'Bel Air', slug: '57-bel-air', photo_url: 'https://example.com/belair.jpg', owner_name: 'classic_joe' },
]

describe('TrendingBuilds', () => {
  it('renders section header', () => {
    render(<TrendingBuilds vehicles={mockVehicles} />)
    expect(screen.getByText('Trending Builds')).toBeInTheDocument()
  })

  it('renders vehicle names with abbreviated years', () => {
    render(<TrendingBuilds vehicles={mockVehicles} />)
    expect(screen.getByText("'69 Chevrolet Camaro SS")).toBeInTheDocument()
    expect(screen.getByText("'57 Chevrolet Bel Air")).toBeInTheDocument()
  })

  it('renders owner names', () => {
    render(<TrendingBuilds vehicles={mockVehicles} />)
    expect(screen.getByText('@mike_builds')).toBeInTheDocument()
    expect(screen.getByText('@classic_joe')).toBeInTheDocument()
  })

  it('links to vehicle detail pages', () => {
    render(<TrendingBuilds vehicles={mockVehicles} />)
    const links = screen.getAllByRole('link')
    const vehicleLink = links.find(l => l.getAttribute('href') === '/vehicles/69-camaro-ss')
    expect(vehicleLink).toBeTruthy()
  })

  it('renders "See all" link to vehicles page', () => {
    render(<TrendingBuilds vehicles={mockVehicles} />)
    const seeAll = screen.getByText(/See all/)
    expect(seeAll.closest('a')).toHaveAttribute('href', '/vehicles')
  })

  it('renders image when photo_url is provided', () => {
    render(<TrendingBuilds vehicles={mockVehicles} />)
    const img = screen.getByAltText('1957 Chevrolet Bel Air')
    expect(img).toHaveAttribute('src', 'https://example.com/belair.jpg')
  })

  it('renders gradient placeholder when no photo', () => {
    const { container } = render(<TrendingBuilds vehicles={[mockVehicles[0]]} />)
    const gradientDiv = container.querySelector('[class*="bg-gradient"]')
    expect(gradientDiv).toBeInTheDocument()
  })

  it('renders placeholder vehicles when given empty array', () => {
    render(<TrendingBuilds vehicles={[]} />)
    expect(screen.getByText("'69 Chevrolet Camaro SS")).toBeInTheDocument()
    expect(screen.getByText("'57 Chevrolet Bel Air")).toBeInTheDocument()
  })
})
