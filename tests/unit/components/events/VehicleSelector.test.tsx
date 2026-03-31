import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { VehicleSelector } from '@/components/events/VehicleSelector'

vi.mock('@/lib/supabase/client', () => ({
  createBrowserClient: () => ({
    from: () => ({
      select: () => ({
        eq: vi.fn().mockResolvedValue({ data: [], error: null })
      })
    })
  })
}))

describe('VehicleSelector', () => {
  const vehicles = [
    { id: 'v1', year: 1969, make: 'Chevrolet', model: 'Camaro', thumbnail_url: null },
    { id: 'v2', year: 1970, make: 'Ford', model: 'Mustang', thumbnail_url: null }
  ]

  it('renders vehicle options', () => {
    render(<VehicleSelector vehicles={vehicles} selectedId={null} onSelect={vi.fn()} />)
    expect(screen.getByText(/1969 Chevrolet Camaro/)).toBeInTheDocument()
    expect(screen.getByText(/1970 Ford Mustang/)).toBeInTheDocument()
  })

  it('renders prompt text', () => {
    render(<VehicleSelector vehicles={vehicles} selectedId={null} onSelect={vi.fn()} />)
    expect(screen.getByText(/Bringing a vehicle\?/i)).toBeInTheDocument()
  })

  it('highlights selected vehicle', () => {
    render(<VehicleSelector vehicles={vehicles} selectedId="v1" onSelect={vi.fn()} />)
    const selected = screen.getByText(/1969 Chevrolet Camaro/).closest('button')
    expect(selected?.className).toContain('border-amber-500')
  })

  it('renders nothing when no vehicles', () => {
    const { container } = render(<VehicleSelector vehicles={[]} selectedId={null} onSelect={vi.fn()} />)
    expect(container.innerHTML).toBe('')
  })
})
