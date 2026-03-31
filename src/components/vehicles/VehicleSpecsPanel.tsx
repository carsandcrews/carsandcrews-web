interface VehicleSpecsPanelProps {
  engine?: string | null
  transmission?: string | null
  drivetrain?: string | null
  paintColor?: string | null
  interior?: string | null
  wheelsTires?: string | null
}

const specFields: { key: keyof VehicleSpecsPanelProps; label: string }[] = [
  { key: 'engine', label: 'Engine' },
  { key: 'transmission', label: 'Transmission' },
  { key: 'drivetrain', label: 'Drivetrain' },
  { key: 'paintColor', label: 'Paint Color' },
  { key: 'interior', label: 'Interior' },
  { key: 'wheelsTires', label: 'Wheels / Tires' }
]

export function VehicleSpecsPanel(props: VehicleSpecsPanelProps) {
  const filledSpecs = specFields.filter(({ key }) => props[key])
  if (filledSpecs.length === 0) return null

  return (
    <div className="border-t border-white/5 pt-6">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#888]">Specs</h2>
      <dl className="grid gap-3 sm:grid-cols-2">
        {filledSpecs.map(({ key, label }) => (
          <div key={key}>
            <dt className="text-xs text-[#666]">{label}</dt>
            <dd className="text-sm text-[#f5f5f0]">{props[key]}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
