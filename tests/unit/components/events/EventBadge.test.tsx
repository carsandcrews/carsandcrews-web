import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { EventBadge } from '@/components/events/EventBadge'

describe('EventBadge', () => {
  it('renders the event type label', () => {
    render(<EventBadge type="car_show" />)
    expect(screen.getByText('Car Show')).toBeInTheDocument()
  })

  it('renders cars_and_coffee label', () => {
    render(<EventBadge type="cars_and_coffee" />)
    expect(screen.getByText('Cars & Coffee')).toBeInTheDocument()
  })

  it('renders charity indicator when is_charity is true', () => {
    render(<EventBadge type="car_show" isCharity />)
    expect(screen.getByText('Charity')).toBeInTheDocument()
  })

  it('does not render charity indicator by default', () => {
    render(<EventBadge type="car_show" />)
    expect(screen.queryByText('Charity')).not.toBeInTheDocument()
  })
})
