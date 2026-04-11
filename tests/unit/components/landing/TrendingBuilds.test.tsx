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
    expect(screen.getByRole('heading', { name: /Latest Builds/i })).toBeInTheDocument()
  })

  it('renders full vehicle names', () => {
    render(<TrendingBuilds vehicles={mockVehicles} />)
    expect(screen.getByText('1969 Chevrolet Camaro SS')).toBeInTheDocument()
    expect(screen.getByText('1957 Chevrolet Bel Air')).toBeInTheDocument()
  })

  it('renders owner names', () => {
    render(<TrendingBuilds vehicles={mockVehicles} />)
    expect(screen.getByText('@mike_builds')).toBeInTheDocument()
    expect(screen.getByText('@classic_joe')).toBeInTheDocument()
  })

  it('links to profile vehicle detail pages', () => {
    render(<TrendingBuilds vehicles={mockVehicles} />)
    const links = screen.getAllByRole('link')
    const vehicleLink = links.find((l) => l.getAttribute('href') === '/@mike_builds/69-camaro-ss')
    expect(vehicleLink).toBeTruthy()
  })

  it('renders "View All" link to /vehicles', () => {
    render(<TrendingBuilds vehicles={mockVehicles} />)
    const viewAll = screen.getByText(/View All/i)
    expect(viewAll.closest('a')).toHaveAttribute('href', '/vehicles')
  })

  it('renders image when photo_url is provided', () => {
    render(<TrendingBuilds vehicles={mockVehicles} />)
    const img = screen.getByAltText('1957 Chevrolet Bel Air')
    expect(img).toHaveAttribute('src', 'https://example.com/belair.jpg')
  })

  it('renders gradient placeholder when no photo', () => {
    render(<TrendingBuilds vehicles={[mockVehicles[0]]} />)
    expect(screen.getByTestId('vehicle-gradient-placeholder')).toBeInTheDocument()
  })

  it('renders placeholder vehicles when given empty array', () => {
    render(<TrendingBuilds vehicles={[]} />)
    expect(screen.getByText('1969 Chevrolet Camaro SS')).toBeInTheDocument()
    expect(screen.getByText('1957 Chevrolet Bel Air')).toBeInTheDocument()
  })
})
