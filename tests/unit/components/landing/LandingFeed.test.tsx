import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { LandingFeed } from '@/components/landing/LandingFeed'

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  )
}))

const mockEvents = [
  { name: 'Saturday Cruise-In', date: '2026-04-05', city: 'Round Rock', state: 'TX', event_type: 'cruise_in' as const, slug: 'saturday-cruise-in', state_code: 'tx' },
  { name: 'Cars & Coffee', date: '2026-04-06', city: 'Austin', state: 'TX', event_type: 'cars_and_coffee' as const, slug: 'cars-and-coffee', state_code: 'tx' },
  { name: 'Lone Star Nationals', date: '2026-04-12', city: 'Fort Worth', state: 'TX', event_type: 'car_show' as const, slug: 'lone-star-nationals', state_code: 'tx' },
]

const mockVehicles = [
  { year: 1957, make: 'Chevrolet', model: 'Bel Air', slug: '1957-bel-air', photo_url: null, owner_name: 'classic_joe' },
  { year: 1992, make: 'Acura', model: 'NSX', slug: '1992-nsx', photo_url: null, owner_name: 'jdm_life' },
  { year: 1970, make: 'Chevrolet', model: 'Chevelle SS', slug: '1970-chevelle', photo_url: null, owner_name: 'big_block_tony' },
]

const mockMembers = [
  { username: 'lone_star', display_name: 'Lone Star', avatar_url: null, tagline: 'Muscle cars' },
  { username: 'jdm_life', display_name: 'JDM Life', avatar_url: null, tagline: 'JDM builds' },
]

describe('LandingFeed', () => {
  it('renders the feed tabs', () => {
    render(<LandingFeed events={mockEvents} vehicles={mockVehicles} members={mockMembers} />)
    expect(screen.getByRole('tablist')).toBeInTheDocument()
  })

  it('renders events in the mixed feed', () => {
    render(<LandingFeed events={mockEvents} vehicles={mockVehicles} members={mockMembers} />)
    expect(screen.getByText('Saturday Cruise-In')).toBeInTheDocument()
    expect(screen.getByText('Cars & Coffee')).toBeInTheDocument()
  })

  it('renders vehicles in the mixed feed', () => {
    render(<LandingFeed events={mockEvents} vehicles={mockVehicles} members={mockMembers} />)
    expect(screen.getByText("'57 Chevrolet Bel Air")).toBeInTheDocument()
  })

  it('renders members section', () => {
    render(<LandingFeed events={mockEvents} vehicles={mockVehicles} members={mockMembers} />)
    expect(screen.getByText('New Members')).toBeInTheDocument()
    expect(screen.getByText('@lone_star')).toBeInTheDocument()
  })

  it('filters to show only events when Events tab is selected', () => {
    render(<LandingFeed events={mockEvents} vehicles={mockVehicles} members={mockMembers} />)
    fireEvent.click(screen.getByText('Events'))
    expect(screen.getByText('Saturday Cruise-In')).toBeInTheDocument()
    expect(screen.queryByText("'57 Chevrolet Bel Air")).not.toBeInTheDocument()
    expect(screen.queryByText('New Members')).not.toBeInTheDocument()
  })

  it('filters to show only vehicles when Vehicles tab is selected', () => {
    render(<LandingFeed events={mockEvents} vehicles={mockVehicles} members={mockMembers} />)
    fireEvent.click(screen.getByText('Vehicles'))
    expect(screen.queryByText('Saturday Cruise-In')).not.toBeInTheDocument()
    expect(screen.getByText("'57 Chevrolet Bel Air")).toBeInTheDocument()
  })

  it('filters to show only people when People tab is selected', () => {
    render(<LandingFeed events={mockEvents} vehicles={mockVehicles} members={mockMembers} />)
    fireEvent.click(screen.getByText('People'))
    expect(screen.queryByText('Saturday Cruise-In')).not.toBeInTheDocument()
    expect(screen.getByText('@lone_star')).toBeInTheDocument()
  })

  it('shows placeholder events when given empty arrays', () => {
    render(<LandingFeed events={[]} vehicles={[]} members={[]} />)
    fireEvent.click(screen.getByText('Events'))
    expect(screen.getByText('Saturday Cruise-In at Sonic')).toBeInTheDocument()
  })
})
