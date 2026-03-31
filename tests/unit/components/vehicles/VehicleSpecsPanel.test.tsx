import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { VehicleSpecsPanel } from '@/components/vehicles/VehicleSpecsPanel'

describe('VehicleSpecsPanel', () => {
  it('renders specs when provided', () => {
    render(<VehicleSpecsPanel engine="350 V8" transmission="4-speed" drivetrain="RWD" paintColor="Rally Green" interior="Black vinyl" wheelsTires="15 inch Rally" />)
    expect(screen.getByText('350 V8')).toBeInTheDocument()
    expect(screen.getByText('4-speed')).toBeInTheDocument()
    expect(screen.getByText('RWD')).toBeInTheDocument()
    expect(screen.getByText('Rally Green')).toBeInTheDocument()
  })

  it('renders section heading', () => {
    render(<VehicleSpecsPanel engine="350 V8" />)
    expect(screen.getByText(/Specs/i)).toBeInTheDocument()
  })

  it('renders nothing when all specs are empty', () => {
    const { container } = render(<VehicleSpecsPanel />)
    expect(container.innerHTML).toBe('')
  })
})
