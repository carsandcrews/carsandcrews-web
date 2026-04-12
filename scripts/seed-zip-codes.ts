// scripts/seed-zip-codes.ts
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

async function seed() {
  const csvPath = resolve(__dirname, '../data/zip_codes.csv')
  const raw = readFileSync(csvPath, 'utf-8')
  const lines = raw.trim().split('\n').slice(1) // skip header

  const rows = lines.map((line) => {
    const [zip, lat, lng, city, state] = line.split(',')
    return { zip: zip.trim(), lat: parseFloat(lat), lng: parseFloat(lng), city: city.trim(), state: state.trim() }
  })

  const BATCH_SIZE = 1000
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE)
    const { error } = await supabase.from('zip_codes').upsert(batch, { onConflict: 'zip' })
    if (error) {
      console.error(`Batch ${i / BATCH_SIZE + 1} failed:`, error.message)
      process.exit(1)
    }
    console.log(`Seeded ${Math.min(i + BATCH_SIZE, rows.length)} / ${rows.length}`)
  }

  console.log('Done.')
}

seed()
