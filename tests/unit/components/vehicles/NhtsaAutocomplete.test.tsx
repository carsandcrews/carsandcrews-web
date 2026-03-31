import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { NhtsaAutocomplete } from '@/components/vehicles/NhtsaAutocomplete'

beforeEach(() => {
  vi.restoreAllMocks()
})

describe('NhtsaAutocomplete', () => {
  it('renders input with label', () => {
    render(<NhtsaAutocomplete label="Make" value="" onChange={vi.fn()} />)
    expect(screen.getByLabelText(/Make/i)).toBeInTheDocument()
  })

  it('allows free text input', () => {
    const onChange = vi.fn()
    render(<NhtsaAutocomplete label="Make" value="" onChange={onChange} />)
    fireEvent.change(screen.getByLabelText(/Make/i), { target: { value: 'Chevrolet' } })
    expect(onChange).toHaveBeenCalledWith('Chevrolet')
  })

  it('shows free text note for pre-1981 vehicles', () => {
    render(<NhtsaAutocomplete label="Make" value="" onChange={vi.fn()} year={1965} />)
    expect(screen.getByText(/Free text/i)).toBeInTheDocument()
  })

  it('does not show free text note for post-1981 vehicles', () => {
    render(<NhtsaAutocomplete label="Make" value="" onChange={vi.fn()} year={2020} />)
    expect(screen.queryByText(/Free text/i)).not.toBeInTheDocument()
  })

  it('shows dropdown suggestions when fetch returns results', async () => {
    const mockResults = [
      { MakeId: 1, MakeName: 'Chevrolet' },
      { MakeId: 2, MakeName: 'Chrysler' }
    ]
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ Results: mockResults })
    })

    render(<NhtsaAutocomplete label="Make" value="" onChange={vi.fn()} year={2020} endpoint="makes" />)
    fireEvent.change(screen.getByLabelText(/Make/i), { target: { value: 'Ch' } })

    await waitFor(() => {
      expect(screen.getByText('Chevrolet')).toBeInTheDocument()
      expect(screen.getByText('Chrysler')).toBeInTheDocument()
    }, { timeout: 2000 })
  })

  it('selects suggestion on click', async () => {
    const mockResults = [{ MakeId: 1, MakeName: 'Chevrolet' }]
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ Results: mockResults })
    })

    const onChange = vi.fn()
    render(<NhtsaAutocomplete label="Make" value="" onChange={onChange} year={2020} endpoint="makes" />)
    fireEvent.change(screen.getByLabelText(/Make/i), { target: { value: 'Ch' } })

    await waitFor(() => {
      expect(screen.getByText('Chevrolet')).toBeInTheDocument()
    }, { timeout: 2000 })

    fireEvent.mouseDown(screen.getByText('Chevrolet'))
    expect(onChange).toHaveBeenCalledWith('Chevrolet')
  })
})
