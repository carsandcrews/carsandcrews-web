import { config } from 'dotenv'
config({ path: '.env.local' })
import { describe, it, expect } from 'vitest'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

describe('vehicles tables', () => {
  it('can query vehicles table', async () => {
    const { error } = await supabase
      .from('vehicles')
      .select('id, owner_id, year, make, model, slug, visibility, status_tag')
      .limit(0)
    expect(error).toBeNull()
  })

  it('can query vehicle_photos table', async () => {
    const { error } = await supabase
      .from('vehicle_photos')
      .select('id, vehicle_id, url, thumbnail_url, position, caption, aspect_ratio')
      .limit(0)
    expect(error).toBeNull()
  })

  it('can query vehicle_specs table', async () => {
    const { error } = await supabase
      .from('vehicle_specs')
      .select('id, vehicle_id, engine, transmission, drivetrain, paint_color, interior, wheels_tires')
      .limit(0)
    expect(error).toBeNull()
  })
})
