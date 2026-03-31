import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { FeedEventRow } from '@/components/landing/FeedEventRow'

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  )
}))

describe('FeedEventRow', () => {
  const baseProps = {
    name: 'Saturday Cruise-In at Sonic',
    date: '2026-04-05',
    city: 'Round Rock',
    state: 'TX',
    eventType: 'Cruise-In',
    slug: 'saturday-cruise-in-at-sonic',
    stateCode: 'tx',
  }

  it('renders the event name', () => {
    render(<FeedEventRow {...baseProps} />)
    expect(screen.getByText('Saturday Cruise-In at Sonic')).toBeInTheDocument()
  })

  it('renders month and day accent', () => {
    render(<FeedEventRow {...baseProps} />)
    expect(screen.getByText('APR')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('renders location and event type', () => {
    render(<FeedEventRow {...baseProps} />)
    expect(screen.getByText(/Round Rock, TX/)).toBeInTheDocument()
    expect(screen.getByText(/Round Rock, TX · Cruise-In/)).toBeInTheDocument()
  })

  it('renders RSVP action', () => {
    render(<FeedEventRow {...baseProps} />)
    expect(screen.getByText('RSVP')).toBeInTheDocument()
  })

  it('links to the event detail page', () => {
    render(<FeedEventRow {...baseProps} />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/events/tx/saturday-cruise-in-at-sonic')
  })
})
