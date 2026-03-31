import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createServer } from '@/lib/supabase/server'
import { VehicleCard } from '@/components/vehicles/VehicleCard'
import { formatEventDate, formatEventType } from '@/lib/utils'
import type { VehicleStatusTag, EventType } from '@/lib/constants'

interface PageProps {
  params: Promise<{ username: string }>
}

async function getProfile(username: string) {
  const supabase = await createServer()
  const { data } = await supabase
    .from('profiles')
    .select('id, username, display_name, avatar_url, bio, city, state, website, created_at')
    .eq('username', username)
    .single()
  return data
}

async function getVehicles(ownerId: string) {
  const supabase = await createServer()
  const { data } = await supabase
    .from('vehicles')
    .select('id, year, make, model, status_tag, slug, vehicle_photos(url, thumbnail_url, position)')
    .eq('owner_id', ownerId)
    .eq('visibility', 'public')
    .order('created_at', { ascending: false })
  return data || []
}

async function getUpcomingRsvps(userId: string) {
  const supabase = await createServer()
  const today = new Date().toISOString().split('T')[0]
  const { data } = await supabase
    .from('rsvps')
    .select('id, status, event:events!inner(id, name, slug, date, city, state, event_type, status)')
    .eq('user_id', userId)
    .eq('event.status', 'published')
    .order('created_at', { ascending: false })
  // Filter to upcoming events client-side since we can't filter joined table dates easily
  return (data || []).filter((r: Record<string, unknown>) => {
    const event = r.event as { date: string } | null
    return event && event.date >= today
  })
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username } = await params
  const profile = await getProfile(username)
  if (!profile) return { title: 'Profile Not Found' }

  const title = `${profile.display_name} (@${profile.username}) | Cars & Crews`
  const description = profile.bio
    ? profile.bio.slice(0, 160)
    : `${profile.display_name} on Cars & Crews`

  return {
    title,
    description,
    openGraph: {
      title: `${profile.display_name} (@${profile.username})`,
      description,
      type: 'profile',
      ...(profile.avatar_url ? { images: [{ url: profile.avatar_url }] } : {})
    },
    twitter: {
      card: 'summary',
      title: `${profile.display_name} (@${profile.username})`,
      description
    }
  }
}

export default async function ProfilePage({ params }: PageProps) {
  const { username } = await params
  const profile = await getProfile(username)
  if (!profile) notFound()

  const vehicles = await getVehicles(profile.id)
  const rsvps = await getUpcomingRsvps(profile.id)

  return (
    <main className="min-h-screen bg-[#111113]">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-7">
        {/* Profile header */}
        <div className="flex items-start gap-5">
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.display_name}
              className="h-20 w-20 rounded-full object-cover border-2 border-white/10 flex-shrink-0"
            />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#1a1a1d] border-2 border-white/10 flex-shrink-0">
              <span className="text-2xl font-bold text-white/30">
                {profile.display_name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-[#f5f5f0]">{profile.display_name}</h1>
            <p className="text-sm text-[#888]">@{profile.username}</p>
            {profile.bio ? (
              <p className="mt-2 text-sm text-[#f5f5f0]/80">{profile.bio}</p>
            ) : null}
            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-[#888]">
              {profile.city && profile.state ? (
                <span className="inline-flex items-center gap-1">
                  <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
                    <path fillRule="evenodd" d="m9.69 18.933.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 002.274 1.765 11.842 11.842 0 00.976.544l.062.029.018.008.006.003zM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" clipRule="evenodd" />
                  </svg>
                  {profile.city}, {profile.state}
                </span>
              ) : null}
              {profile.website ? (
                <a
                  href={profile.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-amber-500 hover:text-amber-400 transition-colors"
                >
                  <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
                    <path d="M12.232 4.232a2.5 2.5 0 013.536 3.536l-1.225 1.224a.75.75 0 001.061 1.06l1.224-1.224a4 4 0 00-5.656-5.656l-3 3a4 4 0 00.225 5.865.75.75 0 00.977-1.138 2.5 2.5 0 01-.142-3.667l3-3z" />
                    <path d="M11.603 7.963a.75.75 0 00-.977 1.138 2.5 2.5 0 01.142 3.667l-3 3a2.5 2.5 0 01-3.536-3.536l1.225-1.224a.75.75 0 00-1.061-1.06l-1.224 1.224a4 4 0 105.656 5.656l3-3a4 4 0 00-.225-5.865z" />
                  </svg>
                  {profile.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                </a>
              ) : null}
            </div>
          </div>
        </div>

        {/* Garage */}
        {vehicles.length > 0 ? (
          <div className="mt-10 border-t border-white/5 pt-6">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#888]">Garage</h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {vehicles.map((v: Record<string, unknown>) => {
                const photos = (v.vehicle_photos as Array<{ url: string; thumbnail_url: string | null; position: number }>) || []
                const hero = photos.sort((a, b) => a.position - b.position)[0]
                return (
                  <VehicleCard
                    key={v.id as string}
                    year={v.year as number}
                    make={v.make as string}
                    model={v.model as string}
                    statusTag={v.status_tag as VehicleStatusTag}
                    slug={v.slug as string}
                    photoUrl={hero?.thumbnail_url || hero?.url || null}
                    ownerName={profile.display_name}
                  />
                )
              })}
            </div>
          </div>
        ) : null}

        {/* Upcoming events */}
        {rsvps.length > 0 ? (
          <div className="mt-10 border-t border-white/5 pt-6">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#888]">Upcoming Events</h2>
            <div className="space-y-0">
              {rsvps.map((r: Record<string, unknown>) => {
                const event = r.event as {
                  id: string
                  name: string
                  slug: string
                  date: string
                  city: string
                  state: string
                  event_type: string
                }
                const d = new Date(event.date + 'T00:00:00')
                const month = d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()
                const day = d.getDate()
                return (
                  <a
                    key={r.id as string}
                    href={`/events/${event.state.toLowerCase()}/${event.slug}`}
                    className="flex items-center gap-4 py-4 border-b border-white/[0.04] transition-colors duration-150 hover:bg-white/[0.02] -mx-2 px-2 rounded-lg"
                  >
                    <div className="w-12 text-center flex-shrink-0">
                      <div className="text-[11px] font-bold text-amber-500 tracking-wide">{month}</div>
                      <div className="text-2xl font-black text-[#f5f5f0] leading-none">{day}</div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[15px] font-semibold text-[#f5f5f0] truncate">{event.name}</div>
                      <div className="text-xs text-[#666]">
                        {event.city}, {event.state} · {formatEventType(event.event_type)}
                      </div>
                    </div>
                  </a>
                )
              })}
            </div>
          </div>
        ) : null}
      </div>
    </main>
  )
}
