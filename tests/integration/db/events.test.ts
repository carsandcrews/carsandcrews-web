import { config } from 'dotenv'
config({ path: '.env.local' })
import { describe, it, expect } from 'vitest'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

describe('events table', () => {
  it('can query events', async () => {
    const { error } = await supabase
      .from('events')
      .select('id, name, slug, event_type, is_charity, date, city, state, source, status')
      .limit(0)
    expect(error).toBeNull()
  })
})

describe('rsvps tables', () => {
  it('can query rsvps', async () => {
    const { error } = await supabase
      .from('rsvps')
      .select('id, event_id, user_id, status')
      .limit(0)
    expect(error).toBeNull()
  })

  it('can query rsvp_vehicles', async () => {
    const { error } = await supabase
      .from('rsvp_vehicles')
      .select('id, rsvp_id, vehicle_id')
      .limit(0)
    expect(error).toBeNull()
  })
})

describe('submissions and claims tables', () => {
  it('can query event_submissions', async () => {
    const { error } = await supabase
      .from('event_submissions')
      .select('id, name, date, status')
      .limit(0)
    expect(error).toBeNull()
  })

  it('can query event_claims', async () => {
    const { error } = await supabase
      .from('event_claims')
      .select('id, event_id, user_id, status')
      .limit(0)
    expect(error).toBeNull()
  })

  it('can query admin_actions', async () => {
    const { error } = await supabase
      .from('admin_actions')
      .select('id, admin_id, action_type, target_type, target_id')
      .limit(0)
    expect(error).toBeNull()
  })
})
