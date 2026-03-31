'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { EVENT_TYPES, EVENT_TYPE_LABELS, type EventType } from '@/lib/constants'
import { US_STATES } from '@/lib/constants'
import { useUpload } from '@/hooks/use-upload'
import { createBrowserClient } from '@/lib/supabase/client'
import { generateSlug } from '@/lib/utils'

interface FormErrors {
  name?: string
  date?: string
  city?: string
  state?: string
  [key: string]: string | undefined
}

export function EventCreateForm() {
  const router = useRouter()
  const { upload, isUploading } = useUpload()
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [bannerUrl, setBannerUrl] = useState<string | null>(null)

  const [form, setForm] = useState({
    name: '',
    eventType: 'car_show' as EventType,
    date: '',
    endDate: '',
    startTime: '',
    endTime: '',
    locationName: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    description: '',
    website: '',
    registrationUrl: '',
    admissionFeeText: '',
    isFreeSpectator: false,
    isCharity: false,
    contactEmail: '',
    contactPhone: ''
  })

  function updateField(field: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }

  function validate(): FormErrors {
    const errs: FormErrors = {}
    if (!form.name.trim()) errs.name = 'Event name is required'
    if (!form.date) errs.date = 'Date is required'
    if (!form.city.trim()) errs.city = 'City is required'
    if (!form.state) errs.state = 'State is required'
    return errs
  }

  async function handleBannerUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const tempId = `event-${Date.now()}`
    const result = await upload(file, 'events', tempId)
    setBannerUrl(result.publicUrl)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }

    setLoading(true)
    const supabase = createBrowserClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setLoading(false)
      return
    }

    const slug = generateSlug(form.name)

    const { error } = await supabase.from('events').insert({
      name: form.name,
      slug,
      event_type: form.eventType,
      is_charity: form.isCharity,
      date: form.date,
      end_date: form.endDate || null,
      start_time: form.startTime || null,
      end_time: form.endTime || null,
      location_name: form.locationName || null,
      address: form.address || null,
      city: form.city,
      state: form.state,
      zip: form.zip || null,
      description: form.description || null,
      website: form.website || null,
      registration_url: form.registrationUrl || null,
      admission_fee_text: form.admissionFeeText || null,
      is_free_spectator: form.isFreeSpectator,
      contact_email: form.contactEmail || null,
      contact_phone: form.contactPhone || null,
      banner_url: bannerUrl,
      source: 'organizer',
      created_by: user.id,
      claimed: true,
      claimed_by: user.id,
      status: 'published'
    })

    setLoading(false)

    if (error) {
      setErrors({ name: error.message })
      return
    }

    router.push(`/events/${form.state.toLowerCase()}/${slug}`)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        label="Event Name"
        value={form.name}
        onChange={(e) => updateField('name', e.target.value)}
        error={errors.name}
        aria-required="true"
      />

      <div>
        <label htmlFor="event-type" className="block text-sm font-medium text-white/80 mb-1.5">
          Event Type
        </label>
        <select
          id="event-type"
          value={form.eventType}
          onChange={(e) => updateField('eventType', e.target.value)}
          className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-white transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50"
        >
          {EVENT_TYPES.map((type) => (
            <option key={type} value={type}>{EVENT_TYPE_LABELS[type]}</option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="is-charity"
          checked={form.isCharity}
          onChange={(e) => updateField('isCharity', e.target.checked)}
          className="rounded border-white/10 bg-white/5 text-amber-500 focus:ring-amber-500/50"
        />
        <label htmlFor="is-charity" className="text-sm text-white/80">This is a charity event</label>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Date"
          type="date"
          value={form.date}
          onChange={(e) => updateField('date', e.target.value)}
          error={errors.date}
          aria-required="true"
        />
        <Input
          label="End Date"
          type="date"
          value={form.endDate}
          onChange={(e) => updateField('endDate', e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Start Time"
          type="time"
          value={form.startTime}
          onChange={(e) => updateField('startTime', e.target.value)}
        />
        <Input
          label="End Time"
          type="time"
          value={form.endTime}
          onChange={(e) => updateField('endTime', e.target.value)}
        />
      </div>

      <Input
        label="Venue Name"
        value={form.locationName}
        onChange={(e) => updateField('locationName', e.target.value)}
        placeholder="e.g., Texas Motor Speedway"
      />

      <Input
        label="Address"
        value={form.address}
        onChange={(e) => updateField('address', e.target.value)}
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Input
          label="City"
          value={form.city}
          onChange={(e) => updateField('city', e.target.value)}
          error={errors.city}
          aria-required="true"
        />
        <div>
          <label htmlFor="state" className="block text-sm font-medium text-white/80 mb-1.5">
            State
          </label>
          <select
            id="state"
            value={form.state}
            onChange={(e) => updateField('state', e.target.value)}
            className={`w-full rounded-xl bg-white/5 border px-4 py-2.5 text-white transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 ${errors.state ? 'border-red-500/50' : 'border-white/10'}`}
          >
            <option value="">Select...</option>
            {US_STATES.map((s) => (
              <option key={s.code} value={s.code}>{s.code}</option>
            ))}
          </select>
          {errors.state ? <p className="text-sm text-red-400 mt-1">{errors.state}</p> : null}
        </div>
        <Input
          label="ZIP"
          value={form.zip}
          onChange={(e) => updateField('zip', e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-white/80 mb-1.5">
          Description
        </label>
        <textarea
          id="description"
          value={form.description}
          onChange={(e) => updateField('description', e.target.value)}
          rows={4}
          className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-white placeholder:text-white/30 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50"
        />
      </div>

      <div>
        <label htmlFor="banner" className="block text-sm font-medium text-white/80 mb-1.5">
          Banner Image
        </label>
        <input
          type="file"
          id="banner"
          accept="image/jpeg,image/png,image/webp,image/heic"
          onChange={handleBannerUpload}
          className="block w-full text-sm text-white/50 file:mr-4 file:rounded-full file:border-0 file:bg-amber-500/10 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-amber-500 hover:file:bg-amber-500/20 transition-all duration-150"
        />
        {bannerUrl ? (
          <div className="mt-3 aspect-[21/9] w-full overflow-hidden rounded-xl">
            <img src={bannerUrl} alt="Banner preview" className="h-full w-full object-cover" />
          </div>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Website"
          type="url"
          value={form.website}
          onChange={(e) => updateField('website', e.target.value)}
          placeholder="https://..."
        />
        <Input
          label="Registration URL"
          type="url"
          value={form.registrationUrl}
          onChange={(e) => updateField('registrationUrl', e.target.value)}
          placeholder="https://..."
        />
      </div>

      <Input
        label="Admission / Cost"
        value={form.admissionFeeText}
        onChange={(e) => updateField('admissionFeeText', e.target.value)}
        placeholder="e.g., $20 per car, spectators free"
      />

      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="free-spectator"
          checked={form.isFreeSpectator}
          onChange={(e) => updateField('isFreeSpectator', e.target.checked)}
          className="rounded border-white/10 bg-white/5 text-amber-500 focus:ring-amber-500/50"
        />
        <label htmlFor="free-spectator" className="text-sm text-white/80">Free for spectators</label>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Contact Email"
          type="email"
          value={form.contactEmail}
          onChange={(e) => updateField('contactEmail', e.target.value)}
        />
        <Input
          label="Contact Phone"
          type="tel"
          value={form.contactPhone}
          onChange={(e) => updateField('contactPhone', e.target.value)}
        />
      </div>

      <div className="pt-4">
        <Button type="submit" loading={loading || isUploading} disabled={loading || isUploading}>
          Create Event
        </Button>
      </div>
    </form>
  )
}
