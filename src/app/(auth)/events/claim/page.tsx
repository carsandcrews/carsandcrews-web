import { createServer } from '@/lib/supabase/server'
import { EventClaimForm } from '@/components/events/EventClaimForm'
import { redirect } from 'next/navigation'

interface PageProps {
  searchParams: Promise<{ eventId?: string }>
}

export default async function EventClaimPage({ searchParams }: PageProps) {
  const { eventId } = await searchParams
  if (!eventId) redirect('/events')

  const supabase = await createServer()
  const { data: event } = await supabase
    .from('events')
    .select('id, name, claimed')
    .eq('id', eventId)
    .eq('status', 'published')
    .single()

  if (!event || event.claimed) redirect('/events')

  return (
    <main className="min-h-screen bg-[#111113]">
      <div className="mx-auto max-w-lg px-4 py-8 sm:px-6">
        <EventClaimForm eventId={event.id} eventName={event.name} />
      </div>
    </main>
  )
}
