'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@/lib/supabase/client'
import { formatEventType } from '@/lib/utils'
import { VEHICLE_STATUS_LABELS, type VehicleStatusTag } from '@/lib/constants'

interface Vehicle {
  id: string
  year: number
  make: string
  model: string
  slug: string
  status_tag: string
  photo_url: string | null
}

interface RsvpEvent {
  id: string
  status: string
  event: {
    id: string
    name: string
    slug: string
    date: string
    city: string
    state: string
    event_type: string
  }
}

interface Submission {
  id: string
  name: string
  status: string
  created_at: string
}

export default function DashboardPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [rsvps, setRsvps] = useState<RsvpEvent[]>([])
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const supabase = createBrowserClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const [vehiclesRes, rsvpsRes, submissionsRes] = await Promise.all([
        supabase.from('vehicles').select('id, year, make, model, slug, status_tag, vehicle_photos(url, position)').eq('owner_id', user.id).order('created_at', { ascending: false }),
        supabase.from('rsvps').select('id, status, event:events!inner(id, name, slug, date, city, state, event_type)').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('event_submissions').select('id, name, status, created_at').eq('submitted_by', user.id).order('created_at', { ascending: false })
      ])

      setVehicles((vehiclesRes.data || []).map((v: Record<string, unknown>) => {
        const photos = (v.vehicle_photos as Array<{ url: string; position: number }>) || []
        const firstPhoto = photos.sort((a, b) => a.position - b.position)[0]
        return { ...v, photo_url: firstPhoto?.url || null }
      }) as unknown as Vehicle[])
      setRsvps((rsvpsRes.data || []) as unknown as RsvpEvent[])
      setSubmissions((submissionsRes.data || []) as unknown as Submission[])
    }
    load()
  }, [supabase])

  const statusColors: Record<string, string> = {
    pending: 'text-amber-400 bg-amber-500/10',
    approved: 'text-emerald-400 bg-emerald-500/10',
    rejected: 'text-red-400 bg-red-500/10'
  }

  return (
    <main className="min-h-screen bg-[#111113]">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
          <h1 className="text-2xl font-bold text-[#f5f5f0]">Dashboard</h1>
          <div className="flex gap-3">
            <a
              href="/garage/new"
              className="inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold bg-amber-500 text-black hover:bg-amber-400 transition-all duration-150"
            >
              Add Vehicle
            </a>
            <a
              href="/events/submit"
              className="inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold bg-white/5 text-white hover:bg-white/10 border border-white/10 transition-all duration-150"
            >
              Submit Event
            </a>
          </div>
        </div>

        {/* My Vehicles */}
        <section className="mb-10">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#888]">My Vehicles</h2>
          {vehicles.length > 0 ? (
            <div className="space-y-0">
              {vehicles.map((v) => (
                <a
                  key={v.id}
                  href={`/garage/${v.id}/edit`}
                  className="flex items-center gap-3 py-3 border-b border-white/[0.04] transition-colors duration-150 hover:bg-white/[0.02] -mx-2 px-2 rounded-lg"
                >
                  {v.photo_url ? (
                    <img
                      src={v.photo_url}
                      alt={`${v.year} ${v.make} ${v.model}`}
                      className="h-12 w-12 rounded-lg object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                      <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 text-white/30">
                        <path d="M1 8.25a1.25 1.25 0 112.5 0v7.5a1.25 1.25 0 11-2.5 0v-7.5zM7.25 3v1.325C8.692 5.186 9.998 6.312 10.745 7.5H15.5A1.5 1.5 0 0117 9v1a1.5 1.5 0 01-1.5 1.5h-.628a5.003 5.003 0 01-2.872 3.5V17.5a1.5 1.5 0 01-1.5 1.5h-2A1.5 1.5 0 017 17.5V15H5.5A1.5 1.5 0 014 13.5V8.25A1.25 1.25 0 015.25 7h2V3z" />
                      </svg>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-[15px] font-semibold text-[#f5f5f0]">
                      {v.year} {v.make} {v.model}
                    </div>
                    <div className="text-xs text-[#666]">
                      {VEHICLE_STATUS_LABELS[v.status_tag as VehicleStatusTag] || v.status_tag}
                    </div>
                  </div>
                  <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-white/20">
                    <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                  </svg>
                </a>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[#555]">No vehicles yet. Add your first ride!</p>
          )}
        </section>

        {/* My RSVPs */}
        <section className="mb-10 border-t border-white/5 pt-6">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#888]">My RSVPs</h2>
          {rsvps.length > 0 ? (
            <div className="space-y-0">
              {rsvps.map((r) => {
                const event = r.event
                const d = new Date(event.date + 'T00:00:00')
                const month = d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()
                const day = d.getDate()
                return (
                  <a
                    key={r.id}
                    href={`/events/${event.state.toLowerCase()}/${event.slug}`}
                    className="flex items-center gap-4 py-3 border-b border-white/[0.04] transition-colors duration-150 hover:bg-white/[0.02] -mx-2 px-2 rounded-lg"
                  >
                    <div className="w-12 text-center flex-shrink-0">
                      <div className="text-[11px] font-bold text-amber-500 tracking-wide">{month}</div>
                      <div className="text-2xl font-black text-[#f5f5f0] leading-none">{day}</div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[15px] font-semibold text-[#f5f5f0] truncate">{event.name}</div>
                      <div className="text-xs text-[#666]">
                        {event.city}, {event.state} · {formatEventType(event.event_type)} · {r.status}
                      </div>
                    </div>
                  </a>
                )
              })}
            </div>
          ) : (
            <p className="text-sm text-[#555]">No RSVPs yet. Find events to attend!</p>
          )}
        </section>

        {/* My Submissions */}
        <section className="border-t border-white/5 pt-6">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#888]">My Submissions</h2>
          {submissions.length > 0 ? (
            <div className="space-y-0">
              {submissions.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between py-3 border-b border-white/[0.04] -mx-2 px-2"
                >
                  <div>
                    <div className="text-[15px] font-semibold text-[#f5f5f0]">{s.name}</div>
                    <div className="text-xs text-[#666]">
                      Submitted {new Date(s.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  </div>
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${statusColors[s.status] || 'text-[#888] bg-white/5'}`}>
                    {s.status.charAt(0).toUpperCase() + s.status.slice(1)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[#555]">No submissions yet.</p>
          )}
        </section>
      </div>
    </main>
  )
}
