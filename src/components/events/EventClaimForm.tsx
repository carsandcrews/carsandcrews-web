'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

interface EventClaimFormProps {
  eventId: string
  eventName: string
}

export function EventClaimForm({ eventId, eventName }: EventClaimFormProps) {
  const router = useRouter()
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!message.trim()) {
      setError('Please explain why you\'re the organizer')
      return
    }

    setSubmitting(true)
    try {
      const supabase = createBrowserClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/sign-in')
        return
      }

      const { error: insertError } = await supabase
        .from('event_claims')
        .insert({
          event_id: eventId,
          user_id: user.id,
          message: message.trim(),
          status: 'pending'
        })

      if (insertError) throw insertError
      setSubmitted(true)
    } catch {
      setError('Failed to submit claim. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="rounded-xl bg-green-500/10 border border-green-500/20 p-6 text-center">
        <p className="text-green-400 font-semibold">Your claim has been submitted for review.</p>
        <p className="mt-2 text-sm text-white/60">We'll review your claim and get back to you soon.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-[#f5f5f0]">
          Claim: {eventName}
        </h2>
        <p className="mt-1 text-sm text-[#888]">
          Tell us why you're the organizer of this event.
        </p>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="claim-message" className="block text-sm font-medium text-white/80">
          Message
        </label>
        <textarea
          id="claim-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          placeholder="I'm the organizer because..."
          className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-white placeholder:text-white/30 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 hover:border-white/20 resize-none"
        />
        {error ? <p className="text-sm text-red-400">{error}</p> : null}
      </div>

      <Button type="submit" loading={submitting}>
        Submit Claim
      </Button>
    </form>
  )
}
