import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { EventCreateForm } from '@/components/events/EventCreateForm'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn() }),
  useSearchParams: () => new URLSearchParams()
}))

vi.mock('@/hooks/use-upload', () => ({
  useUpload: () => ({
    upload: vi.fn(),
    uploads: new Map(),
    isUploading: false
  })
}))

describe('EventCreateForm', () => {
  it('renders the form with required fields', () => {
    render(<EventCreateForm />)
    expect(screen.getByLabelText(/Event Name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^Date$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^City$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^State$/i)).toBeInTheDocument()
  })

  it('renders event type selector', () => {
    render(<EventCreateForm />)
    expect(screen.getByLabelText(/Event Type/i)).toBeInTheDocument()
  })

  it('renders optional fields', () => {
    render(<EventCreateForm />)
    expect(screen.getByLabelText(/Description/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Start Time/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Website/i)).toBeInTheDocument()
  })

  it('renders submit button', () => {
    render(<EventCreateForm />)
    expect(screen.getByRole('button', { name: /Create Event/i })).toBeInTheDocument()
  })

  it('shows validation error when required fields are empty on submit', () => {
    render(<EventCreateForm />)
    fireEvent.click(screen.getByRole('button', { name: /Create Event/i }))
    expect(screen.getByText(/Event name is required/i)).toBeInTheDocument()
  })
})
