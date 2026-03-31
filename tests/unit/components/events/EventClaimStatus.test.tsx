import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { EventClaimStatus } from '@/components/events/EventClaimStatus'

describe('EventClaimStatus', () => {
  it('renders pending status', () => {
    render(<EventClaimStatus status="pending" />)
    expect(screen.getByText(/pending/i)).toBeInTheDocument()
  })

  it('renders approved status', () => {
    render(<EventClaimStatus status="approved" />)
    expect(screen.getByText(/approved/i)).toBeInTheDocument()
  })

  it('renders rejected status', () => {
    render(<EventClaimStatus status="rejected" />)
    expect(screen.getByText(/rejected/i)).toBeInTheDocument()
  })
})
