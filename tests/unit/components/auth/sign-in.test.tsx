import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'

vi.mock('@/lib/supabase/client', () => ({
  createBrowserClient: () => ({
    auth: {
      signInWithPassword: vi.fn(),
      signInWithOAuth: vi.fn()
    }
  })
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() })
}))

beforeEach(() => {
  cleanup()
})

describe('Sign In Page', () => {
  it('renders email and password fields', async () => {
    const { default: SignInPage } = await import('@/app/(auth)/sign-in/page')
    render(<SignInPage />)
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
  })

  it('renders sign in button', async () => {
    const { default: SignInPage } = await import('@/app/(auth)/sign-in/page')
    render(<SignInPage />)
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('renders link to sign up', async () => {
    const { default: SignInPage } = await import('@/app/(auth)/sign-in/page')
    render(<SignInPage />)
    expect(screen.getByText(/sign up/i)).toBeInTheDocument()
  })
})
