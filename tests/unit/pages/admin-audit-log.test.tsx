import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'

const mockActions = [
  {
    id: 'a1',
    action_type: 'approve',
    target_type: 'submission',
    target_id: 'sub-123',
    reason: null,
    created_at: '2026-03-15T14:30:00Z',
    admin: { display_name: 'Admin User', username: 'admin1' }
  },
  {
    id: 'a2',
    action_type: 'reject',
    target_type: 'claim',
    target_id: 'claim-456',
    reason: 'Not the organizer',
    created_at: '2026-03-14T10:00:00Z',
    admin: { display_name: 'Admin User', username: 'admin1' }
  }
]

vi.mock('@/lib/supabase/client', () => ({
  createBrowserClient: () => ({
    from: (table: string) => {
      if (table === 'admin_actions') {
        return {
          select: () => ({
            order: () => Promise.resolve({ data: mockActions, error: null }),
            eq: (_col: string, _val: string) => ({
              order: () => Promise.resolve({ data: mockActions, error: null }),
              eq: () => ({
                order: () => Promise.resolve({ data: mockActions, error: null }),
                gte: () => ({
                  order: () => Promise.resolve({ data: mockActions, error: null }),
                  lte: () => ({
                    order: () => Promise.resolve({ data: mockActions, error: null })
                  })
                }),
                lte: () => ({
                  order: () => Promise.resolve({ data: mockActions, error: null })
                })
              }),
              gte: () => ({
                order: () => Promise.resolve({ data: mockActions, error: null }),
                lte: () => ({
                  order: () => Promise.resolve({ data: mockActions, error: null })
                })
              }),
              lte: () => ({
                order: () => Promise.resolve({ data: mockActions, error: null })
              })
            }),
            gte: () => ({
              order: () => Promise.resolve({ data: mockActions, error: null }),
              lte: () => ({
                order: () => Promise.resolve({ data: mockActions, error: null })
              })
            }),
            lte: () => ({
              order: () => Promise.resolve({ data: mockActions, error: null })
            })
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

describe('AdminAuditLogPage', () => {
  beforeEach(() => {
    cleanup()
  })

  it('renders audit log heading', async () => {
    const { default: AdminAuditLogPage } = await import('@/app/(admin)/admin/audit-log/page')
    render(<AdminAuditLogPage />)
    expect(screen.getByText(/Audit Log/i)).toBeInTheDocument()
  })

  it('renders filter controls', async () => {
    const { default: AdminAuditLogPage } = await import('@/app/(admin)/admin/audit-log/page')
    render(<AdminAuditLogPage />)
    expect(screen.getByLabelText(/Action Type/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Target Type/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/From/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/To/i)).toBeInTheDocument()
  })

  it('renders audit log entries', async () => {
    const { default: AdminAuditLogPage } = await import('@/app/(admin)/admin/audit-log/page')
    render(<AdminAuditLogPage />)
    expect(await screen.findByText('approve')).toBeInTheDocument()
    expect(await screen.findByText('reject')).toBeInTheDocument()
  })

  it('renders admin name on entries', async () => {
    const { default: AdminAuditLogPage } = await import('@/app/(admin)/admin/audit-log/page')
    render(<AdminAuditLogPage />)
    const adminNames = await screen.findAllByText(/Admin User/)
    expect(adminNames.length).toBeGreaterThan(0)
  })

  it('renders reason when present', async () => {
    const { default: AdminAuditLogPage } = await import('@/app/(admin)/admin/audit-log/page')
    render(<AdminAuditLogPage />)
    expect(await screen.findByText(/Not the organizer/)).toBeInTheDocument()
  })
})
