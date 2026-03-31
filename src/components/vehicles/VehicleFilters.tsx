'use client'

import { VEHICLE_STATUS_TAGS, VEHICLE_STATUS_LABELS } from '@/lib/constants'

const ERAS = [
  { value: '', label: 'All Eras' },
  { value: 'pre-1950', label: 'Pre-1950' },
  { value: '1950s', label: '1950s' },
  { value: '1960s', label: '1960s' },
  { value: '1970s', label: '1970s' },
  { value: '1980s', label: '1980s' },
  { value: '1990s', label: '1990s' },
  { value: '2000s', label: '2000s' },
  { value: '2010s', label: '2010s+' }
] as const

const POPULAR_MAKES = [
  '', 'Chevrolet', 'Ford', 'Dodge', 'Plymouth', 'Pontiac', 'Buick', 'Cadillac',
  'Oldsmobile', 'AMC', 'Mercury', 'Lincoln', 'Chrysler', 'Jeep', 'Toyota', 'Honda',
  'Nissan', 'BMW', 'Mercedes-Benz', 'Porsche', 'Volkswagen'
]

interface VehicleFiltersProps {
  selectedMake: string
  selectedEra: string
  selectedStatus: string
  onFilterChange: (key: string, value: string) => void
}

export function VehicleFilters({ selectedMake, selectedEra, selectedStatus, onFilterChange }: VehicleFiltersProps) {
  const selectClass = 'rounded-full bg-white/5 border border-white/10 px-4 py-2 text-sm text-white transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-amber-500/50 hover:border-white/20 appearance-none cursor-pointer'

  return (
    <div className="flex flex-wrap gap-3">
      <div>
        <label htmlFor="vehicle-make-filter" className="sr-only">Make</label>
        <select
          id="vehicle-make-filter"
          value={selectedMake}
          onChange={(e) => onFilterChange('make', e.target.value)}
          className={selectClass}
        >
          <option value="">All Makes</option>
          {POPULAR_MAKES.filter(Boolean).map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="vehicle-era-filter" className="sr-only">Era</label>
        <select
          id="vehicle-era-filter"
          value={selectedEra}
          onChange={(e) => onFilterChange('era', e.target.value)}
          className={selectClass}
        >
          {ERAS.map((era) => (
            <option key={era.value} value={era.value}>{era.label}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="vehicle-status-filter" className="sr-only">Status</label>
        <select
          id="vehicle-status-filter"
          value={selectedStatus}
          onChange={(e) => onFilterChange('status', e.target.value)}
          className={selectClass}
        >
          <option value="">All Statuses</option>
          {VEHICLE_STATUS_TAGS.map((tag) => (
            <option key={tag} value={tag}>{VEHICLE_STATUS_LABELS[tag]}</option>
          ))}
        </select>
      </div>
    </div>
  )
}
