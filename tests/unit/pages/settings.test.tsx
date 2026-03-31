import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'

vi.mock('@/lib/supabase/client', () => ({
  createBrowserClient: () => ({
    auth: {
      getUser: vi.fn(() => Promise.resolve({
        data: { user: { id: 'user-1' } },
        error: null
      }))
    },
    from: (table: string) => {
      if (table === 'profiles') {
        return {
          select: () => ({
            eq: () => ({
              single: () => Promise.resolve({
                data: {
                  id: 'user-1',
                  username: 'johndoe',
                  display_name: 'John Doe',
                  bio: 'Car guy',
                  city: 'Detroit',
                  state: 'MI',
                  website: 'https://johndoe.com',
                  avatar_url: null
                },
                error: null
              })
            })
          }),
          update: () => ({
            eq: () => Promise.resolve({ error: null })
          })
        }
      }
      return {
        select: () => ({
          eq: () => ({
            single: () => Promise.resolve({ data: null, error: null })
          })
        })
      }
    }
  })
}))

vi.mock('@/hooks/use-upload', () => ({
  useUpload: () => ({
    upload: vi.fn(),
    uploads: new Map(),
    isUploading: false
  })
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() })
}))

describe('SettingsPage', () => {
  beforeEach(() => {
    cleanup()
  })

  it('renders profile settings form', async () => {
    const { default: SettingsPage } = await import('@/app/(auth)/settings/page')
    render(<SettingsPage />)
    expect(screen.getByText(/Profile Settings/i)).toBeInTheDocument()
  })

  it('renders display name field', async () => {
    const { default: SettingsPage } = await import('@/app/(auth)/settings/page')
    render(<SettingsPage />)
    expect(screen.getByLabelText(/Display Name/i)).toBeInTheDocument()
  })

  it('renders username field', async () => {
    const { default: SettingsPage } = await import('@/app/(auth)/settings/page')
    render(<SettingsPage />)
    expect(screen.getByLabelText(/Username/i)).toBeInTheDocument()
  })

  it('renders bio field', async () => {
    const { default: SettingsPage } = await import('@/app/(auth)/settings/page')
    render(<SettingsPage />)
    expect(screen.getByLabelText(/Bio/i)).toBeInTheDocument()
  })

  it('renders city and state fields', async () => {
    const { default: SettingsPage } = await import('@/app/(auth)/settings/page')
    render(<SettingsPage />)
    expect(screen.getByLabelText(/^City$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^State$/i)).toBeInTheDocument()
  })

  it('renders website field', async () => {
    const { default: SettingsPage } = await import('@/app/(auth)/settings/page')
    render(<SettingsPage />)
    expect(screen.getByLabelText(/Website/i)).toBeInTheDocument()
  })

  it('renders save button', async () => {
    const { default: SettingsPage } = await import('@/app/(auth)/settings/page')
    render(<SettingsPage />)
    expect(screen.getByRole('button', { name: /Save/i })).toBeInTheDocument()
  })

  it('renders avatar upload area', async () => {
    const { default: SettingsPage } = await import('@/app/(auth)/settings/page')
    render(<SettingsPage />)
    expect(screen.getByText(/Avatar/i)).toBeInTheDocument()
  })
})
