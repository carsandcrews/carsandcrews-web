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
    expect(screen.getByRole('heading', { name: /Upcoming Shows/i })).toBeInTheDocument()
  })

  it('renders event names', () => {
    render(<EventFeed events={mockEvents} />)
    expect(screen.getByText('Exotics @ RTC')).toBeInTheDocument()
    // "Cars & Coffee" also appears as the event type label, so expect 2
    expect(screen.getAllByText('Cars & Coffee').length).toBeGreaterThanOrEqual(1)
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

  it('renders event type labels', () => {
    render(<EventFeed events={mockEvents} />)
    expect(screen.getAllByText(/Car Show/i).length).toBeGreaterThanOrEqual(2)
  })

  it('links to event detail pages', () => {
    render(<EventFeed events={mockEvents} />)
    const links = screen.getAllByRole('link')
    const eventLink = links.find(l => l.getAttribute('href') === '/events/wa/exotics-rtc')
    expect(eventLink).toBeTruthy()
  })

  it('renders "View All" link to /events', () => {
    render(<EventFeed events={mockEvents} />)
    const viewAll = screen.getByText(/View All/i)
    expect(viewAll.closest('a')).toHaveAttribute('href', '/events')
  })

  it('renders placeholder events when given empty array', () => {
    render(<EventFeed events={[]} />)
    expect(screen.getByText('Saturday Cruise-In at Sonic')).toBeInTheDocument()
  })
})
