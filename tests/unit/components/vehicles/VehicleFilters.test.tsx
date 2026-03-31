import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { VehicleFilters } from '@/components/vehicles/VehicleFilters'

describe('VehicleFilters', () => {
  it('renders make filter', () => {
    render(<VehicleFilters selectedMake="" selectedEra="" selectedStatus="" onFilterChange={vi.fn()} />)
    expect(screen.getByLabelText(/Make/i)).toBeInTheDocument()
  })

  it('renders era filter', () => {
    render(<VehicleFilters selectedMake="" selectedEra="" selectedStatus="" onFilterChange={vi.fn()} />)
    expect(screen.getByLabelText(/Era/i)).toBeInTheDocument()
  })

  it('renders status filter', () => {
    render(<VehicleFilters selectedMake="" selectedEra="" selectedStatus="" onFilterChange={vi.fn()} />)
    expect(screen.getByLabelText(/Status/i)).toBeInTheDocument()
  })

  it('calls onFilterChange when make changes', () => {
    const onChange = vi.fn()
    render(<VehicleFilters selectedMake="" selectedEra="" selectedStatus="" onFilterChange={onChange} />)
    fireEvent.change(screen.getByLabelText(/Make/i), { target: { value: 'Chevrolet' } })
    expect(onChange).toHaveBeenCalledWith('make', 'Chevrolet')
  })
})
