'use client'

import { FeedTabs, useFeedTab, type FeedTab } from './FeedTabs'
import { FeedEventRow } from './FeedEventRow'
import { FeedVehicleCard } from './FeedVehicleCard'
import { FeedMembers } from './FeedMembers'
import { formatEventType } from '@/lib/utils'
import type { EventType } from '@/lib/constants'

interface FeedEvent {
  name: string
  date: string
  city: string
  state: string
  event_type: EventType
  slug: string
  state_code: string
}

interface FeedVehicle {
  year: number
  make: string
  model: string
  slug: string
  photo_url: string | null
  owner_name: string
}

interface FeedMember {
  username: string
  display_name: string
  avatar_url: string | null
  tagline: string | null
}

interface LandingFeedProps {
  events: FeedEvent[]
  vehicles: FeedVehicle[]
  members: FeedMember[]
}

export function LandingFeed({ events, vehicles, members }: LandingFeedProps) {
  const { activeTab, setActiveTab } = useFeedTab()

  const showEvents = activeTab === 'All' || activeTab === 'Events'
  const showVehicles = activeTab === 'All' || activeTab === 'Vehicles'
  const showPeople = activeTab === 'All' || activeTab === 'People'

  return (
    <>
      <FeedTabs activeTab={activeTab} onChange={setActiveTab} />

      <div className="px-4 pb-8 sm:px-6 lg:px-7">
        {/* Varied feed rhythm matching the mockup: events, vehicle photo, events, members, vehicle pair, event */}
        {activeTab === 'All' ? (
          <MixedFeed events={events} vehicles={vehicles} members={members} />
        ) : (
          <>
            {showEvents && events.map((e) => (
              <FeedEventRow
                key={e.slug}
                name={e.name}
                date={e.date}
                city={e.city}
                state={e.state}
                eventType={formatEventType(e.event_type)}
                slug={e.slug}
                stateCode={e.state_code}
              />
            ))}
            {showVehicles && vehicles.map((v) => (
              <FeedVehicleCard
                key={v.slug}
                year={v.year}
                make={v.make}
                model={v.model}
                slug={v.slug}
                photoUrl={v.photo_url}
                ownerName={v.owner_name}
                aspect="16/10"
              />
            ))}
            {showPeople && (
              <FeedMembers
                members={members.map((m) => ({
                  username: m.username,
                  displayName: m.display_name,
                  avatarUrl: m.avatar_url,
                  tagline: m.tagline,
                }))}
              />
            )}
            {((showEvents && events.length === 0) ||
              (showVehicles && vehicles.length === 0) ||
              (showPeople && members.length === 0)) && (
              <p className="py-12 text-center text-sm text-text-faint">Nothing here yet. Check back soon.</p>
            )}
          </>
        )}
      </div>
    </>
  )
}

function MixedFeed({ events, vehicles, members }: LandingFeedProps) {
  // Build a varied rhythm: 2 events, 1 vehicle wide, 1 event, members, 2 vehicles side-by-side, 1 event
  const eventSlots = [...events]
  const vehicleSlots = [...vehicles]

  const sections: React.ReactNode[] = []

  // First 2 events
  for (let i = 0; i < 2 && eventSlots.length > 0; i++) {
    const e = eventSlots.shift()!
    sections.push(
      <FeedEventRow
        key={`e-${e.slug}`}
        name={e.name}
        date={e.date}
        city={e.city}
        state={e.state}
        eventType={formatEventType(e.event_type)}
        slug={e.slug}
        stateCode={e.state_code}
      />
    )
  }

  // Wide vehicle card
  if (vehicleSlots.length > 0) {
    const v = vehicleSlots.shift()!
    sections.push(
      <FeedVehicleCard
        key={`v-${v.slug}`}
        year={v.year}
        make={v.make}
        model={v.model}
        slug={v.slug}
        photoUrl={v.photo_url}
        ownerName={v.owner_name}
        aspect="21/9"
      />
    )
  }

  // 1 more event
  if (eventSlots.length > 0) {
    const e = eventSlots.shift()!
    sections.push(
      <FeedEventRow
        key={`e-${e.slug}`}
        name={e.name}
        date={e.date}
        city={e.city}
        state={e.state}
        eventType={formatEventType(e.event_type)}
        slug={e.slug}
        stateCode={e.state_code}
      />
    )
  }

  // Members section
  if (members.length > 0) {
    sections.push(
      <FeedMembers
        key="members"
        members={members.map((m) => ({
          username: m.username,
          displayName: m.display_name,
          avatarUrl: m.avatar_url,
          tagline: m.tagline,
        }))}
      />
    )
  }

  // 2 vehicles side-by-side
  if (vehicleSlots.length >= 2) {
    const v1 = vehicleSlots.shift()!
    const v2 = vehicleSlots.shift()!
    sections.push(
      <div key="v-pair" className="my-5 flex gap-3.5">
        <div className="flex-1">
          <FeedVehicleCard year={v1.year} make={v1.make} model={v1.model} slug={v1.slug} photoUrl={v1.photo_url} ownerName={v1.owner_name} aspect="4/3" />
        </div>
        <div className="flex-1">
          <FeedVehicleCard year={v2.year} make={v2.make} model={v2.model} slug={v2.slug} photoUrl={v2.photo_url} ownerName={v2.owner_name} aspect="4/3" />
        </div>
      </div>
    )
  }

  // Remaining events
  for (const e of eventSlots) {
    sections.push(
      <FeedEventRow
        key={`e-${e.slug}`}
        name={e.name}
        date={e.date}
        city={e.city}
        state={e.state}
        eventType={formatEventType(e.event_type)}
        slug={e.slug}
        stateCode={e.state_code}
      />
    )
  }

  // Remaining vehicles
  for (const v of vehicleSlots) {
    sections.push(
      <FeedVehicleCard
        key={`v-${v.slug}`}
        year={v.year}
        make={v.make}
        model={v.model}
        slug={v.slug}
        photoUrl={v.photo_url}
        ownerName={v.owner_name}
        aspect="16/10"
      />
    )
  }

  if (sections.length === 0) {
    return <p className="py-12 text-center text-sm text-text-faint">Nothing here yet. Check back soon.</p>
  }

  return <>{sections}</>
}
