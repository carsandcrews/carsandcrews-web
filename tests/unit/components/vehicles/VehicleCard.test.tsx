import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { VehicleCard } from '@/components/vehicles/VehicleCard'

describe('VehicleCard', () => {
  const baseProps = {
    year: 1969,
    make: 'Chevrolet',
    model: 'Camaro',
    statusTag: 'restored' as const,
    slug: '1969-chevrolet-camaro',
    photoUrl: 'https://example.com/camaro.jpg',
    ownerName: 'John Doe'
  }

  it('renders vehicle info', () => {
    render(<VehicleCard {...baseProps} />)
    expect(screen.getByText(/1969 Chevrolet Camaro/)).toBeInTheDocument()
  })

  it('renders status badge', () => {
    render(<VehicleCard {...baseProps} />)
    expect(screen.getByText('Restored')).toBeInTheDocument()
  })

  it('renders photo', () => {
    render(<VehicleCard {...baseProps} />)
    expect(screen.getByAltText(/1969 Chevrolet Camaro/)).toBeInTheDocument()
  })

  it('renders owner name', () => {
    render(<VehicleCard {...baseProps} />)
    expect(screen.getByText(/John Doe/)).toBeInTheDocument()
  })

  it('links to vehicle detail page', () => {
    render(<VehicleCard {...baseProps} />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/vehicles/1969-chevrolet-camaro')
  })

  it('renders placeholder when no photo', () => {
    render(<VehicleCard {...baseProps} photoUrl={null} />)
    expect(screen.getByText(/1969 Chevrolet Camaro/)).toBeInTheDocument()
  })
})
