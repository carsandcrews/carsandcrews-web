import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { EventSubmitForm } from '@/components/events/EventSubmitForm'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn() })
}))

describe('EventSubmitForm', () => {
  it('renders the lightweight submission form', () => {
    render(<EventSubmitForm />)
    expect(screen.getByLabelText(/Event Name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^Date$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^City$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^State$/i)).toBeInTheDocument()
  })

  it('renders optional fields', () => {
    render(<EventSubmitForm />)
    expect(screen.getByLabelText(/Description/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Source URL/i)).toBeInTheDocument()
  })

  it('renders submit button', () => {
    render(<EventSubmitForm />)
    expect(screen.getByRole('button', { name: /Submit Event/i })).toBeInTheDocument()
  })

  it('shows validation error when required fields are empty', () => {
    render(<EventSubmitForm />)
    fireEvent.click(screen.getByRole('button', { name: /Submit Event/i }))
    expect(screen.getByText(/Event name is required/i)).toBeInTheDocument()
  })

  it('does not show success message initially', () => {
    render(<EventSubmitForm />)
    expect(screen.queryByText(/submitted for review/i)).not.toBeInTheDocument()
  })
})
