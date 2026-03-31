import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'

const mockSubmissions = [
  {
    id: 's1',
    name: 'Local Cruise Night',
    date: '2026-06-15',
    city: 'Ann Arbor',
    state: 'MI',
    location_name: 'Downtown',
    description: 'Weekly cruise night downtown',
    source_url: 'https://facebook.com/event/123',
    status: 'pending',
    created_at: '2026-03-01T00:00:00Z',
    submitted_by: 'user-1',
    submitter: { display_name: 'Jane Smith', username: 'janesmith' }
  }
]

vi.mock('@/lib/supabase/client', () => ({
  createBrowserClient: () => ({
    auth: {
      getUser: vi.fn(() => Promise.resolve({ data: { user: { id: 'admin-1' } }, error: null }))
    },
    from: (table: string) => {
      if (table === 'event_submissions') {
        return {
          select: () => ({
            eq: () => ({
              order: () => Promise.resolve({ data: mockSubmissions, error: null })
            }),
            order: () => Promise.resolve({ data: mockSubmissions, error: null })
          }),
          update: () => ({
            eq: () => Promise.resolve({ error: null })
          })
        }
      }
      if (table === 'events') {
        return {
          insert: () => ({
            select: () => ({
              single: () => Promise.resolve({ data: { id: 'new-event-1' }, error: null })
            })
          })
        }
      }
      if (table === 'admin_actions') {
        return { insert: () => Promise.resolve({ error: null }) }
      }
      return { select: () => ({ order: () => Promise.resolve({ data: [], error: null }) }) }
    }
  })
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() })
}))

describe('AdminSubmissionsPage', () => {
  beforeEach(() => {
    cleanup()
  })

  it('renders submissions heading', async () => {
    const { default: AdminSubmissionsPage } = await import('@/app/(admin)/admin/submissions/page')
    render(<AdminSubmissionsPage />)
    expect(screen.getByRole('heading', { name: /Submissions/i })).toBeInTheDocument()
  })

  it('renders submission details when loaded', async () => {
    const { default: AdminSubmissionsPage } = await import('@/app/(admin)/admin/submissions/page')
    render(<AdminSubmissionsPage />)
    expect(await screen.findByText('Local Cruise Night')).toBeInTheDocument()
    expect(await screen.findByText(/Ann Arbor, MI/)).toBeInTheDocument()
  })

  it('renders approve and reject buttons', async () => {
    const { default: AdminSubmissionsPage } = await import('@/app/(admin)/admin/submissions/page')
    render(<AdminSubmissionsPage />)
    expect(await screen.findByText(/Approve/i)).toBeInTheDocument()
    expect(await screen.findByText(/Reject/i)).toBeInTheDocument()
  })

  it('renders submitter info', async () => {
    const { default: AdminSubmissionsPage } = await import('@/app/(admin)/admin/submissions/page')
    render(<AdminSubmissionsPage />)
    expect(await screen.findByText(/Jane Smith/)).toBeInTheDocument()
  })
})
