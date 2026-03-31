'use client'

import { useState, useEffect, useCallback } from 'react'
import { createBrowserClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { EVENT_TYPE_LABELS, type EventType } from '@/lib/constants'
import { formatEventDate } from '@/lib/utils'

interface Event {
  id: string
  name: string
  slug: string
  date: string
  city: string
  state: string
  event_type: string
  source: string
  status: string
  claimed: boolean
}

export default function AdminEventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [filterSource, setFilterSource] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const supabase = createBrowserClient()

  const loadEvents = useCallback(async () => {
    let query = supabase
      .from('events')
      .select('id, name, slug, date, city, state, event_type, source, status, claimed')
      .order('date', { ascending: false })

    if (filterSource) query = query.eq('source', filterSource)
    if (filterStatus) query = query.eq('status', filterStatus)

    const { data } = await query
    setEvents((data || []) as Event[])
  }, [supabase, filterSource, filterStatus])

  useEffect(() => {
    loadEvents()
  }, [loadEvents])

  async function handleDelete(id: string) {
    if (!confirm('Delete this event?')) return
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('events').delete().eq('id', id)
    if (user) {
      await supabase.from('admin_actions').insert({
        admin_id: user.id,
        action_type: 'delete',
        target_type: 'event',
        target_id: id
      })
    }
    loadEvents()
  }

  async function handleStatusChange(id: string, status: string) {
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('events').update({ status }).eq('id', id)
    if (user) {
      await supabase.from('admin_actions').insert({
        admin_id: user.id,
        action_type: 'update',
        target_type: 'event',
        target_id: id
      })
    }
    loadEvents()
  }

  async function handleBulkDelete() {
    if (selected.size === 0) return
    if (!confirm(`Delete ${selected.size} events?`)) return
    const { data: { user } } = await supabase.auth.getUser()
    for (const id of selected) {
      await supabase.from('events').delete().eq('id', id)
      if (user) {
        await supabase.from('admin_actions').insert({
          admin_id: user.id,
          action_type: 'delete',
          target_type: 'event',
          target_id: id
        })
      }
    }
    setSelected(new Set())
    loadEvents()
  }

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleSelectAll() {
    if (selected.size === events.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(events.map((e) => e.id)))
    }
  }

  const statusColors: Record<string, string> = {
    published: 'text-emerald-400',
    draft: 'text-amber-400',
    cancelled: 'text-red-400'
  }

  return (
    <div className="px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#f5f5f0]">Manage Events</h1>
        {selected.size > 0 ? (
          <Button variant="ghost" onClick={handleBulkDelete} className="text-red-400 hover:text-red-300">
            Delete {selected.size} Selected
          </Button>
        ) : null}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div>
          <label htmlFor="source-filter" className="block text-xs font-medium text-[#888] mb-1">Source</label>
          <select
            id="source-filter"
            value={filterSource}
            onChange={(e) => setFilterSource(e.target.value)}
            className="rounded-lg bg-white/5 border border-white/10 px-3 py-1.5 text-sm text-white"
          >
            <option value="">All</option>
            <option value="crawled">Crawled</option>
            <option value="submitted">Submitted</option>
            <option value="organizer">Organizer</option>
          </select>
        </div>
        <div>
          <label htmlFor="status-filter" className="block text-xs font-medium text-[#888] mb-1">Status</label>
          <select
            id="status-filter"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-lg bg-white/5 border border-white/10 px-3 py-1.5 text-sm text-white"
          >
            <option value="">All</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-white/5">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5 bg-white/[0.02]">
              <th className="px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selected.size === events.length && events.length > 0}
                  onChange={toggleSelectAll}
                  className="rounded"
                />
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#888]">Name</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#888]">Date</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#888]">Location</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#888]">Source</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#888]">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#888]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr key={event.id} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selected.has(event.id)}
                    onChange={() => toggleSelect(event.id)}
                    className="rounded"
                  />
                </td>
                <td className="px-4 py-3">
                  <div className="font-semibold text-[#f5f5f0]">{event.name}</div>
                  <div className="text-xs text-[#666]">{EVENT_TYPE_LABELS[event.event_type as EventType] || event.event_type}</div>
                </td>
                <td className="px-4 py-3 text-[#f5f5f0]/70">{formatEventDate(event.date, null)}</td>
                <td className="px-4 py-3 text-[#f5f5f0]/70">{event.city}, {event.state}</td>
                <td className="px-4 py-3">
                  <span className="text-xs text-[#888]">{event.source}</span>
                  {event.claimed ? <span className="ml-1 text-[10px] text-amber-500">Claimed</span> : null}
                </td>
                <td className="px-4 py-3">
                  <select
                    value={event.status}
                    onChange={(e) => handleStatusChange(event.id, e.target.value)}
                    className={`rounded bg-transparent text-xs font-semibold ${statusColors[event.status] || 'text-[#888]'}`}
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => handleDelete(event.id)}
                    className="text-xs text-red-400/70 hover:text-red-400 transition-colors"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {events.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-sm text-[#555]">
                  No events found
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  )
}
