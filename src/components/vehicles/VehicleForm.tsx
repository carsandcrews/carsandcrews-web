'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase/client'
import { useUpload } from '@/hooks/use-upload'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { NhtsaAutocomplete } from '@/components/vehicles/NhtsaAutocomplete'
import { generateSlug } from '@/lib/utils'
import { VEHICLE_STATUS_TAGS, VEHICLE_STATUS_LABELS, type VehicleStatusTag } from '@/lib/constants'

interface VehiclePhoto {
  id?: string
  url: string
  thumbnail_url?: string | null
  caption: string
  position: number
}

interface VehicleInitialData {
  id: string
  year: number
  make: string
  model: string
  body_style?: string
  status_tag: string
  description: string
  visibility: string
  slug: string
  specs?: {
    engine?: string
    transmission?: string
    drivetrain?: string
    paint_color?: string
    interior?: string
    wheels_tires?: string
  }
  photos?: VehiclePhoto[]
}

interface VehicleFormProps {
  mode?: 'add' | 'edit'
  initialData?: VehicleInitialData
}

const VISIBILITY_OPTIONS = [
  { value: 'public', label: 'Public' },
  { value: 'unlisted', label: 'Unlisted' },
  { value: 'private', label: 'Private' }
] as const

export function VehicleForm({ mode = 'add', initialData }: VehicleFormProps) {
  const router = useRouter()
  const { upload, uploads, isUploading } = useUpload()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [year, setYear] = useState(initialData?.year?.toString() || '')
  const [make, setMake] = useState(initialData?.make || '')
  const [model, setModel] = useState(initialData?.model || '')
  const [bodyStyle, setBodyStyle] = useState(initialData?.body_style || '')
  const [statusTag, setStatusTag] = useState<VehicleStatusTag>((initialData?.status_tag as VehicleStatusTag) || 'original')
  const [description, setDescription] = useState(initialData?.description || '')
  const [visibility, setVisibility] = useState(initialData?.visibility || 'public')
  const [photos, setPhotos] = useState<VehiclePhoto[]>(initialData?.photos || [])
  const [dragIdx, setDragIdx] = useState<number | null>(null)

  // Specs
  const [engine, setEngine] = useState(initialData?.specs?.engine || '')
  const [transmission, setTransmission] = useState(initialData?.specs?.transmission || '')
  const [drivetrain, setDrivetrain] = useState(initialData?.specs?.drivetrain || '')
  const [paintColor, setPaintColor] = useState(initialData?.specs?.paint_color || '')
  const [interior, setInterior] = useState(initialData?.specs?.interior || '')
  const [wheelsTires, setWheelsTires] = useState(initialData?.specs?.wheels_tires || '')

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  function validate(): boolean {
    const errs: Record<string, string> = {}
    if (!year.trim()) errs.year = 'Year is required'
    else if (isNaN(Number(year)) || Number(year) < 1886 || Number(year) > new Date().getFullYear() + 2) errs.year = 'Enter a valid year'
    if (!make.trim()) errs.make = 'Make is required'
    if (!model.trim()) errs.model = 'Model is required'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handlePhotoUpload(files: FileList) {
    const vehicleId = initialData?.id || 'temp'
    for (const file of Array.from(files)) {
      try {
        const result = await upload(file, 'vehicles', vehicleId)
        setPhotos((prev) => [...prev, {
          url: result.publicUrl,
          caption: '',
          position: prev.length
        }])
      } catch {
        // upload error handled by hook
      }
    }
  }

  function handleDragStart(idx: number) {
    setDragIdx(idx)
  }

  function handleDragOver(e: React.DragEvent, idx: number) {
    e.preventDefault()
    if (dragIdx === null || dragIdx === idx) return
    setPhotos((prev) => {
      const next = [...prev]
      const [moved] = next.splice(dragIdx, 1)
      next.splice(idx, 0, moved)
      return next.map((p, i) => ({ ...p, position: i }))
    })
    setDragIdx(idx)
  }

  function handleDragEnd() {
    setDragIdx(null)
  }

  function removePhoto(idx: number) {
    setPhotos((prev) => prev.filter((_, i) => i !== idx).map((p, i) => ({ ...p, position: i })))
  }

  function updateCaption(idx: number, caption: string) {
    setPhotos((prev) => prev.map((p, i) => i === idx ? { ...p, caption } : p))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    setSubmitting(true)
    try {
      const supabase = createBrowserClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/sign-in'); return }

      const slug = generateSlug(`${year} ${make} ${model}`)
      const vehicleData = {
        owner_id: user.id,
        year: Number(year),
        make: make.trim(),
        model: model.trim(),
        body_style: bodyStyle.trim() || null,
        status_tag: statusTag,
        description: description.trim() || null,
        visibility,
        slug
      }

      let vehicleId: string

      if (mode === 'edit' && initialData?.id) {
        vehicleId = initialData.id
        await supabase.from('vehicles').update(vehicleData).eq('id', vehicleId)
      } else {
        const { data, error } = await supabase.from('vehicles').insert(vehicleData).select('id').single()
        if (error) throw error
        vehicleId = data.id
      }

      // Upsert specs
      const specsData = { vehicle_id: vehicleId, engine: engine || null, transmission: transmission || null, drivetrain: drivetrain || null, paint_color: paintColor || null, interior: interior || null, wheels_tires: wheelsTires || null }
      await supabase.from('vehicle_specs').upsert(specsData, { onConflict: 'vehicle_id' })

      // Save photos
      if (photos.length > 0) {
        for (const photo of photos) {
          if (photo.id) {
            await supabase.from('vehicle_photos').update({ position: photo.position, caption: photo.caption || null }).eq('id', photo.id)
          } else {
            await supabase.from('vehicle_photos').insert({
              vehicle_id: vehicleId,
              url: photo.url,
              thumbnail_url: photo.thumbnail_url || null,
              position: photo.position,
              caption: photo.caption || null
            })
          }
        }
      }

      router.push('/garage')
    } catch {
      setErrors({ form: 'Failed to save vehicle. Please try again.' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {errors.form ? <p className="text-sm text-red-400">{errors.form}</p> : null}

      <div className="grid gap-4 sm:grid-cols-3">
        <Input label="Year" type="number" value={year} onChange={(e) => setYear(e.target.value)} error={errors.year} placeholder="1969" />
        <div>
          <NhtsaAutocomplete label="Make" value={make} onChange={setMake} year={year ? Number(year) : undefined} endpoint="makes" placeholder="Chevrolet" />
          {errors.make ? <p className="mt-1 text-sm text-red-400">{errors.make}</p> : null}
        </div>
        <div>
          <NhtsaAutocomplete label="Model" value={model} onChange={setModel} year={year ? Number(year) : undefined} make={make} endpoint="models" placeholder="Camaro" />
          {errors.model ? <p className="mt-1 text-sm text-red-400">{errors.model}</p> : null}
        </div>
      </div>

      <Input label="Body Style" value={bodyStyle} onChange={(e) => setBodyStyle(e.target.value)} placeholder="Coupe, Convertible, etc." />

      <div className="space-y-2">
        <p className="text-sm font-medium text-white/80">Status Tag</p>
        <div className="flex flex-wrap gap-2">
          {VEHICLE_STATUS_TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setStatusTag(tag)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-150 border ${
                statusTag === tag
                  ? 'bg-amber-500 text-black border-amber-500'
                  : 'bg-white/5 text-white/70 border-white/10 hover:bg-white/10'
              }`}
            >
              {VEHICLE_STATUS_LABELS[tag]}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="vehicle-description" className="block text-sm font-medium text-white/80">Description</label>
        <textarea
          id="vehicle-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          placeholder="Tell the story of this vehicle..."
          className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-white placeholder:text-white/30 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 hover:border-white/20 resize-none"
        />
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium text-white/80">Visibility</p>
        <div className="flex gap-2">
          {VISIBILITY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setVisibility(opt.value)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all duration-150 border ${
                visibility === opt.value
                  ? 'bg-amber-500 text-black border-amber-500'
                  : 'bg-white/5 text-white/70 border-white/10 hover:bg-white/10'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Photos */}
      <div className="space-y-3">
        <p className="text-sm font-medium text-white/80">Photos</p>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {photos.map((photo, idx) => (
            <div
              key={photo.url}
              draggable
              onDragStart={() => handleDragStart(idx)}
              onDragOver={(e) => handleDragOver(e, idx)}
              onDragEnd={handleDragEnd}
              className={`group relative aspect-square overflow-hidden rounded-xl bg-[#1a1a1d] border transition-all duration-150 cursor-grab ${
                dragIdx === idx ? 'border-amber-500 opacity-50' : 'border-white/10'
              }`}
            >
              <img src={photo.url} alt={photo.caption || `Photo ${idx + 1}`} className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => removePhoto(idx)}
                className="absolute top-1 right-1 rounded-full bg-black/60 p-1 opacity-0 transition-opacity duration-150 group-hover:opacity-100"
              >
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-white">
                  <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                </svg>
              </button>
              <input
                type="text"
                value={photo.caption}
                onChange={(e) => updateCaption(idx, e.target.value)}
                placeholder="Caption"
                className="absolute bottom-0 left-0 right-0 bg-black/60 px-2 py-1 text-xs text-white placeholder:text-white/40 border-none focus:outline-none"
              />
            </div>
          ))}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="flex aspect-square items-center justify-center rounded-xl border-2 border-dashed border-white/10 hover:border-white/20 transition-colors duration-150"
          >
            {isUploading ? (
              <span className="inline-block w-6 h-6 border-2 border-white/40 border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6 text-white/30">
                <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
              </svg>
            )}
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && handlePhotoUpload(e.target.files)}
        />
        {uploads.size > 0 ? (
          <div className="space-y-1">
            {Array.from(uploads.entries()).map(([id, progress]) => (
              <div key={id} className="flex items-center gap-2 text-xs text-white/60">
                <div className="h-1 flex-1 rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-amber-500 transition-all" style={{ width: `${progress.percent}%` }} />
                </div>
                <span>{progress.percent}%</span>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      {/* Specs */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-[#888]">Specs</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Engine" value={engine} onChange={(e) => setEngine(e.target.value)} placeholder="350 V8" />
          <Input label="Transmission" value={transmission} onChange={(e) => setTransmission(e.target.value)} placeholder="4-speed manual" />
          <Input label="Drivetrain" value={drivetrain} onChange={(e) => setDrivetrain(e.target.value)} placeholder="RWD" />
          <Input label="Paint Color" value={paintColor} onChange={(e) => setPaintColor(e.target.value)} placeholder="Rally Green" />
          <Input label="Interior" value={interior} onChange={(e) => setInterior(e.target.value)} placeholder="Black vinyl" />
          <Input label="Wheels / Tires" value={wheelsTires} onChange={(e) => setWheelsTires(e.target.value)} placeholder='15" Rally wheels' />
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="submit" loading={submitting}>
          {mode === 'edit' ? 'Save Changes' : 'Add Vehicle'}
        </Button>
        <Button type="button" variant="secondary" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
