import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { VehicleDetailHeader } from '@/components/vehicles/VehicleDetailHeader'

describe('VehicleDetailHeader', () => {
  const baseProps = {
    year: 1969,
    make: 'Chevrolet',
    model: 'Camaro',
    statusTag: 'restored' as const,
    heroPhotoUrl: 'https://example.com/camaro.jpg',
    ownerName: 'John Doe',
    ownerUsername: 'johndoe'
  }

  it('renders vehicle year make model as heading', () => {
    render(<VehicleDetailHeader {...baseProps} />)
    expect(screen.getByRole('heading', { name: /1969 Chevrolet Camaro/ })).toBeInTheDocument()
  })

  it('renders status badge', () => {
    render(<VehicleDetailHeader {...baseProps} />)
    expect(screen.getByText('Restored')).toBeInTheDocument()
  })

  it('renders hero photo', () => {
    render(<VehicleDetailHeader {...baseProps} />)
    expect(screen.getByAltText(/1969 Chevrolet Camaro/)).toBeInTheDocument()
  })

  it('renders owner link', () => {
    render(<VehicleDetailHeader {...baseProps} />)
    expect(screen.getByText(/John Doe/)).toBeInTheDocument()
  })

  it('renders without hero photo', () => {
    render(<VehicleDetailHeader {...baseProps} heroPhotoUrl={null} />)
    expect(screen.getByRole('heading', { name: /1969 Chevrolet Camaro/ })).toBeInTheDocument()
  })
})
