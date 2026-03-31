import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createServer } from '@/lib/supabase/server'
import { EventDetailHeader } from '@/components/events/EventDetailHeader'
import { EventMeta } from '@/components/events/EventMeta'
import { ShareButton } from '@/components/events/ShareButton'
import { Button } from '@/components/ui/button'
import type { EventType } from '@/lib/constants'

interface PageProps {
  params: Promise<{ state: string; slug: string }>
}

async function getEvent(slug: string) {
  const supabase = await createServer()
  const { data } = await supabase
    .from('events')
    .select('*, rsvps(count)')
    .eq('slug', slug)
    .eq('status', 'published')
    .single()
  return data
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const event = await getEvent(slug)
  if (!event) return { title: 'Event Not Found' }

  const title = `${event.name} | Cars & Crews`
  const description = event.description
    ? event.description.slice(0, 160)
    : `${event.name} in ${event.city}, ${event.state}`

  return {
    title,
    description,
    openGraph: {
      title: event.name,
      description,
      type: 'website',
      ...(event.banner_url ? { images: [{ url: event.banner_url }] } : {})
    },
    twitter: {
      card: event.banner_url ? 'summary_large_image' : 'summary',
      title: event.name,
      description
    }
  }
}

export default async function EventDetailPage({ params }: PageProps) {
  const { slug } = await params
  const event = await getEvent(slug)
  if (!event) notFound()

  const rsvpCount = event.rsvps?.[0]?.count ?? 0

  return (
    <main className="min-h-screen bg-[#111113]">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-7">
        <EventDetailHeader
          name={event.name}
          bannerUrl={event.banner_url}
          eventType={event.event_type as EventType}
          isCharity={event.is_charity}
          claimed={event.claimed}
        />

        <div className="mt-8 grid gap-8 sm:grid-cols-[1fr_auto]">
          <div className="space-y-8">
            <EventMeta
              date={event.date}
              endDate={event.end_date}
              startTime={event.start_time}
              endTime={event.end_time}
              city={event.city}
              state={event.state}
              locationName={event.location_name}
              address={event.address}
              rsvpCount={rsvpCount}
            />

            {event.description ? (
              <div className="border-t border-white/5 pt-6">
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[#888]">About</h2>
                <p className="text-sm leading-relaxed text-[#f5f5f0]/80 whitespace-pre-wrap">
                  {event.description}
                </p>
              </div>
            ) : null}

            {event.admission_fee_text || event.is_free_spectator ? (
              <div className="border-t border-white/5 pt-6">
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[#888]">Admission</h2>
                <p className="text-sm text-[#f5f5f0]/80">
                  {event.is_free_spectator ? 'Free for spectators' : event.admission_fee_text}
                </p>
              </div>
            ) : null}
          </div>

          <div className="flex flex-col gap-3 sm:w-48">
            <Button>RSVP</Button>
            {event.website ? (
              <a
                href={event.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-150 bg-white/5 text-white hover:bg-white/10 border border-white/10"
              >
                Website
              </a>
            ) : null}
            {event.registration_url ? (
              <a
                href={event.registration_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-150 bg-white/5 text-white hover:bg-white/10 border border-white/10"
              >
                Register
              </a>
            ) : null}
            <ShareButton name={event.name} />
          </div>
        </div>

        {event.lat && event.lng ? (
          <div className="mt-8 border-t border-white/5 pt-6">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[#888]">Location</h2>
            <div className="aspect-[16/9] overflow-hidden rounded-xl bg-[#1a1a1d]">
              <img
                src={`https://api.mapbox.com/styles/v1/mapbox/dark-v11/static/pin-s+f59e0b(${event.lng},${event.lat})/${event.lng},${event.lat},13,0/800x450?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ''}`}
                alt={`Map showing ${event.location_name || event.city}`}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </div>
          </div>
        ) : null}
      </div>
    </main>
  )
}
