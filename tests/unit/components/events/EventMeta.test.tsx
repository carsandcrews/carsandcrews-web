import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { EventMeta } from '@/components/events/EventMeta'

describe('EventMeta', () => {
  const baseProps = {
    date: '2026-04-05',
    endDate: null,
    startTime: '08:00',
    endTime: '12:00',
    city: 'Austin',
    state: 'TX',
    locationName: 'The Domain',
    address: '11410 Century Oaks Terrace',
    rsvpCount: 42
  }

  it('renders the formatted date', () => {
    render(<EventMeta {...baseProps} />)
    expect(screen.getByText(/Apr 5, 2026/)).toBeInTheDocument()
  })

  it('renders the location', () => {
    render(<EventMeta {...baseProps} />)
    expect(screen.getByText(/The Domain/)).toBeInTheDocument()
    expect(screen.getByText(/Austin, TX/)).toBeInTheDocument()
  })

  it('renders RSVP count', () => {
    render(<EventMeta {...baseProps} />)
    expect(screen.getByText(/42 going/)).toBeInTheDocument()
  })

  it('renders time range', () => {
    render(<EventMeta {...baseProps} />)
    expect(screen.getByText(/8 AM/)).toBeInTheDocument()
  })
})
