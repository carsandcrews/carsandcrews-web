import type { Metadata } from 'next'
import { EventSubmitForm } from '@/components/events/EventSubmitForm'

export const metadata: Metadata = {
  title: 'Submit Event | Cars & Crews',
  description: 'Know about a car event? Submit it to Cars & Crews for review.'
}

export default function EventSubmitPage() {
  return (
    <main className="min-h-screen bg-[#111113]">
      <div className="mx-auto max-w-xl px-4 py-8 sm:px-6 lg:px-7">
        <h1 className="text-2xl font-bold text-[#f5f5f0] mb-2">Submit an Event</h1>
        <p className="text-sm text-[#888] mb-6">
          Know about a car show, cruise-in, or meet? Submit it here and we&apos;ll review it.
        </p>
        <EventSubmitForm />
      </div>
    </main>
  )
}
