import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'

vi.mock('@/lib/supabase/client', () => ({
  createBrowserClient: () => ({
    auth: {
      signUp: vi.fn()
    }
  })
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() })
}))

beforeEach(() => {
  cleanup()
})

describe('Sign Up Page', () => {
  it('renders email and password fields', async () => {
    const { default: SignUpPage } = await import('@/app/(auth)/sign-up/page')
    render(<SignUpPage />)
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
  })

  it('renders sign up button', async () => {
    const { default: SignUpPage } = await import('@/app/(auth)/sign-up/page')
    render(<SignUpPage />)
    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument()
  })

  it('renders link to sign in', async () => {
    const { default: SignUpPage } = await import('@/app/(auth)/sign-up/page')
    render(<SignUpPage />)
    expect(screen.getByText(/sign in/i)).toBeInTheDocument()
  })
})
