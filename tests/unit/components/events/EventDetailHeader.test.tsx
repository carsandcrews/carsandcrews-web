import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { EventDetailHeader } from '@/components/events/EventDetailHeader'

describe('EventDetailHeader', () => {
  const baseProps = {
    name: 'Cars & Coffee at The Domain',
    bannerUrl: null,
    eventType: 'cars_and_coffee' as const,
    isCharity: false
  }

  it('renders the event name', () => {
    render(<EventDetailHeader {...baseProps} />)
    expect(screen.getByRole('heading', { name: 'Cars & Coffee at The Domain' })).toBeInTheDocument()
  })

  it('renders the event type badge', () => {
    render(<EventDetailHeader {...baseProps} />)
    expect(screen.getByText('Cars & Coffee', { selector: 'span' })).toBeInTheDocument()
  })

  it('renders claim link when event is unclaimed', () => {
    render(<EventDetailHeader {...baseProps} claimed={false} />)
    expect(screen.getByText(/Claim this event/)).toBeInTheDocument()
  })

  it('does not render claim link when event is claimed', () => {
    render(<EventDetailHeader {...baseProps} claimed={true} />)
    expect(screen.queryByText(/Claim this event/)).not.toBeInTheDocument()
  })
})
