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
  distance_miles?: number | null
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
            {showEvents && (events.length > 0 ? events : PLACEHOLDER_EVENTS).map((e) => (
              <FeedEventRow
                key={e.slug}
                name={e.name}
                date={e.date}
                city={e.city}
                state={e.state}
                eventType={formatEventType(e.event_type)}
                slug={e.slug}
                stateCode={e.state_code}
                distance={e.distance_miles}
              />
            ))}
            {showVehicles && (vehicles.length > 0 ? vehicles : PLACEHOLDER_VEHICLES).map((v) => (
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
                members={(members.length > 0 ? members : PLACEHOLDER_MEMBERS).map((m) => ({
                  username: m.username,
                  displayName: m.display_name,
                  avatarUrl: m.avatar_url,
                  tagline: m.tagline,
                }))}
              />
            )}
          </>
        )}
      </div>
    </>
  )
}

const PLACEHOLDER_EVENTS: FeedEvent[] = [
  { name: 'Saturday Cruise-In at Sonic', date: '2026-04-05', city: 'Round Rock', state: 'TX', event_type: 'cruise_in', slug: 'saturday-cruise-in-at-sonic', state_code: 'tx' },
  { name: 'Cars & Coffee — The Domain', date: '2026-04-06', city: 'Austin', state: 'TX', event_type: 'cars_and_coffee', slug: 'cars-and-coffee-the-domain', state_code: 'tx' },
  { name: 'Lone Star Nationals', date: '2026-04-12', city: 'Fort Worth', state: 'TX', event_type: 'car_show', slug: 'lone-star-nationals', state_code: 'tx' },
  { name: 'Hill Country Cruise', date: '2026-04-19', city: 'Dripping Springs', state: 'TX', event_type: 'cruise', slug: 'hill-country-cruise', state_code: 'tx' },
]

const PLACEHOLDER_VEHICLES: FeedVehicle[] = [
  { year: 1957, make: 'Chevrolet', model: 'Bel Air', slug: '57-bel-air-survivor', photo_url: null, owner_name: 'classic_joe' },
  { year: 1992, make: 'Acura', model: 'NSX', slug: '92-nsx-jdm-spec', photo_url: null, owner_name: 'jdm_life' },
  { year: 1970, make: 'Chevrolet', model: 'Chevelle SS 454', slug: '70-chevelle-ss-454', photo_url: null, owner_name: 'big_block_tony' },
]

const PLACEHOLDER_MEMBERS: FeedMember[] = [
  { username: 'lone_star_garage', display_name: 'Lone Star Garage', avatar_url: null, tagline: 'Muscle cars · San Antonio' },
  { username: 'jdm_life', display_name: 'JDM Life', avatar_url: null, tagline: 'JDM builds · Austin' },
  { username: 'patina_queen', display_name: 'Patina Queen', avatar_url: null, tagline: 'Rat rods · Dallas' },
]

function MixedFeed({ events, vehicles, members }: LandingFeedProps) {
  // Use placeholder data when DB is empty so the page looks complete
  const feedEvents = events.length > 0 ? events : PLACEHOLDER_EVENTS
  const feedVehicles = vehicles.length > 0 ? vehicles : PLACEHOLDER_VEHICLES
  const feedMembers = members.length > 0 ? members : PLACEHOLDER_MEMBERS

  // Build a varied rhythm: 2 events, 1 vehicle wide, 1 event, members, 2 vehicles side-by-side, 1 event
  const eventSlots = [...feedEvents]
  const vehicleSlots = [...feedVehicles]

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
        distance={e.distance_miles}
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
        distance={e.distance_miles}
      />
    )
  }

  // Members section
  sections.push(
    <FeedMembers
      key="members"
      members={feedMembers.map((m) => ({
        username: m.username,
        displayName: m.display_name,
        avatarUrl: m.avatar_url,
        tagline: m.tagline,
      }))}
    />
  )

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
        distance={e.distance_miles}
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

  return <>{sections}</>
}
