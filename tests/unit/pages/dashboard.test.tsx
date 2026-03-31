import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'

const mockUser = { id: 'user-1' }
const mockVehicles = [
  { id: 'v1', year: 1969, make: 'Chevrolet', model: 'Camaro', slug: '1969-chevrolet-camaro', status_tag: 'restored' }
]
const mockRsvps = [
  {
    id: 'r1',
    status: 'going',
    event: { id: 'e1', name: 'Detroit Car Show', slug: 'detroit-car-show', date: '2026-05-15', city: 'Detroit', state: 'MI', event_type: 'car_show' }
  }
]
const mockSubmissions = [
  { id: 's1', name: 'My Local Cruise-In', status: 'pending', created_at: '2026-03-01T00:00:00Z' }
]

vi.mock('@/lib/supabase/client', () => ({
  createBrowserClient: () => ({
    auth: {
      getUser: vi.fn(() => Promise.resolve({ data: { user: mockUser }, error: null }))
    },
    from: (table: string) => {
      if (table === 'vehicles') {
        return {
          select: () => ({
            eq: () => ({
              order: () => Promise.resolve({ data: mockVehicles, error: null })
            })
          })
        }
      }
      if (table === 'rsvps') {
        return {
          select: () => ({
            eq: () => ({
              order: () => Promise.resolve({ data: mockRsvps, error: null })
            })
          })
        }
      }
      if (table === 'event_submissions') {
        return {
          select: () => ({
            eq: () => ({
              order: () => Promise.resolve({ data: mockSubmissions, error: null })
            })
          })
        }
      }
      return { select: () => ({ eq: () => ({ order: () => Promise.resolve({ data: [], error: null }) }) }) }
    }
  })
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() })
}))

describe('DashboardPage', () => {
  beforeEach(() => {
    cleanup()
  })

  it('renders dashboard heading', async () => {
    const { default: DashboardPage } = await import('@/app/(auth)/dashboard/page')
    render(<DashboardPage />)
    expect(screen.getByText(/Dashboard/i)).toBeInTheDocument()
  })

  it('renders my vehicles section', async () => {
    const { default: DashboardPage } = await import('@/app/(auth)/dashboard/page')
    render(<DashboardPage />)
    expect(screen.getByText(/My Vehicles/i)).toBeInTheDocument()
  })

  it('renders my RSVPs section', async () => {
    const { default: DashboardPage } = await import('@/app/(auth)/dashboard/page')
    render(<DashboardPage />)
    expect(screen.getByText(/My RSVPs/i)).toBeInTheDocument()
  })

  it('renders my submissions section', async () => {
    const { default: DashboardPage } = await import('@/app/(auth)/dashboard/page')
    render(<DashboardPage />)
    expect(screen.getByText(/My Submissions/i)).toBeInTheDocument()
  })

  it('renders quick action links', async () => {
    const { default: DashboardPage } = await import('@/app/(auth)/dashboard/page')
    render(<DashboardPage />)
    expect(screen.getByText(/Add Vehicle/i)).toBeInTheDocument()
    expect(screen.getByText(/Submit Event/i)).toBeInTheDocument()
  })
})
