import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

vi.mock('@/lib/supabase/client', () => ({
  createBrowserClient: () => ({
    auth: {
      getUser: vi.fn(() => Promise.resolve({ data: { user: null }, error: null }))
    }
  })
}))

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  )
}))

describe('NavBar', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('renders the brand name', async () => {
    const { NavBar } = await import('@/components/layout/NavBar')
    render(<NavBar />)
    expect(screen.getByText('Cars & Crews')).toBeInTheDocument()
  })

  it('renders navigation links', async () => {
    const { NavBar } = await import('@/components/layout/NavBar')
    render(<NavBar />)
    expect(screen.getByText('Events')).toBeInTheDocument()
    expect(screen.getByText('Vehicles')).toBeInTheDocument()
    expect(screen.getByText('Map')).toBeInTheDocument()
  })

  it('renders sign in and sign up when logged out', async () => {
    const { NavBar } = await import('@/components/layout/NavBar')
    render(<NavBar />)
    expect(screen.getByText('Sign In')).toBeInTheDocument()
    expect(screen.getByText('Sign Up')).toBeInTheDocument()
  })

  it('has a home link on the brand', async () => {
    const { NavBar } = await import('@/components/layout/NavBar')
    render(<NavBar />)
    const homeLink = screen.getByLabelText('Cars & Crews home')
    expect(homeLink).toHaveAttribute('href', '/')
  })

  it('toggles mobile menu on hamburger click', async () => {
    const { NavBar } = await import('@/components/layout/NavBar')
    render(<NavBar />)
    const toggle = screen.getByLabelText('Toggle menu')
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    fireEvent.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
  })

  it('renders dashboard link when logged in', async () => {
    vi.doMock('@/lib/supabase/client', () => ({
      createBrowserClient: () => ({
        auth: {
          getUser: vi.fn(() => Promise.resolve({ data: { user: { id: 'u1' } }, error: null }))
        }
      })
    }))
    const { NavBar } = await import('@/components/layout/NavBar')
    render(<NavBar />)
    // Wait for async user fetch
    await screen.findByText('Dashboard')
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
  })
})
