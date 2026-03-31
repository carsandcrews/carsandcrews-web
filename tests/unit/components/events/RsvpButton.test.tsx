import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { RsvpButton } from '@/components/events/RsvpButton'

vi.mock('@/lib/supabase/client', () => ({
  createBrowserClient: () => ({
    auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-1' } } }) },
    from: () => ({
      upsert: vi.fn().mockResolvedValue({ error: null }),
      delete: () => ({
        eq: () => ({ eq: vi.fn().mockResolvedValue({ error: null }) })
      })
    })
  })
}))

describe('RsvpButton', () => {
  it('renders Going and Interested buttons', () => {
    render(<RsvpButton eventId="evt-1" currentStatus={null} />)
    expect(screen.getByRole('button', { name: /Going/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Interested/i })).toBeInTheDocument()
  })

  it('highlights Going button when user status is going', () => {
    render(<RsvpButton eventId="evt-1" currentStatus="going" />)
    const goingBtn = screen.getByRole('button', { name: /Going/i })
    expect(goingBtn.className).toContain('bg-amber-500')
  })

  it('highlights Interested button when user status is interested', () => {
    render(<RsvpButton eventId="evt-1" currentStatus="interested" />)
    const interestedBtn = screen.getByRole('button', { name: /Interested/i })
    expect(interestedBtn.className).toContain('bg-amber-500')
  })
})
