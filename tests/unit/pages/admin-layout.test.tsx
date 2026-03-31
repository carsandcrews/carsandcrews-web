import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'

let mockUser: { id: string } | null = { id: 'admin-1' }
let mockProfile: { role: string } | null = { role: 'admin' }

vi.mock('@/lib/supabase/server', () => ({
  createServer: vi.fn(() => Promise.resolve({
    auth: {
      getUser: () => Promise.resolve({ data: { user: mockUser }, error: null })
    },
    from: (table: string) => {
      if (table === 'profiles') {
        return {
          select: () => ({
            eq: () => ({
              single: () => Promise.resolve({ data: mockProfile, error: null })
            })
          })
        }
      }
      return { select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: null, error: null }) }) }) }
    }
  }))
}))

vi.mock('next/navigation', () => ({
  notFound: vi.fn(),
  redirect: vi.fn(() => { throw new Error('NEXT_REDIRECT') })
}))

describe('AdminLayout', () => {
  beforeEach(() => {
    mockUser = { id: 'admin-1' }
    mockProfile = { role: 'admin' }
    cleanup()
    vi.clearAllMocks()
  })

  it('renders admin sidebar navigation', async () => {
    const { default: AdminLayout } = await import('@/app/(admin)/layout')
    const layout = await AdminLayout({ children: <div>Content</div> })
    render(layout)
    expect(screen.getByText('Admin')).toBeInTheDocument()
    expect(screen.getByText('Events')).toBeInTheDocument()
    expect(screen.getByText('Submissions')).toBeInTheDocument()
    expect(screen.getByText('Claims')).toBeInTheDocument()
    expect(screen.getByText('Users')).toBeInTheDocument()
    expect(screen.getByText('Vehicles')).toBeInTheDocument()
    expect(screen.getByText('Audit Log')).toBeInTheDocument()
  })

  it('renders children when user is admin', async () => {
    const { default: AdminLayout } = await import('@/app/(admin)/layout')
    const layout = await AdminLayout({ children: <div>Admin Content</div> })
    render(layout)
    expect(screen.getByText('Admin Content')).toBeInTheDocument()
  })

  it('redirects when user is not logged in', async () => {
    mockUser = null
    const { redirect } = await import('next/navigation')
    const { default: AdminLayout } = await import('@/app/(admin)/layout')
    await expect(AdminLayout({ children: <div>Content</div> })).rejects.toThrow('NEXT_REDIRECT')
    expect(redirect).toHaveBeenCalledWith('/sign-in')
  })

  it('redirects when user is not admin', async () => {
    mockProfile = { role: 'user' }
    const { redirect } = await import('next/navigation')
    const { default: AdminLayout } = await import('@/app/(admin)/layout')
    await expect(AdminLayout({ children: <div>Content</div> })).rejects.toThrow('NEXT_REDIRECT')
    expect(redirect).toHaveBeenCalledWith('/')
  })

  it('has links to admin pages', async () => {
    const { default: AdminLayout } = await import('@/app/(admin)/layout')
    const layout = await AdminLayout({ children: <div>Content</div> })
    render(layout)
    const links = screen.getAllByRole('link')
    const hrefs = links.map(l => l.getAttribute('href'))
    expect(hrefs).toContain('/admin/events')
    expect(hrefs).toContain('/admin/submissions')
    expect(hrefs).toContain('/admin/claims')
    expect(hrefs).toContain('/admin/users')
    expect(hrefs).toContain('/admin/vehicles')
    expect(hrefs).toContain('/admin/audit-log')
  })
})
