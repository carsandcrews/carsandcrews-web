import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SearchBar } from '@/components/events/SearchBar'

describe('SearchBar', () => {
  it('renders with placeholder text', () => {
    render(<SearchBar value="" onChange={() => {}} />)
    expect(screen.getByPlaceholderText(/Search events/)).toBeInTheDocument()
  })

  it('displays the current value', () => {
    render(<SearchBar value="cars and coffee" onChange={() => {}} />)
    expect(screen.getByDisplayValue('cars and coffee')).toBeInTheDocument()
  })

  it('calls onChange when text is entered', () => {
    const onChange = vi.fn()
    render(<SearchBar value="" onChange={onChange} />)
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'cruise' } })
    expect(onChange).toHaveBeenCalledWith('cruise')
  })

  it('shows location when provided', () => {
    render(<SearchBar value="" onChange={() => {}} location="Austin, TX" />)
    expect(screen.getByText('Austin, TX')).toBeInTheDocument()
  })
})
