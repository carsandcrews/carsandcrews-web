import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'

const mockClaims = [
  {
    id: 'c1',
    event_id: 'e1',
    user_id: 'user-1',
    message: 'I am the organizer of this event',
    status: 'pending',
    created_at: '2026-03-10T00:00:00Z',
    claimant: { display_name: 'John Doe', username: 'johndoe' },
    event: { id: 'e1', name: 'Detroit Car Show', slug: 'detroit-car-show', city: 'Detroit', state: 'MI' }
  }
]

vi.mock('@/lib/supabase/client', () => ({
  createBrowserClient: () => ({
    auth: {
      getUser: vi.fn(() => Promise.resolve({ data: { user: { id: 'admin-1' } }, error: null }))
    },
    from: (table: string) => {
      if (table === 'event_claims') {
        return {
          select: () => ({
            eq: () => ({
              order: () => Promise.resolve({ data: mockClaims, error: null })
            }),
            order: () => Promise.resolve({ data: mockClaims, error: null })
          }),
          update: () => ({
            eq: () => Promise.resolve({ error: null })
          })
        }
      }
      if (table === 'events') {
        return {
          update: () => ({
            eq: () => Promise.resolve({ error: null })
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

describe('AdminClaimsPage', () => {
  beforeEach(() => {
    cleanup()
  })

  it('renders claims heading', async () => {
    const { default: AdminClaimsPage } = await import('@/app/(admin)/admin/claims/page')
    render(<AdminClaimsPage />)
    expect(screen.getByRole('heading', { name: /Claims/i })).toBeInTheDocument()
  })

  it('renders claim details when loaded', async () => {
    const { default: AdminClaimsPage } = await import('@/app/(admin)/admin/claims/page')
    render(<AdminClaimsPage />)
    expect(await screen.findByText('Detroit Car Show')).toBeInTheDocument()
    expect(await screen.findByText(/I am the organizer/)).toBeInTheDocument()
  })

  it('renders claimant name', async () => {
    const { default: AdminClaimsPage } = await import('@/app/(admin)/admin/claims/page')
    render(<AdminClaimsPage />)
    expect(await screen.findByText(/John Doe/)).toBeInTheDocument()
  })

  it('renders approve and reject buttons', async () => {
    const { default: AdminClaimsPage } = await import('@/app/(admin)/admin/claims/page')
    render(<AdminClaimsPage />)
    expect(await screen.findByText(/Approve/i)).toBeInTheDocument()
    expect(await screen.findByText(/Reject/i)).toBeInTheDocument()
  })
})
