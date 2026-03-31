import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'

const mockProfile = {
  id: 'user-1',
  username: 'johndoe',
  display_name: 'John Doe',
  avatar_url: 'https://example.com/avatar.jpg',
  bio: 'Classic car enthusiast from Michigan',
  city: 'Detroit',
  state: 'MI',
  website: 'https://johndoe.com',
  role: 'user',
  created_at: '2025-01-01T00:00:00Z'
}

const mockVehicles = [
  {
    id: 'v1',
    year: 1969,
    make: 'Chevrolet',
    model: 'Camaro',
    status_tag: 'restored',
    slug: '1969-chevrolet-camaro',
    visibility: 'public',
    vehicle_photos: [{ url: 'https://example.com/camaro.jpg', thumbnail_url: 'https://example.com/camaro-thumb.jpg', position: 0 }]
  }
]

const mockRsvps = [
  {
    id: 'r1',
    status: 'going',
    event: {
      id: 'e1',
      name: 'Detroit Car Show',
      slug: 'detroit-car-show',
      date: '2026-05-15',
      city: 'Detroit',
      state: 'MI',
      event_type: 'car_show',
      status: 'published'
    }
  }
]

let mockProfileData: typeof mockProfile | null = mockProfile
let mockVehiclesData: typeof mockVehicles | null = mockVehicles
let mockRsvpsData: typeof mockRsvps | null = mockRsvps

vi.mock('@/lib/supabase/server', () => ({
  createServer: vi.fn(() => Promise.resolve({
    from: (table: string) => {
      if (table === 'profiles') {
        return {
          select: () => ({
            eq: () => ({
              single: () => Promise.resolve({ data: mockProfileData, error: null })
            })
          })
        }
      }
      if (table === 'vehicles') {
        return {
          select: () => ({
            eq: (_col: string, _val: string) => ({
              eq: () => ({
                order: () => Promise.resolve({ data: mockVehiclesData, error: null })
              })
            })
          })
        }
      }
      if (table === 'rsvps') {
        return {
          select: () => ({
            eq: (_col: string, _val: string) => ({
              eq: () => ({
                order: () => Promise.resolve({ data: mockRsvpsData, error: null })
              })
            })
          })
        }
      }
      return { select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: null, error: null }) }) }) }
    }
  }))
}))

vi.mock('next/navigation', () => ({
  notFound: vi.fn(() => { throw new Error('NEXT_NOT_FOUND') }),
  redirect: vi.fn()
}))

describe('ProfilePage', () => {
  beforeEach(() => {
    mockProfileData = mockProfile
    mockVehiclesData = mockVehicles
    mockRsvpsData = mockRsvps
    vi.clearAllMocks()
  })

  it('renders profile display name', async () => {
    const { default: ProfilePage } = await import('@/app/(public)/[username]/page')
    const page = await ProfilePage({ params: Promise.resolve({ username: 'johndoe' }) })
    render(page)
    expect(screen.getByRole('heading', { name: 'John Doe' })).toBeInTheDocument()
  })

  it('renders bio', async () => {
    const { default: ProfilePage } = await import('@/app/(public)/[username]/page')
    const page = await ProfilePage({ params: Promise.resolve({ username: 'johndoe' }) })
    render(page)
    expect(screen.getByText('Classic car enthusiast from Michigan')).toBeInTheDocument()
  })

  it('renders location', async () => {
    const { default: ProfilePage } = await import('@/app/(public)/[username]/page')
    const page = await ProfilePage({ params: Promise.resolve({ username: 'johndoe' }) })
    const { container } = render(page)
    expect(container.textContent).toContain('Detroit, MI')
  })

  it('renders avatar', async () => {
    const { default: ProfilePage } = await import('@/app/(public)/[username]/page')
    const page = await ProfilePage({ params: Promise.resolve({ username: 'johndoe' }) })
    render(page)
    expect(screen.getByAltText(/John Doe/)).toBeInTheDocument()
  })

  it('renders website link', async () => {
    const { default: ProfilePage } = await import('@/app/(public)/[username]/page')
    const page = await ProfilePage({ params: Promise.resolve({ username: 'johndoe' }) })
    render(page)
    expect(screen.getByText(/johndoe.com/)).toBeInTheDocument()
  })

  it('renders garage section with vehicle', async () => {
    const { default: ProfilePage } = await import('@/app/(public)/[username]/page')
    const page = await ProfilePage({ params: Promise.resolve({ username: 'johndoe' }) })
    render(page)
    expect(screen.getByText('Garage')).toBeInTheDocument()
    expect(screen.getByText(/1969 Chevrolet Camaro/)).toBeInTheDocument()
  })

  it('renders upcoming events section', async () => {
    const { default: ProfilePage } = await import('@/app/(public)/[username]/page')
    const page = await ProfilePage({ params: Promise.resolve({ username: 'johndoe' }) })
    render(page)
    expect(screen.getByText('Upcoming Events')).toBeInTheDocument()
    expect(screen.getByText('Detroit Car Show')).toBeInTheDocument()
  })

  it('calls notFound when profile does not exist', async () => {
    mockProfileData = null
    const { notFound } = await import('next/navigation')
    const { default: ProfilePage } = await import('@/app/(public)/[username]/page')
    await expect(ProfilePage({ params: Promise.resolve({ username: 'nonexistent' }) })).rejects.toThrow('NEXT_NOT_FOUND')
    expect(notFound).toHaveBeenCalled()
  })

  it('generates metadata with profile info', async () => {
    const { generateMetadata } = await import('@/app/(public)/[username]/page')
    const metadata = await generateMetadata({ params: Promise.resolve({ username: 'johndoe' }) })
    expect(metadata.title).toContain('John Doe')
  })
})
