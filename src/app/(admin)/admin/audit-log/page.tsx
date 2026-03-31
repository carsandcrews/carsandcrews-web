'use client'

import { useState, useEffect, useCallback } from 'react'
import { createBrowserClient } from '@/lib/supabase/client'
import { ADMIN_ACTION_TYPES, ADMIN_TARGET_TYPES, type AdminActionType, type AdminTargetType } from '@/lib/constants'

interface AuditAction {
  id: string
  action_type: string
  target_type: string
  target_id: string
  reason: string | null
  created_at: string
  admin: { display_name: string; username: string } | null
}

export default function AdminAuditLogPage() {
  const [actions, setActions] = useState<AuditAction[]>([])
  const [filterAction, setFilterAction] = useState('')
  const [filterTarget, setFilterTarget] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const supabase = createBrowserClient()

  const loadActions = useCallback(async () => {
    let query = supabase
      .from('admin_actions')
      .select('id, action_type, target_type, target_id, reason, created_at, admin:profiles!admin_id(display_name, username)')

    if (filterAction) query = query.eq('action_type', filterAction)
    if (filterTarget) query = query.eq('target_type', filterTarget)
    if (dateFrom) query = query.gte('created_at', dateFrom + 'T00:00:00Z')
    if (dateTo) query = query.lte('created_at', dateTo + 'T23:59:59Z')

    const { data } = await query.order('created_at', { ascending: false })
    setActions((data || []) as unknown as AuditAction[])
  }, [supabase, filterAction, filterTarget, dateFrom, dateTo])

  useEffect(() => {
    loadActions()
  }, [loadActions])

  const actionColors: Record<string, string> = {
    approve: 'text-emerald-400 bg-emerald-500/10',
    reject: 'text-red-400 bg-red-500/10',
    create: 'text-blue-400 bg-blue-500/10',
    update: 'text-amber-400 bg-amber-500/10',
    delete: 'text-red-400 bg-red-500/10'
  }

  return (
    <div className="px-6 py-8">
      <h1 className="text-2xl font-bold text-[#f5f5f0] mb-6">Audit Log</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div>
          <label htmlFor="action-filter" className="block text-xs font-medium text-[#888] mb-1">Action Type</label>
          <select
            id="action-filter"
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="rounded-lg bg-white/5 border border-white/10 px-3 py-1.5 text-sm text-white"
          >
            <option value="">All Actions</option>
            {ADMIN_ACTION_TYPES.map((t) => (
              <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="target-filter" className="block text-xs font-medium text-[#888] mb-1">Target Type</label>
          <select
            id="target-filter"
            value={filterTarget}
            onChange={(e) => setFilterTarget(e.target.value)}
            className="rounded-lg bg-white/5 border border-white/10 px-3 py-1.5 text-sm text-white"
          >
            <option value="">All Targets</option>
            {ADMIN_TARGET_TYPES.map((t) => (
              <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="date-from" className="block text-xs font-medium text-[#888] mb-1">From</label>
          <input
            id="date-from"
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="rounded-lg bg-white/5 border border-white/10 px-3 py-1.5 text-sm text-white"
          />
        </div>
        <div>
          <label htmlFor="date-to" className="block text-xs font-medium text-[#888] mb-1">To</label>
          <input
            id="date-to"
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="rounded-lg bg-white/5 border border-white/10 px-3 py-1.5 text-sm text-white"
          />
        </div>
      </div>

      {/* Log entries */}
      <div className="space-y-0 rounded-xl border border-white/5 overflow-hidden">
        {actions.map((a) => (
          <div
            key={a.id}
            className="flex items-center gap-4 px-5 py-4 border-b border-white/[0.03] hover:bg-white/[0.02]"
          >
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${actionColors[a.action_type] || 'text-[#888] bg-white/5'}`}>
              {a.action_type}
            </span>
            <div className="flex-1 min-w-0">
              <div className="text-sm text-[#f5f5f0]">
                {a.action_type} {a.target_type} <span className="text-[#555] font-mono text-xs">{a.target_id.slice(0, 8)}</span>
              </div>
              {a.reason ? (
                <div className="text-xs text-[#888] mt-0.5">Reason: {a.reason}</div>
              ) : null}
              <div className="text-xs text-[#555]">
                <span>{a.admin?.display_name || 'Unknown'}</span> · {a.target_type}
              </div>
            </div>
            <div className="text-xs text-[#555] flex-shrink-0">
              {new Date(a.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}{' '}
              {new Date(a.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
            </div>
          </div>
        ))}
        {actions.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm text-[#555]">
            No actions recorded
          </div>
        ) : null}
      </div>
    </div>
  )
}
