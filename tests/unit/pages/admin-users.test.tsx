import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'

const mockUsers = [
  {
    id: 'u1',
    username: 'johndoe',
    display_name: 'John Doe',
    role: 'user',
    created_at: '2026-01-01T00:00:00Z',
    city: 'Detroit',
    state: 'MI'
  },
  {
    id: 'u2',
    username: 'admin1',
    display_name: 'Admin User',
    role: 'admin',
    created_at: '2025-12-01T00:00:00Z',
    city: null,
    state: null
  }
]

vi.mock('@/lib/supabase/client', () => ({
  createBrowserClient: () => ({
    auth: {
      getUser: vi.fn(() => Promise.resolve({ data: { user: { id: 'admin-1' } }, error: null }))
    },
    from: (table: string) => {
      if (table === 'profiles') {
        return {
          select: () => ({
            order: () => Promise.resolve({ data: mockUsers, error: null })
          }),
          update: () => ({
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

describe('AdminUsersPage', () => {
  beforeEach(() => {
    cleanup()
  })

  it('renders users management heading', async () => {
    const { default: AdminUsersPage } = await import('@/app/(admin)/admin/users/page')
    render(<AdminUsersPage />)
    expect(screen.getByText(/Manage Users/i)).toBeInTheDocument()
  })

  it('renders users table', async () => {
    const { default: AdminUsersPage } = await import('@/app/(admin)/admin/users/page')
    render(<AdminUsersPage />)
    expect(await screen.findByText('John Doe')).toBeInTheDocument()
    expect(await screen.findByText('Admin User')).toBeInTheDocument()
  })

  it('renders role badges', async () => {
    const { default: AdminUsersPage } = await import('@/app/(admin)/admin/users/page')
    render(<AdminUsersPage />)
    expect(await screen.findByText('user')).toBeInTheDocument()
    expect(await screen.findByText('admin')).toBeInTheDocument()
  })

  it('renders role toggle actions', async () => {
    const { default: AdminUsersPage } = await import('@/app/(admin)/admin/users/page')
    render(<AdminUsersPage />)
    expect(await screen.findByText('Make Admin')).toBeInTheDocument()
    expect(await screen.findByText('Remove Admin')).toBeInTheDocument()
  })

  it('renders location for users who have it', async () => {
    const { default: AdminUsersPage } = await import('@/app/(admin)/admin/users/page')
    render(<AdminUsersPage />)
    expect(await screen.findByText('Detroit, MI')).toBeInTheDocument()
  })
})
