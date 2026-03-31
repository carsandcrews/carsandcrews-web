import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { EventFeed } from '@/components/landing/EventFeed'

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  )
}))

const mockEvents = [
  { name: 'Exotics @ RTC', date: '2026-04-05', city: 'Redmond', state: 'WA', event_type: 'car_show' as const, slug: 'exotics-rtc', state_code: 'wa', distance_miles: 3 },
  { name: 'Cars & Coffee', date: '2026-04-06', city: 'Austin', state: 'TX', event_type: 'cars_and_coffee' as const, slug: 'cars-and-coffee', state_code: 'tx', distance_miles: 12 },
  { name: 'Lone Star Nationals', date: '2026-04-12', city: 'Fort Worth', state: 'TX', event_type: 'car_show' as const, slug: 'lone-star-nationals', state_code: 'tx', distance_miles: null },
]

describe('EventFeed', () => {
  it('renders section header', () => {
    render(<EventFeed events={mockEvents} />)
    expect(screen.getByText(/What's Happening Near You/i)).toBeInTheDocument()
  })

  it('renders event names', () => {
    render(<EventFeed events={mockEvents} />)
    expect(screen.getByText('Exotics @ RTC')).toBeInTheDocument()
    expect(screen.getByText('Cars & Coffee')).toBeInTheDocument()
    expect(screen.getByText('Lone Star Nationals')).toBeInTheDocument()
  })

  it('renders date blocks', () => {
    render(<EventFeed events={mockEvents} />)
    expect(screen.getAllByText('APR').length).toBeGreaterThanOrEqual(3)
    expect(screen.getByText('5')).toBeInTheDocument()
    expect(screen.getByText('6')).toBeInTheDocument()
    expect(screen.getByText('12')).toBeInTheDocument()
  })

  it('renders distance when provided', () => {
    render(<EventFeed events={mockEvents} />)
    expect(screen.getByText(/3 mi/)).toBeInTheDocument()
    expect(screen.getByText(/12 mi/)).toBeInTheDocument()
  })

  it('renders RSVP actions', () => {
    render(<EventFeed events={mockEvents} />)
    expect(screen.getAllByText('RSVP').length).toBe(3)
  })

  it('links to event detail pages', () => {
    render(<EventFeed events={mockEvents} />)
    const links = screen.getAllByRole('link')
    const eventLink = links.find(l => l.getAttribute('href') === '/events/wa/exotics-rtc')
    expect(eventLink).toBeTruthy()
  })

  it('renders "See all events" link', () => {
    render(<EventFeed events={mockEvents} />)
    const seeAll = screen.getByText(/See all events near you/)
    expect(seeAll.closest('a')).toHaveAttribute('href', '/events')
  })

  it('renders placeholder events when given empty array', () => {
    render(<EventFeed events={[]} />)
    expect(screen.getByText('Saturday Cruise-In at Sonic')).toBeInTheDocument()
  })
})
