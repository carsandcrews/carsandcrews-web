import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { VehicleForm } from '@/components/vehicles/VehicleForm'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn() })
}))

vi.mock('@/lib/supabase/client', () => ({
  createBrowserClient: () => ({
    auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-1' } } }) },
    from: () => ({
      insert: vi.fn().mockResolvedValue({ data: [{ id: 'v-1' }], error: null }),
      update: () => ({
        eq: vi.fn().mockResolvedValue({ data: [{ id: 'v-1' }], error: null })
      }),
      select: () => ({
        eq: vi.fn().mockResolvedValue({ data: [], error: null })
      }),
      upsert: vi.fn().mockResolvedValue({ error: null })
    })
  })
}))

vi.mock('@/hooks/use-upload', () => ({
  useUpload: () => ({
    upload: vi.fn().mockResolvedValue({ publicUrl: 'https://example.com/photo.webp', key: 'key', aspectRatio: 'landscape' }),
    uploads: new Map(),
    isUploading: false
  })
}))

describe('VehicleForm', () => {
  it('renders all required fields', () => {
    render(<VehicleForm />)
    expect(screen.getByLabelText(/Year/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Make/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Model/i)).toBeInTheDocument()
  })

  it('renders status tag selector', () => {
    render(<VehicleForm />)
    expect(screen.getByText(/Status Tag/i)).toBeInTheDocument()
    expect(screen.getByText('Restored')).toBeInTheDocument()
    expect(screen.getByText('Modified')).toBeInTheDocument()
  })

  it('renders optional fields', () => {
    render(<VehicleForm />)
    expect(screen.getByLabelText(/Description/i)).toBeInTheDocument()
  })

  it('renders visibility selector', () => {
    render(<VehicleForm />)
    expect(screen.getByText(/Visibility/i)).toBeInTheDocument()
  })

  it('renders specs fields', () => {
    render(<VehicleForm />)
    expect(screen.getByLabelText(/Engine/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Transmission/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Paint Color/i)).toBeInTheDocument()
  })

  it('renders submit button for add mode', () => {
    render(<VehicleForm />)
    expect(screen.getByRole('button', { name: /Add Vehicle/i })).toBeInTheDocument()
  })

  it('renders submit button for edit mode', () => {
    render(<VehicleForm mode="edit" initialData={{ id: 'v-1', year: 1969, make: 'Chevrolet', model: 'Camaro', status_tag: 'restored', visibility: 'public', description: '', slug: 'test' }} />)
    expect(screen.getByRole('button', { name: /Save Changes/i })).toBeInTheDocument()
  })

  it('shows validation error when year is empty', () => {
    render(<VehicleForm />)
    fireEvent.click(screen.getByRole('button', { name: /Add Vehicle/i }))
    expect(screen.getByText(/Year is required/i)).toBeInTheDocument()
  })

  it('renders photo upload area', () => {
    render(<VehicleForm />)
    expect(screen.getByText(/Photos/i)).toBeInTheDocument()
  })

  it('pre-fills form in edit mode', () => {
    render(<VehicleForm mode="edit" initialData={{ id: 'v-1', year: 1969, make: 'Chevrolet', model: 'Camaro', status_tag: 'restored', visibility: 'public', description: 'My car', slug: 'test' }} />)
    expect(screen.getByLabelText(/Year/i)).toHaveValue(1969)
    expect(screen.getByLabelText(/Make/i)).toHaveValue('Chevrolet')
    expect(screen.getByLabelText(/Model/i)).toHaveValue('Camaro')
  })
})
