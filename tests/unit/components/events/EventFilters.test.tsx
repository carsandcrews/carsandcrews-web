import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { EventFilters } from '@/components/events/EventFilters'

describe('EventFilters', () => {
  it('renders all event type filter chips', () => {
    render(<EventFilters selectedTypes={[]} onTypeToggle={() => {}} />)
    expect(screen.getByText('Car Show')).toBeInTheDocument()
    expect(screen.getByText('Cars & Coffee')).toBeInTheDocument()
    expect(screen.getByText('Cruise-In')).toBeInTheDocument()
    expect(screen.getByText('Cruise')).toBeInTheDocument()
    expect(screen.getByText('Swap Meet')).toBeInTheDocument()
  })

  it('highlights selected type chips', () => {
    render(<EventFilters selectedTypes={['car_show']} onTypeToggle={() => {}} />)
    const chip = screen.getByText('Car Show')
    expect(chip.closest('button')).toHaveClass('bg-amber-500/10')
  })

  it('calls onTypeToggle when a chip is clicked', () => {
    const onToggle = vi.fn()
    render(<EventFilters selectedTypes={[]} onTypeToggle={onToggle} />)
    fireEvent.click(screen.getByText('Car Show'))
    expect(onToggle).toHaveBeenCalledWith('car_show')
  })
})
