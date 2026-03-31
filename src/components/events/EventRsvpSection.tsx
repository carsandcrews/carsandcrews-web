'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@/lib/supabase/client'
import { RsvpButton } from './RsvpButton'
import { VehicleSelector } from './VehicleSelector'

interface UserVehicle {
  id: string
  year: number
  make: string
  model: string
  thumbnail_url: string | null
}

interface EventRsvpSectionProps {
  eventId: string
  initialStatus: 'going' | 'interested' | null
  initialRsvpId: string | null
  initialVehicleId: string | null
}

export function EventRsvpSection({
  eventId,
  initialStatus,
  initialRsvpId,
  initialVehicleId
}: EventRsvpSectionProps) {
  const [rsvpStatus, setRsvpStatus] = useState(initialStatus)
  const [rsvpId, setRsvpId] = useState(initialRsvpId)
  const [vehicles, setVehicles] = useState<UserVehicle[]>([])
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(initialVehicleId)

  useEffect(() => {
    async function loadVehicles() {
      const supabase = createBrowserClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('vehicles')
        .select('id, year, make, model, vehicle_photos(thumbnail_url)')
        .eq('owner_id', user.id)
        .order('year', { ascending: false })

      if (data) {
        setVehicles(data.map((v: Record<string, unknown>) => ({
          id: v.id as string,
          year: v.year as number,
          make: v.make as string,
          model: v.model as string,
          thumbnail_url: (v.vehicle_photos as Array<{ thumbnail_url: string | null }>)?.[0]?.thumbnail_url || null
        })))
      }
    }
    loadVehicles()
  }, [])

  async function handleStatusChange(newStatus: 'going' | 'interested' | null, newRsvpId?: string) {
    setRsvpStatus(newStatus)
    if (newRsvpId) setRsvpId(newRsvpId)

    if (newStatus !== 'going') {
      setSelectedVehicleId(null)
      if (rsvpId) {
        const supabase = createBrowserClient()
        await supabase.from('rsvp_vehicles').delete().eq('rsvp_id', rsvpId)
      }
    }

    if (!newStatus) setRsvpId(null)
  }

  async function handleVehicleSelect(vehicleId: string | null) {
    if (!rsvpId) return
    setSelectedVehicleId(vehicleId)

    const supabase = createBrowserClient()
    await supabase.from('rsvp_vehicles').delete().eq('rsvp_id', rsvpId)

    if (vehicleId) {
      await supabase.from('rsvp_vehicles').insert({
        rsvp_id: rsvpId,
        vehicle_id: vehicleId
      })
    }
  }

  return (
    <div className="space-y-4">
      <RsvpButton
        eventId={eventId}
        currentStatus={rsvpStatus}
        onStatusChange={handleStatusChange}
      />
      {rsvpStatus === 'going' && vehicles.length > 0 ? (
        <VehicleSelector
          vehicles={vehicles}
          selectedId={selectedVehicleId}
          onSelect={handleVehicleSelect}
        />
      ) : null}
    </div>
  )
}
