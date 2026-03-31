'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { US_STATES } from '@/lib/constants'
import { createBrowserClient } from '@/lib/supabase/client'

interface FormErrors {
  name?: string
  date?: string
  city?: string
  state?: string
  [key: string]: string | undefined
}

export function EventSubmitForm() {
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitted, setSubmitted] = useState(false)

  const [form, setForm] = useState({
    name: '',
    date: '',
    city: '',
    state: '',
    locationName: '',
    description: '',
    sourceUrl: ''
  })

  function updateField(field: string, value: string) {
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

    const { error } = await supabase.from('event_submissions').insert({
      submitted_by: user.id,
      name: form.name,
      date: form.date,
      city: form.city,
      state: form.state,
      location_name: form.locationName || null,
      description: form.description || null,
      source_url: form.sourceUrl || null,
      status: 'pending'
    })

    setLoading(false)

    if (error) {
      setErrors({ name: error.message })
      return
    }

    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 mb-4">
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-8 h-8 text-emerald-400">
            <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-[#f5f5f0] mb-2">Event Submitted!</h2>
        <p className="text-sm text-[#888]">
          Your event has been submitted for review. We&apos;ll publish it once approved.
        </p>
        <div className="mt-6">
          <a
            href="/events"
            className="inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold bg-amber-500 text-black hover:bg-amber-400 transition-all duration-150"
          >
            Browse Events
          </a>
        </div>
      </div>
    )
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
          label="Venue Name"
          value={form.locationName}
          onChange={(e) => updateField('locationName', e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
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
            aria-required="true"
            className={`w-full rounded-xl bg-white/5 border px-4 py-2.5 text-white transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 ${errors.state ? 'border-red-500/50' : 'border-white/10'}`}
          >
            <option value="">Select...</option>
            {US_STATES.map((s) => (
              <option key={s.code} value={s.code}>{s.code}</option>
            ))}
          </select>
          {errors.state ? <p className="text-sm text-red-400 mt-1">{errors.state}</p> : null}
        </div>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-white/80 mb-1.5">
          Description
        </label>
        <textarea
          id="description"
          value={form.description}
          onChange={(e) => updateField('description', e.target.value)}
          rows={3}
          placeholder="What's this event about?"
          className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-white placeholder:text-white/30 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50"
        />
      </div>

      <Input
        label="Source URL"
        type="url"
        value={form.sourceUrl}
        onChange={(e) => updateField('sourceUrl', e.target.value)}
        placeholder="Link to event page or Facebook event (optional)"
      />

      <div className="pt-4">
        <Button type="submit" loading={loading} disabled={loading}>
          Submit Event
        </Button>
      </div>
    </form>
  )
}
