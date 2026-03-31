'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

interface Claim {
  id: string
  event_id: string
  user_id: string
  status: string
  message: string | null
  created_at: string
  event: { id: string; name: string; slug: string; date: string } | null
  claimant: { display_name: string; username: string } | null
}

export default function AdminClaimsPage() {
  const [claims, setClaims] = useState<Claim[]>([])
  const [loading, setLoading] = useState<string | null>(null)
  const supabase = createBrowserClient()

  useEffect(() => {
    loadClaims()
  }, [])

  async function loadClaims() {
    const { data } = await supabase
      .from('event_claims')
      .select('*, event:events!event_id(id, name, slug, date), claimant:profiles!user_id(display_name, username)')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
    setClaims((data || []) as unknown as Claim[])
  }

  async function handleApprove(claim: Claim) {
    setLoading(claim.id)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('events').update({
      claimed: true,
      claimed_by: claim.user_id
    }).eq('id', claim.event_id)

    await supabase.from('event_claims').update({
      status: 'approved',
      reviewed_by: user.id
    }).eq('id', claim.id)

    await supabase.from('admin_actions').insert({
      admin_id: user.id,
      action_type: 'approve',
      target_type: 'claim',
      target_id: claim.id
    })

    setLoading(null)
    loadClaims()
  }

  async function handleReject(claim: Claim) {
    setLoading(claim.id)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('event_claims').update({
      status: 'rejected',
      reviewed_by: user.id
    }).eq('id', claim.id)

    await supabase.from('admin_actions').insert({
      admin_id: user.id,
      action_type: 'reject',
      target_type: 'claim',
      target_id: claim.id
    })

    setLoading(null)
    loadClaims()
  }

  return (
    <div className="px-6 py-8">
      <h1 className="text-2xl font-bold text-[#f5f5f0] mb-6">Claims Queue</h1>

      {claims.length === 0 ? (
        <p className="text-sm text-[#555]">No pending claims</p>
      ) : (
        <div className="space-y-4">
          {claims.map((c) => (
            <div
              key={c.id}
              className="rounded-xl border border-white/5 bg-white/[0.02] p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg font-semibold text-[#f5f5f0]">
                    {c.event?.name || 'Unknown Event'}
                  </h3>
                  <div className="mt-1 text-sm text-[#888]">
                    Claimed by {c.claimant?.display_name || 'Unknown'}{' '}
                    <span className="text-[#555]">@{c.claimant?.username || '?'}</span>
                  </div>
                  {c.message ? (
                    <p className="mt-2 text-sm text-[#f5f5f0]/70 italic">"{c.message}"</p>
                  ) : null}
                  <div className="mt-2 text-xs text-[#555]">
                    {new Date(c.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Button
                    variant="primary"
                    onClick={() => handleApprove(c)}
                    disabled={loading === c.id}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => handleReject(c)}
                    disabled={loading === c.id}
                    className="text-red-400 hover:text-red-300"
                  >
                    Reject
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
