'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@/lib/supabase/client'
import { VEHICLE_STATUS_LABELS, type VehicleStatusTag } from '@/lib/constants'

interface Vehicle {
  id: string
  year: number
  make: string
  model: string
  slug: string
  status_tag: string
  visibility: string
  created_at: string
  owner: { display_name: string; username: string } | null
}

export default function AdminVehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const supabase = createBrowserClient()

  useEffect(() => {
    loadVehicles()
  }, [])

  async function loadVehicles() {
    const { data } = await supabase
      .from('vehicles')
      .select('id, year, make, model, slug, status_tag, visibility, created_at, owner:profiles!owner_id(display_name, username)')
      .order('created_at', { ascending: false })
    setVehicles((data || []) as Vehicle[])
  }

  async function handleRemove(vehicle: Vehicle) {
    if (!confirm(`Remove "${vehicle.year} ${vehicle.make} ${vehicle.model}"?`)) return
    await supabase.from('vehicles').delete().eq('id', vehicle.id)
    loadVehicles()
  }

  async function toggleVisibility(vehicle: Vehicle) {
    const newVisibility = vehicle.visibility === 'public' ? 'private' : 'public'
    await supabase.from('vehicles').update({ visibility: newVisibility }).eq('id', vehicle.id)
    loadVehicles()
  }

  return (
    <div className="px-6 py-8">
      <h1 className="text-2xl font-bold text-[#f5f5f0] mb-6">Manage Vehicles</h1>

      <div className="overflow-x-auto rounded-xl border border-white/5">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5 bg-white/[0.02]">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#888]">Vehicle</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#888]">Owner</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#888]">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#888]">Visibility</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#888]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map((v) => (
              <tr key={v.id} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                <td className="px-4 py-3">
                  <div className="font-semibold text-[#f5f5f0]">
                    {v.year} {v.make} {v.model}
                  </div>
                  <div className="text-xs text-[#666]">{v.slug}</div>
                </td>
                <td className="px-4 py-3">
                  <div className="text-[#f5f5f0]/70">{v.owner?.display_name || 'Unknown'}</div>
                  <div className="text-xs text-[#666]">@{v.owner?.username || '?'}</div>
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs text-[#888]">
                    {VEHICLE_STATUS_LABELS[v.status_tag as VehicleStatusTag] || v.status_tag}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => toggleVisibility(v)}
                    className={`text-xs font-semibold ${v.visibility === 'public' ? 'text-emerald-400' : 'text-[#888]'}`}
                  >
                    {v.visibility}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => handleRemove(v)}
                    className="text-xs text-red-400/70 hover:text-red-400 transition-colors"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
            {vehicles.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-[#555]">
                  No vehicles found
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  )
}
