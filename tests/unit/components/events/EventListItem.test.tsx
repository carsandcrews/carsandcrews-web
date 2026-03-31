import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { EventListItem } from '@/components/events/EventListItem'

describe('EventListItem', () => {
  const baseProps = {
    name: 'Saturday Cruise-In at Sonic',
    date: '2026-04-05',
    city: 'Round Rock',
    state: 'TX',
    eventType: 'cruise_in' as const,
    slug: 'saturday-cruise-in-at-sonic',
    stateCode: 'tx'
  }

  it('renders the event name', () => {
    render(<EventListItem {...baseProps} />)
    expect(screen.getByText('Saturday Cruise-In at Sonic')).toBeInTheDocument()
  })

  it('renders the date accent with month and day', () => {
    render(<EventListItem {...baseProps} />)
    expect(screen.getByText('APR')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('renders the location', () => {
    render(<EventListItem {...baseProps} />)
    expect(screen.getByText(/Round Rock, TX/)).toBeInTheDocument()
  })

  it('renders the event type label', () => {
    render(<EventListItem {...baseProps} eventType="car_show" />)
    expect(screen.getByText(/Car Show/)).toBeInTheDocument()
  })

  it('links to the event detail page', () => {
    render(<EventListItem {...baseProps} />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/events/tx/saturday-cruise-in-at-sonic')
  })
})
