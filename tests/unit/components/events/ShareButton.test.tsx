import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { ShareButton } from '@/components/events/ShareButton'

beforeEach(() => {
  vi.useFakeTimers()
})

describe('ShareButton', () => {
  it('renders share button text', () => {
    render(<ShareButton name="Test Event" />)
    expect(screen.getByRole('button', { name: /Share/i })).toBeInTheDocument()
  })

  it('copies URL to clipboard and shows toast when navigator.share is not available', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.assign(navigator, { clipboard: { writeText }, share: undefined })
    Object.defineProperty(window, 'location', { value: { href: 'https://example.com/events/test' }, writable: true })

    render(<ShareButton name="Test Event" />)
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Share/i }))
    })

    expect(writeText).toHaveBeenCalledWith('https://example.com/events/test')
    expect(screen.getByText(/Link copied/i)).toBeInTheDocument()
  })

  it('hides toast after timeout', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.assign(navigator, { clipboard: { writeText }, share: undefined })
    Object.defineProperty(window, 'location', { value: { href: 'https://example.com' }, writable: true })

    render(<ShareButton name="Test Event" />)
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Share/i }))
    })

    expect(screen.getByText(/Link copied/i)).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(2500)
    })

    expect(screen.queryByText(/Link copied/i)).not.toBeInTheDocument()
  })

  it('uses navigator.share when available', async () => {
    const share = vi.fn().mockResolvedValue(undefined)
    Object.assign(navigator, { share })
    Object.defineProperty(window, 'location', { value: { href: 'https://example.com' }, writable: true })

    render(<ShareButton name="Test Event" />)
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Share/i }))
    })

    expect(share).toHaveBeenCalledWith({ title: 'Test Event', url: 'https://example.com' })
  })
})
