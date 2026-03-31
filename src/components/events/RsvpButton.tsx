'use client'

import { useState } from 'react'
import { createBrowserClient } from '@/lib/supabase/client'

interface RsvpButtonProps {
  eventId: string
  currentStatus: 'going' | 'interested' | null
  onStatusChange?: (status: 'going' | 'interested' | null, rsvpId?: string) => void
}

export function RsvpButton({ eventId, currentStatus, onStatusChange }: RsvpButtonProps) {
  const [status, setStatus] = useState(currentStatus)
  const [loading, setLoading] = useState(false)

  async function handleRsvp(newStatus: 'going' | 'interested') {
    setLoading(true)
    try {
      const supabase = createBrowserClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      if (status === newStatus) {
        await supabase
          .from('rsvps')
          .delete()
          .eq('event_id', eventId)
          .eq('user_id', user.id)
        setStatus(null)
        onStatusChange?.(null)
      } else {
        const { data } = await supabase
          .from('rsvps')
          .upsert(
            { event_id: eventId, user_id: user.id, status: newStatus },
            { onConflict: 'event_id,user_id' }
          )
          .select('id')
          .single()
        setStatus(newStatus)
        onStatusChange?.(newStatus, data?.id)
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }

  const baseClass = 'rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a12]'
  const activeClass = 'bg-amber-500 text-black focus-visible:ring-amber-500'
  const inactiveClass = 'bg-white/5 text-white hover:bg-white/10 border border-white/10 focus-visible:ring-white/30'

  return (
    <div className="flex gap-2">
      <button
        type="button"
        disabled={loading}
        onClick={() => handleRsvp('going')}
        className={`${baseClass} ${status === 'going' ? activeClass : inactiveClass}`}
      >
        Going
      </button>
      <button
        type="button"
        disabled={loading}
        onClick={() => handleRsvp('interested')}
        className={`${baseClass} ${status === 'interested' ? activeClass : inactiveClass}`}
      >
        Interested
      </button>
    </div>
  )
}
