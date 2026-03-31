import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, cleanup, within } from '@testing-library/react'

const mockEvents = [
  {
    id: 'e1',
    name: 'Detroit Car Show',
    slug: 'detroit-car-show',
    date: '2026-05-15',
    city: 'Detroit',
    state: 'MI',
    event_type: 'car_show',
    source: 'crawled',
    status: 'published',
    claimed: false
  },
  {
    id: 'e2',
    name: 'Draft Cruise Night',
    slug: 'draft-cruise-night',
    date: '2026-06-01',
    city: 'Chicago',
    state: 'IL',
    event_type: 'cruise_in',
    source: 'submitted',
    status: 'draft',
    claimed: true
  }
]

vi.mock('@/lib/supabase/client', () => ({
  createBrowserClient: () => ({
    auth: {
      getUser: vi.fn(() => Promise.resolve({ data: { user: { id: 'admin-1' } }, error: null }))
    },
    from: (table: string) => {
      if (table === 'events') {
        return {
          select: () => ({
            order: () => Promise.resolve({ data: mockEvents, error: null, count: 2 }),
            eq: () => ({
              order: () => Promise.resolve({ data: mockEvents, error: null, count: 2 })
            })
          }),
          update: () => ({
            eq: () => Promise.resolve({ error: null })
          }),
          delete: () => ({
            eq: () => Promise.resolve({ error: null })
          })
        }
      }
      if (table === 'admin_actions') {
        return {
          insert: () => Promise.resolve({ error: null })
        }
      }
      return { select: () => ({ order: () => Promise.resolve({ data: [], error: null }) }) }
    }
  })
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
  useSearchParams: () => new URLSearchParams()
}))

describe('AdminEventsPage', () => {
  beforeEach(() => {
    cleanup()
  })

  it('renders events management heading', async () => {
    const { default: AdminEventsPage } = await import('@/app/(admin)/admin/events/page')
    render(<AdminEventsPage />)
    expect(screen.getByText(/Manage Events/i)).toBeInTheDocument()
  })

  it('renders filter controls', async () => {
    const { default: AdminEventsPage } = await import('@/app/(admin)/admin/events/page')
    render(<AdminEventsPage />)
    expect(screen.getByLabelText(/Source/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Status/i)).toBeInTheDocument()
  })

  it('renders events table with data', async () => {
    const { default: AdminEventsPage } = await import('@/app/(admin)/admin/events/page')
    render(<AdminEventsPage />)
    // Table header
    const table = await screen.findByRole('table')
    expect(within(table).getByText('Name')).toBeInTheDocument()
    expect(within(table).getByText('Date')).toBeInTheDocument()
    // Wait for data
    expect(await screen.findByText('Detroit Car Show')).toBeInTheDocument()
    expect(await screen.findByText('Draft Cruise Night')).toBeInTheDocument()
  })

  it('renders delete action buttons for each event', async () => {
    const { default: AdminEventsPage } = await import('@/app/(admin)/admin/events/page')
    render(<AdminEventsPage />)
    const deleteButtons = await screen.findAllByText('Delete')
    expect(deleteButtons.length).toBe(2)
  })
})
