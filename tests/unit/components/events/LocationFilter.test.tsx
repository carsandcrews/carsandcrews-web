import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { LocationFilter } from '@/components/events/LocationFilter'

// Mock next/navigation
const mockPush = vi.fn()
const mockSearchParams = new URLSearchParams()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => mockSearchParams
}))

describe('LocationFilter', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders ZIP label when center has zip source', () => {
    render(
      <LocationFilter
        center={{ lat: 30.27, lng: -97.74, label: '78701 · Austin, TX', source: 'zip', radius: 100 }}
      />
    )
    expect(screen.getByText('78701 · Austin, TX')).toBeTruthy()
    expect(screen.getByText('ZIP')).toBeTruthy()
  })

  it('renders IP label when center has ip source', () => {
    render(
      <LocationFilter
        center={{ lat: 30.27, lng: -97.74, label: 'Austin, TX', source: 'ip', radius: 100 }}
      />
    )
    expect(screen.getByText('Austin, TX')).toBeTruthy()
    expect(screen.getByText('IP')).toBeTruthy()
  })

  it('shows empty state with input when no center', () => {
    render(<LocationFilter center={null} />)
    expect(screen.getByPlaceholderText('ZIP code')).toBeTruthy()
  })

  it('highlights active radius chip', () => {
    render(
      <LocationFilter
        center={{ lat: 30.27, lng: -97.74, label: 'Austin, TX', source: 'ip', radius: 250 }}
      />
    )
    const chip250 = screen.getByRole('button', { name: '250' })
    expect(chip250.className).toContain('amber')
  })

  it('shows GPS button', () => {
    render(<LocationFilter center={null} />)
    expect(screen.getByLabelText('Use GPS location')).toBeTruthy()
  })
})
