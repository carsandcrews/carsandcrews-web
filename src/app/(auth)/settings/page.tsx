'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { US_STATES, RESERVED_USERNAMES } from '@/lib/constants'

interface FormErrors {
  display_name?: string
  username?: string
  website?: string
  [key: string]: string | undefined
}

export default function SettingsPage() {
  const [loading, setLoading] = useState(false)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [errors, setErrors] = useState<FormErrors>({})
  const [saved, setSaved] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createBrowserClient()

  const [form, setForm] = useState({
    display_name: '',
    username: '',
    bio: '',
    city: '',
    state: '',
    website: ''
  })

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('profiles')
        .select('username, display_name, bio, city, state, website, avatar_url')
        .eq('id', user.id)
        .single()

      if (data) {
        setForm({
          display_name: data.display_name || '',
          username: data.username || '',
          bio: data.bio || '',
          city: data.city || '',
          state: data.state || '',
          website: data.website || ''
        })
        setAvatarUrl(data.avatar_url)
      }
      setLoadingProfile(false)
    }
    loadProfile()
  }, [supabase])

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
    setSaved(false)
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }

  function validateUsername(username: string): string | undefined {
    if (!username.trim()) return 'Username is required'
    if (username.length < 3) return 'Username must be at least 3 characters'
    if (username.length > 30) return 'Username must be 30 characters or less'
    if (!/^[a-z0-9_-]+$/.test(username)) return 'Username can only contain lowercase letters, numbers, hyphens, and underscores'
    if (RESERVED_USERNAMES.includes(username as typeof RESERVED_USERNAMES[number])) return 'This username is reserved'
    return undefined
  }

  function validate(): FormErrors {
    const errs: FormErrors = {}
    if (!form.display_name.trim()) errs.display_name = 'Display name is required'
    const usernameError = validateUsername(form.username)
    if (usernameError) errs.username = usernameError
    if (form.website && !/^https?:\/\/.+/.test(form.website)) errs.website = 'Website must start with http:// or https://'
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
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setLoading(false)
      return
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        display_name: form.display_name,
        username: form.username,
        bio: form.bio || null,
        city: form.city || null,
        state: form.state || null,
        website: form.website || null
      })
      .eq('id', user.id)

    setLoading(false)

    if (error) {
      if (error.message.includes('unique') || error.message.includes('duplicate')) {
        setErrors({ username: 'This username is already taken' })
      } else {
        setErrors({ display_name: error.message })
      }
      return
    }

    setSaved(true)
    router.refresh()
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Create a local preview
    const previewUrl = URL.createObjectURL(file)
    setAvatarUrl(previewUrl)

    // Upload using the signed URL API
    const res = await fetch('/api/upload/signed-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename: `avatars/${user.id}.jpg`, contentType: file.type })
    })

    if (res.ok) {
      const { url, publicUrl } = await res.json()
      await fetch(url, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } })
      await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', user.id)
      setAvatarUrl(publicUrl)
    }
  }

  return (
    <main className="min-h-screen bg-[#111113]">
      <div className="mx-auto max-w-xl px-4 py-8 sm:px-6 lg:px-7">
        <h1 className="text-2xl font-bold text-[#f5f5f0] mb-6">Profile Settings</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">Avatar</label>
            <div className="flex items-center gap-4">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="h-16 w-16 rounded-full object-cover border-2 border-white/10" />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#1a1a1d] border-2 border-white/10">
                  <span className="text-xl font-bold text-white/30">
                    {form.display_name.charAt(0).toUpperCase() || '?'}
                  </span>
                </div>
              )}
              <label className="cursor-pointer inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold bg-white/5 text-white hover:bg-white/10 border border-white/10 transition-all duration-150">
                Change
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              </label>
            </div>
          </div>

          <Input
            label="Display Name"
            value={form.display_name}
            onChange={(e) => updateField('display_name', e.target.value)}
            error={errors.display_name}
          />

          <Input
            label="Username"
            value={form.username}
            onChange={(e) => updateField('username', e.target.value.toLowerCase())}
            error={errors.username}
          />

          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-white/80 mb-1.5">
              Bio
            </label>
            <textarea
              id="bio"
              value={form.bio}
              onChange={(e) => updateField('bio', e.target.value)}
              rows={3}
              placeholder="Tell people about yourself..."
              className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-white placeholder:text-white/30 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="City"
              value={form.city}
              onChange={(e) => updateField('city', e.target.value)}
            />
            <div>
              <label htmlFor="state" className="block text-sm font-medium text-white/80 mb-1.5">
                State
              </label>
              <select
                id="state"
                value={form.state}
                onChange={(e) => updateField('state', e.target.value)}
                className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-white transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50"
              >
                <option value="">Select...</option>
                {US_STATES.map((s) => (
                  <option key={s.code} value={s.code}>{s.code}</option>
                ))}
              </select>
            </div>
          </div>

          <Input
            label="Website"
            type="url"
            value={form.website}
            onChange={(e) => updateField('website', e.target.value)}
            placeholder="https://yoursite.com"
            error={errors.website}
          />

          <div className="flex items-center gap-3 pt-4">
            <Button type="submit" loading={loading} disabled={loading}>
              Save Changes
            </Button>
            {saved ? (
              <span className="text-sm text-emerald-400">Saved!</span>
            ) : null}
          </div>
        </form>
      </div>
    </main>
  )
}
