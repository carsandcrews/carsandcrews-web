import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SearchBarLanding } from '@/components/landing/SearchBarLanding'

const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush })
}))

describe('SearchBarLanding', () => {
  it('renders the search input', () => {
    render(<SearchBarLanding />)
    expect(screen.getByLabelText('Search')).toBeInTheDocument()
  })

  it('renders placeholder text', () => {
    render(<SearchBarLanding />)
    expect(screen.getByPlaceholderText(/Search events/)).toBeInTheDocument()
  })

  it('renders location indicator', () => {
    render(<SearchBarLanding />)
    expect(screen.getByText('Austin, TX')).toBeInTheDocument()
  })

  it('navigates on form submit with query', () => {
    render(<SearchBarLanding />)
    const input = screen.getByLabelText('Search')
    fireEvent.change(input, { target: { value: 'cars and coffee' } })
    fireEvent.submit(input.closest('form')!)
    expect(mockPush).toHaveBeenCalledWith('/events?q=cars%20and%20coffee')
  })

  it('does not navigate on empty query submit', () => {
    mockPush.mockClear()
    render(<SearchBarLanding />)
    const input = screen.getByLabelText('Search')
    fireEvent.submit(input.closest('form')!)
    expect(mockPush).not.toHaveBeenCalled()
  })
})
