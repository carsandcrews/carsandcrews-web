'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { formatEventDate } from '@/lib/utils'
import { generateSlug } from '@/lib/utils'

interface Submission {
  id: string
  name: string
  date: string
  city: string
  state: string
  location_name: string | null
  description: string | null
  source_url: string | null
  status: string
  submitted_by: string
  created_at: string
  submitter: { display_name: string; username: string } | null
}

export default function AdminSubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const supabase = createBrowserClient()

  useEffect(() => {
    loadSubmissions()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function loadSubmissions() {
    const { data } = await supabase
      .from('event_submissions')
      .select('*, submitter:profiles!submitted_by(display_name, username)')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
    setSubmissions((data || []) as Submission[])
  }

  async function handleApprove(submission: Submission) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Create event from submission
    const slug = generateSlug(submission.name)
    const { data: newEvent } = await supabase.from('events').insert({
      name: submission.name,
      slug,
      date: submission.date,
      city: submission.city,
      state: submission.state,
      location_name: submission.location_name,
      description: submission.description,
      source: 'submitted',
      source_url: submission.source_url,
      status: 'published',
      claimed: false,
      event_type: 'other',
      is_charity: false,
      is_free_spectator: false
    }).select().single()

    // Update submission status
    await supabase.from('event_submissions').update({
      status: 'approved',
      reviewed_by: user.id
    }).eq('id', submission.id)

    // Log action
    await supabase.from('admin_actions').insert({
      admin_id: user.id,
      action_type: 'approve',
      target_type: 'submission',
      target_id: submission.id
    })

    loadSubmissions()
  }

  async function handleReject(id: string) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('event_submissions').update({
      status: 'rejected',
      reviewed_by: user.id
    }).eq('id', id)

    await supabase.from('admin_actions').insert({
      admin_id: user.id,
      action_type: 'reject',
      target_type: 'submission',
      target_id: id,
      reason: rejectReason || null
    })

    setRejectingId(null)
    setRejectReason('')
    loadSubmissions()
  }

  return (
    <div className="px-6 py-8">
      <h1 className="text-2xl font-bold text-[#f5f5f0] mb-6">Submissions Queue</h1>

      {submissions.length === 0 ? (
        <p className="text-sm text-[#555]">No pending submissions</p>
      ) : (
        <div className="space-y-4">
          {submissions.map((sub) => (
            <div key={sub.id} className="rounded-xl border border-white/5 bg-[#1a1a1d] p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-[#f5f5f0]">{sub.name}</h3>
                  <p className="text-sm text-[#888]">
                    {formatEventDate(sub.date, null)} · {sub.city}, {sub.state}
                  </p>
                </div>
                <span className="text-xs text-[#555]">
                  {new Date(sub.created_at).toLocaleDateString()}
                </span>
              </div>

              {sub.location_name ? (
                <p className="text-sm text-[#f5f5f0]/70 mb-2">Venue: {sub.location_name}</p>
              ) : null}

              {sub.description ? (
                <p className="text-sm text-[#f5f5f0]/70 mb-2 whitespace-pre-wrap">{sub.description}</p>
              ) : null}

              {sub.source_url ? (
                <a
                  href={sub.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-amber-500 hover:text-amber-400 transition-colors mb-2 inline-block"
                >
                  Source link
                </a>
              ) : null}

              <div className="mt-3 border-t border-white/5 pt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-[#666]">
                  Submitted by <span className="text-[#f5f5f0]/70">{sub.submitter?.display_name || 'Unknown'}</span>
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  {rejectingId === sub.id ? (
                    <div className="flex flex-wrap items-center gap-2">
                      <input
                        type="text"
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="Reason (optional)"
                        className="rounded-lg bg-white/5 border border-white/10 px-3 py-1.5 text-sm text-white w-full sm:w-48"
                      />
                      <Button variant="ghost" onClick={() => handleReject(sub.id)} className="text-red-400 text-xs">
                        Confirm Reject
                      </Button>
                      <Button variant="ghost" onClick={() => setRejectingId(null)} className="text-xs">
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <>
                      <Button variant="ghost" onClick={() => setRejectingId(sub.id)} className="text-red-400 text-xs">
                        Reject
                      </Button>
                      <Button onClick={() => handleApprove(sub)} className="text-xs">
                        Approve
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
