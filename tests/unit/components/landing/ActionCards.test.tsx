import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ActionCards } from '@/components/landing/ActionCards'

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  )
}))

describe('ActionCards', () => {
  it('renders all three card titles', () => {
    render(<ActionCards eventCount={0} />)
    expect(screen.getByText('Find Events')).toBeInTheDocument()
    expect(screen.getByText('Browse Builds')).toBeInTheDocument()
    expect(screen.getByText('Join the Crew')).toBeInTheDocument()
  })

  it('renders card descriptions', () => {
    render(<ActionCards eventCount={0} />)
    expect(screen.getByText('Car shows, cruise-ins, and meets near you')).toBeInTheDocument()
    expect(screen.getByText('Restored, modified, barn finds, and survivors')).toBeInTheDocument()
    expect(screen.getByText('Connect with local enthusiasts and clubs')).toBeInTheDocument()
  })

  it('displays formatted event count', () => {
    render(<ActionCards eventCount={4600} />)
    expect(screen.getByText(/4,600 events/)).toBeInTheDocument()
  })

  it('links to correct pages', () => {
    render(<ActionCards eventCount={0} />)
    const links = screen.getAllByRole('link')
    expect(links[0]).toHaveAttribute('href', '/events')
    expect(links[1]).toHaveAttribute('href', '/vehicles')
    expect(links[2]).toHaveAttribute('href', '/sign-up')
  })

  it('renders CTA text for each card', () => {
    render(<ActionCards eventCount={100} />)
    expect(screen.getByText(/100 events/)).toBeInTheDocument()
    expect(screen.getByText(/Explore garage/)).toBeInTheDocument()
    expect(screen.getByText(/Sign up free/)).toBeInTheDocument()
  })
})
