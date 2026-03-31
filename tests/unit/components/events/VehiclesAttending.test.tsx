import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { VehiclesAttending } from '@/components/events/VehiclesAttending'

describe('VehiclesAttending', () => {
  const vehicles = [
    { id: 'v1', year: 1969, make: 'Chevrolet', model: 'Camaro', thumbnail_url: 'https://example.com/camaro.jpg' },
    { id: 'v2', year: 1970, make: 'Ford', model: 'Mustang', thumbnail_url: null }
  ]

  it('renders vehicles with photos and names', () => {
    render(<VehiclesAttending vehicles={vehicles} />)
    expect(screen.getByText(/1969 Chevrolet Camaro/)).toBeInTheDocument()
    expect(screen.getByText(/1970 Ford Mustang/)).toBeInTheDocument()
    expect(screen.getByAltText(/1969 Chevrolet Camaro/)).toBeInTheDocument()
  })

  it('renders section heading', () => {
    render(<VehiclesAttending vehicles={vehicles} />)
    expect(screen.getByText(/Vehicles Attending/i)).toBeInTheDocument()
  })

  it('renders nothing when no vehicles', () => {
    const { container } = render(<VehiclesAttending vehicles={[]} />)
    expect(container.innerHTML).toBe('')
  })
})
