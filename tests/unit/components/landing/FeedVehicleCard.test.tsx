import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { FeedVehicleCard } from '@/components/landing/FeedVehicleCard'

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  )
}))

describe('FeedVehicleCard', () => {
  const baseProps = {
    year: 1957,
    make: 'Chevrolet',
    model: 'Bel Air',
    slug: '1957-chevrolet-bel-air',
    photoUrl: null,
    ownerName: 'classic_joe',
  }

  it('renders the vehicle title with abbreviated year', () => {
    render(<FeedVehicleCard {...baseProps} />)
    expect(screen.getByText("'57 Chevrolet Bel Air")).toBeInTheDocument()
  })

  it('renders the owner name', () => {
    render(<FeedVehicleCard {...baseProps} />)
    expect(screen.getByText('@classic_joe')).toBeInTheDocument()
  })

  it('renders view build link text', () => {
    render(<FeedVehicleCard {...baseProps} />)
    expect(screen.getByText(/View Build/)).toBeInTheDocument()
  })

  it('links to the vehicle detail page', () => {
    render(<FeedVehicleCard {...baseProps} />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/vehicles/1957-chevrolet-bel-air')
  })

  it('renders gradient placeholder when no photo', () => {
    const { container } = render(<FeedVehicleCard {...baseProps} />)
    const gradientDiv = container.querySelector('[class*="bg-gradient"]')
    expect(gradientDiv).toBeInTheDocument()
  })

  it('renders image when photoUrl is provided', () => {
    render(<FeedVehicleCard {...baseProps} photoUrl="https://example.com/car.jpg" />)
    const img = screen.getByAltText('1957 Chevrolet Bel Air')
    expect(img).toHaveAttribute('src', 'https://example.com/car.jpg')
  })
})
