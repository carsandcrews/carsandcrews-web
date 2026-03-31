import { config } from 'dotenv'
config({ path: '.env.local' })
import { describe, it, expect } from 'vitest'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

describe('profiles table', () => {
  it('can read profiles with anon key', async () => {
    const { error } = await supabase
      .from('profiles')
      .select('id, username, display_name')
      .limit(1)
    expect(error).toBeNull()
  })

  it('has required columns', async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, display_name, avatar_url, bio, city, state, website, role, created_at, updated_at')
      .limit(0)
    expect(error).toBeNull()
  })
})
