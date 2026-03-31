import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { InstallPrompt } from '@/components/pwa/InstallPrompt'

describe('InstallPrompt', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('renders nothing when no beforeinstallprompt event', () => {
    const { container } = render(<InstallPrompt />)
    expect(container.firstChild).toBeNull()
  })

  it('renders install prompt when beforeinstallprompt fires', async () => {
    render(<InstallPrompt />)

    await act(async () => {
      const event = new Event('beforeinstallprompt')
      Object.assign(event, {
        prompt: vi.fn(),
        userChoice: Promise.resolve({ outcome: 'dismissed' as const })
      })
      window.dispatchEvent(event)
    })

    expect(screen.getByText('Install Cars & Crews')).toBeInTheDocument()
    expect(screen.getByText('Install')).toBeInTheDocument()
  })

  it('dismisses prompt when dismiss button is clicked', async () => {
    render(<InstallPrompt />)

    await act(async () => {
      const event = new Event('beforeinstallprompt')
      Object.assign(event, {
        prompt: vi.fn(),
        userChoice: Promise.resolve({ outcome: 'dismissed' as const })
      })
      window.dispatchEvent(event)
    })

    expect(screen.getByText('Install Cars & Crews')).toBeInTheDocument()

    fireEvent.click(screen.getByLabelText('Dismiss install prompt'))

    expect(screen.queryByText('Install Cars & Crews')).not.toBeInTheDocument()
  })

  it('calls prompt when install button is clicked', async () => {
    const mockPrompt = vi.fn()

    render(<InstallPrompt />)

    await act(async () => {
      const event = new Event('beforeinstallprompt')
      Object.assign(event, {
        prompt: mockPrompt,
        userChoice: Promise.resolve({ outcome: 'accepted' as const })
      })
      window.dispatchEvent(event)
    })

    await act(async () => {
      fireEvent.click(screen.getByText('Install'))
    })

    expect(mockPrompt).toHaveBeenCalled()
  })
})
