import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { EventClaimForm } from '@/components/events/EventClaimForm'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn() })
}))

describe('EventClaimForm', () => {
  const defaultProps = {
    eventId: 'evt-123',
    eventName: 'Cars & Coffee at The Domain'
  }

  it('renders the claim form with event name', () => {
    render(<EventClaimForm {...defaultProps} />)
    expect(screen.getByText(/Cars & Coffee at The Domain/)).toBeInTheDocument()
    expect(screen.getByLabelText(/message/i)).toBeInTheDocument()
  })

  it('renders submit button', () => {
    render(<EventClaimForm {...defaultProps} />)
    expect(screen.getByRole('button', { name: /Submit Claim/i })).toBeInTheDocument()
  })

  it('shows validation error when message is empty', () => {
    render(<EventClaimForm {...defaultProps} />)
    fireEvent.click(screen.getByRole('button', { name: /Submit Claim/i }))
    expect(screen.getByText(/Please explain why you're the organizer/i)).toBeInTheDocument()
  })

  it('does not show success message initially', () => {
    render(<EventClaimForm {...defaultProps} />)
    expect(screen.queryByText(/claim has been submitted/i)).not.toBeInTheDocument()
  })
})
