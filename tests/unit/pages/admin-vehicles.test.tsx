import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'

const mockVehicles = [
  {
    id: 'v1',
    year: 1969,
    make: 'Chevrolet',
    model: 'Camaro',
    slug: '1969-chevrolet-camaro',
    status_tag: 'restored',
    visibility: 'public',
    created_at: '2026-01-01T00:00:00Z',
    owner: { display_name: 'John Doe', username: 'johndoe' }
  }
]

vi.mock('@/lib/supabase/client', () => ({
  createBrowserClient: () => ({
    auth: {
      getUser: vi.fn(() => Promise.resolve({ data: { user: { id: 'admin-1' } }, error: null }))
    },
    from: (table: string) => {
      if (table === 'vehicles') {
        return {
          select: () => ({
            order: () => Promise.resolve({ data: mockVehicles, error: null })
          }),
          update: () => ({
            eq: () => Promise.resolve({ error: null })
          }),
          delete: () => ({
            eq: () => Promise.resolve({ error: null })
          })
        }
      }
      return { select: () => ({ order: () => Promise.resolve({ data: [], error: null }) }) }
    }
  })
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() })
}))

describe('AdminVehiclesPage', () => {
  beforeEach(() => {
    cleanup()
  })

  it('renders vehicles management heading', async () => {
    const { default: AdminVehiclesPage } = await import('@/app/(admin)/admin/vehicles/page')
    render(<AdminVehiclesPage />)
    expect(screen.getByText(/Manage Vehicles/i)).toBeInTheDocument()
  })

  it('renders vehicles table with data', async () => {
    const { default: AdminVehiclesPage } = await import('@/app/(admin)/admin/vehicles/page')
    render(<AdminVehiclesPage />)
    expect(await screen.findByText(/1969 Chevrolet Camaro/)).toBeInTheDocument()
  })

  it('renders owner info', async () => {
    const { default: AdminVehiclesPage } = await import('@/app/(admin)/admin/vehicles/page')
    render(<AdminVehiclesPage />)
    expect(await screen.findByText('John Doe')).toBeInTheDocument()
  })

  it('renders remove button', async () => {
    const { default: AdminVehiclesPage } = await import('@/app/(admin)/admin/vehicles/page')
    render(<AdminVehiclesPage />)
    expect(await screen.findByText('Remove')).toBeInTheDocument()
  })

  it('renders visibility toggle', async () => {
    const { default: AdminVehiclesPage } = await import('@/app/(admin)/admin/vehicles/page')
    render(<AdminVehiclesPage />)
    expect(await screen.findByText('public')).toBeInTheDocument()
  })
})
