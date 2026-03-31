import type { Metadata } from 'next'
import { EventCreateForm } from '@/components/events/EventCreateForm'

export const metadata: Metadata = {
  title: 'Create Event | Cars & Crews',
  description: 'Create a new car event on Cars & Crews.'
}

export default function EventCreatePage() {
  return (
    <main className="min-h-screen bg-[#111113]">
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-7">
        <h1 className="text-2xl font-bold text-[#f5f5f0] mb-6">Create Event</h1>
        <EventCreateForm />
      </div>
    </main>
  )
}
