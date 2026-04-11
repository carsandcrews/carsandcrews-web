import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PreviewTriptych } from '@/components/landing/PreviewTriptych'

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  )
}))

describe('PreviewTriptych', () => {
  const nextEvent = {
    name: 'Warmuth Cruise-In',
    dateLabel: 'Apr 18',
    distanceLabel: '12 mi away',
    href: '/events/mi/warmuth-cruise-in',
  }
  const latestBuild = {
    title: '1964 Pontiac Tempest',
    subtitle: '@kmnord',
    href: '/@kmnord/64-tempest',
  }
  const freshBuild = {
    title: '1971 Chevelle SS',
    subtitle: '@crewmember · just added',
    href: '/@crewmember/71-chevelle-ss',
  }

  it('renders all three card eyebrow labels', () => {
    render(<PreviewTriptych nextEvent={nextEvent} latestBuild={latestBuild} freshBuild={freshBuild} />)
    expect(screen.getByText('NEXT EVENT NEAR YOU')).toBeInTheDocument()
    expect(screen.getByText('LATEST BUILD')).toBeInTheDocument()
    expect(screen.getByText('FRESH IN THE GARAGE')).toBeInTheDocument()
  })

  it('renders content titles and links', () => {
    render(<PreviewTriptych nextEvent={nextEvent} latestBuild={latestBuild} freshBuild={freshBuild} />)
    expect(screen.getByRole('link', { name: /warmuth cruise-in/i })).toHaveAttribute('href', '/events/mi/warmuth-cruise-in')
    expect(screen.getByRole('link', { name: /1964 pontiac tempest/i })).toHaveAttribute('href', '/@kmnord/64-tempest')
    expect(screen.getByRole('link', { name: /1971 chevelle ss/i })).toHaveAttribute('href', '/@crewmember/71-chevelle-ss')
  })

  it('renders the next-event empty state when nextEvent is null', () => {
    render(<PreviewTriptych nextEvent={null} latestBuild={latestBuild} freshBuild={freshBuild} />)
    expect(screen.getByText('NO SHOWS NEARBY')).toBeInTheDocument()
    const card = screen.getByText('NO SHOWS NEARBY').closest('a')
    expect(card).toHaveAttribute('href', '/events')
  })

  it('renders the no-builds empty state when latestBuild is null', () => {
    render(<PreviewTriptych nextEvent={nextEvent} latestBuild={null} freshBuild={freshBuild} />)
    expect(screen.getByText('NO BUILDS YET')).toBeInTheDocument()
    const card = screen.getByText('NO BUILDS YET').closest('a')
    expect(card).toHaveAttribute('href', '/garage/new')
  })

  it('renders the empty-garage state when freshBuild is null', () => {
    render(<PreviewTriptych nextEvent={nextEvent} latestBuild={latestBuild} freshBuild={null} />)
    expect(screen.getByText('THE GARAGE IS EMPTY')).toBeInTheDocument()
    const card = screen.getByText('THE GARAGE IS EMPTY').closest('a')
    expect(card).toHaveAttribute('href', '/garage/new')
  })
})
