'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useCallback } from 'react'
import { VehicleCard } from '@/components/vehicles/VehicleCard'
import { VehicleFilters } from '@/components/vehicles/VehicleFilters'
import type { VehicleStatusTag } from '@/lib/constants'

interface VehicleItem {
  id: string
  year: number
  make: string
  model: string
  statusTag: VehicleStatusTag
  slug: string
  photoUrl: string | null
  ownerName: string
  ownerUsername: string
}

interface VehiclesExploreClientProps {
  initialVehicles: VehicleItem[]
  initialMake: string
  initialEra: string
  initialStatus: string
  currentPage: number
  totalPages: number
}

export function VehiclesExploreClient({
  initialVehicles,
  initialMake,
  initialEra,
  initialStatus,
  currentPage,
  totalPages
}: VehiclesExploreClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [make] = useState(initialMake)
  const [era] = useState(initialEra)
  const [status] = useState(initialStatus)

  const buildUrl = useCallback((overrides: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString())
    Object.entries(overrides).forEach(([key, value]) => {
      if (value) params.set(key, value)
      else params.delete(key)
    })
    params.delete('page')
    return `/vehicles?${params.toString()}`
  }, [searchParams])

  function handleFilterChange(key: string, value: string) {
    router.push(buildUrl({ [key]: value || undefined }))
  }

  return (
    <div className="space-y-6">
      <VehicleFilters
        selectedMake={make}
        selectedEra={era}
        selectedStatus={status}
        onFilterChange={handleFilterChange}
      />

      {initialVehicles.length === 0 ? (
        <p className="text-center text-sm text-[#666] py-12">No vehicles found. Try adjusting your filters.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {initialVehicles.map((v) => (
            <VehicleCard
              key={v.id}
              year={v.year}
              make={v.make}
              model={v.model}
              statusTag={v.statusTag}
              slug={v.slug}
              photoUrl={v.photoUrl}
              ownerName={v.ownerName}
              ownerUsername={v.ownerUsername}
            />
          ))}
        </div>
      )}

      {totalPages > 1 ? (
        <div className="flex items-center justify-center gap-3 pt-4">
          {currentPage > 1 ? (
            <a
              href={buildUrl({ page: String(currentPage - 1) })}
              className="rounded-full bg-white/5 px-4 py-2 text-sm text-white hover:bg-white/10 border border-white/10 transition-all duration-150"
            >
              Previous
            </a>
          ) : null}
          <span className="text-sm text-[#888]">
            Page {currentPage} of {totalPages}
          </span>
          {currentPage < totalPages ? (
            <a
              href={buildUrl({ page: String(currentPage + 1) })}
              className="rounded-full bg-white/5 px-4 py-2 text-sm text-white hover:bg-white/10 border border-white/10 transition-all duration-150"
            >
              Next
            </a>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
