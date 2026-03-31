import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Load .env.local
const envPath = resolve(__dirname, '..', '.env.local')
const envContent = readFileSync(envPath, 'utf-8')
const env = Object.fromEntries(
  envContent.split('\n').filter(l => l && !l.startsWith('#')).map(l => {
    const eq = l.indexOf('=')
    return [l.slice(0, eq), l.slice(eq + 1)]
  })
)

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

// --- Users & Profiles ---
const users = [
  { email: 'mike@example.com', username: 'mike_builds', display_name: 'Mike Builds', city: 'Austin', state: 'TX', tagline: 'Full restores · muscle cars' },
  { email: 'joe@example.com', username: 'classic_joe', display_name: 'Classic Joe', city: 'Austin', state: 'TX', tagline: 'Original survivors · Austin' },
  { email: 'sarah@example.com', username: 'jdm_life', display_name: 'Sarah K.', city: 'Austin', state: 'TX', tagline: 'JDM builds · Austin' },
  { email: 'tony@example.com', username: 'big_block_tony', display_name: 'Big Block Tony', city: 'San Antonio', state: 'TX', tagline: 'Muscle cars · San Antonio' },
  { email: 'lisa@example.com', username: 'patina_queen', display_name: 'Patina Queen', city: 'Dallas', state: 'TX', tagline: 'Rat rods · Dallas' },
]

// Ensure columns referenced in code exist (via Supabase Management API)
const PROJECT_REF = SUPABASE_URL.match(/https:\/\/(.+)\.supabase\.co/)?.[1]
let accessToken = ''
try {
  accessToken = readFileSync('/home/openclaw/.openclaw/credentials/supabase-access-token', 'utf-8').trim()
} catch {
  console.warn('  No Supabase access token found, skipping schema updates.')
}

if (accessToken && PROJECT_REF) {
  console.log('Ensuring schema columns...')
  const schemaSQL = [
    `ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS tagline text`,
    `ALTER TABLE public.events ADD COLUMN IF NOT EXISTS state_code text`,
  ]
  for (const sql of schemaSQL) {
    const res = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ query: sql }),
    })
    if (!res.ok) {
      const body = await res.text()
      console.warn(`  Schema update warning: ${body}`)
    } else {
      console.log(`  OK: ${sql.split('ADD COLUMN IF NOT EXISTS ')[1]}`)
    }
  }
  // Wait a moment for schema cache to refresh
  await new Promise(r => setTimeout(r, 2000))
}

console.log('Creating auth users...')
const userIds = []
for (const u of users) {
  const { data, error } = await supabase.auth.admin.createUser({
    email: u.email,
    password: 'SeedPassword123!',
    email_confirm: true,
    user_metadata: { full_name: u.display_name },
  })
  if (error) {
    if (error.message.includes('already been registered')) {
      // Fetch existing user
      const { data: list } = await supabase.auth.admin.listUsers()
      const existing = list.users.find(x => x.email === u.email)
      if (existing) {
        userIds.push(existing.id)
        console.log(`  User ${u.email} already exists (${existing.id})`)
        continue
      }
    }
    console.error(`  Failed to create ${u.email}:`, error.message)
    continue
  }
  userIds.push(data.user.id)
  console.log(`  Created ${u.email} (${data.user.id})`)
}

// Update profiles with richer data
console.log('Updating profiles...')
for (let i = 0; i < users.length; i++) {
  if (!userIds[i]) continue
  const u = users[i]
  const { error } = await supabase
    .from('profiles')
    .update({
      username: u.username,
      display_name: u.display_name,
      city: u.city,
      state: u.state,
      tagline: u.tagline,
    })
    .eq('id', userIds[i])
  if (error) console.error(`  Profile update failed for ${u.username}:`, error.message)
  else console.log(`  Updated profile: @${u.username}`)
}

// --- Events ---
const events = [
  {
    name: 'Cars & Coffee at The Domain',
    slug: 'cars-and-coffee-at-the-domain',
    event_type: 'cars_and_coffee',
    date: '2026-04-05',
    start_time: '08:00',
    city: 'Austin',
    state: 'Texas',
    state_code: 'tx',
    lat: 30.4020,
    lng: -97.7254,
    location_name: 'The Domain',
    description: 'Weekly Cars & Coffee meetup at The Domain. All makes and models welcome.',
  },
  {
    name: 'Saturday Cruise-In at Sonic',
    slug: 'saturday-cruise-in-at-sonic',
    event_type: 'cruise_in',
    date: '2026-04-05',
    start_time: '18:00',
    city: 'Round Rock',
    state: 'Texas',
    state_code: 'tx',
    lat: 30.5083,
    lng: -97.6789,
    location_name: 'Sonic Drive-In',
    description: 'Saturday evening cruise-in. Classic cars, hot rods, and good vibes.',
  },
  {
    name: 'Lone Star Nationals',
    slug: 'lone-star-nationals',
    event_type: 'car_show',
    date: '2026-04-12',
    end_date: '2026-04-13',
    city: 'Fort Worth',
    state: 'Texas',
    state_code: 'tx',
    lat: 32.8371,
    lng: -97.2822,
    location_name: 'Texas Motor Speedway',
    description: 'Two-day car show with hundreds of entries across all classes.',
  },
  {
    name: 'Hill Country Run',
    slug: 'hill-country-run',
    event_type: 'cruise',
    date: '2026-04-19',
    start_time: '09:00',
    city: 'Fredericksburg',
    state: 'Texas',
    state_code: 'tx',
    lat: 30.2752,
    lng: -98.8720,
    location_name: 'Fredericksburg Town Square',
    description: 'Scenic cruise through the Hill Country. Route covers 120 miles of great driving roads.',
  },
  {
    name: 'Austin Swap Meet',
    slug: 'austin-swap-meet',
    event_type: 'swap_meet',
    date: '2026-04-26',
    start_time: '07:00',
    city: 'Cedar Park',
    state: 'Texas',
    state_code: 'tx',
    lat: 30.5052,
    lng: -97.8203,
    location_name: 'Cedar Park Center',
    description: 'Huge swap meet for classic car parts, tools, and memorabilia.',
  },
  {
    name: 'Caffeine & Chrome',
    slug: 'caffeine-and-chrome',
    event_type: 'cars_and_coffee',
    date: '2026-05-03',
    start_time: '08:00',
    city: 'San Antonio',
    state: 'Texas',
    state_code: 'tx',
    lat: 29.4241,
    lng: -98.4936,
    location_name: 'Gateway Hills',
    description: 'Monthly Cars & Coffee in San Antonio. Live music and food trucks.',
  },
  {
    name: 'Thunder Valley Car Show',
    slug: 'thunder-valley-car-show',
    event_type: 'car_show',
    date: '2026-05-09',
    city: 'San Marcos',
    state: 'Texas',
    state_code: 'tx',
    lat: 29.8833,
    lng: -97.9414,
    location_name: 'Thunder Valley Speedway',
    description: 'Annual car show featuring muscle cars, hot rods, and customs.',
  },
  {
    name: 'Drag Night at Texas Motorplex',
    slug: 'drag-night-at-texas-motorplex',
    event_type: 'track_day',
    date: '2026-05-16',
    start_time: '17:00',
    city: 'Ennis',
    state: 'Texas',
    state_code: 'tx',
    lat: 32.3293,
    lng: -96.6253,
    location_name: 'Texas Motorplex',
    description: 'Friday night drag racing. Street cars welcome for test & tune.',
  },
]

console.log('Inserting events...')
for (const ev of events) {
  const { error } = await supabase.from('events').upsert(
    { ...ev, source: 'crawled', status: 'published' },
    { onConflict: 'slug' }
  )
  if (error) console.error(`  Event "${ev.name}" failed:`, error.message)
  else console.log(`  Inserted: ${ev.name}`)
}

// --- Vehicles ---
const vehicles = [
  {
    owner_username: 'mike_builds',
    year: 1969,
    make: 'Chevrolet',
    model: 'Camaro SS',
    slug: '69-camaro-ss',
    status_tag: 'restored',
    body_style: 'Coupe',
    description: 'Full frame-off restoration. Numbers matching 396 big block.',
    specs: { engine: '396 Big Block V8', transmission: 'Muncie M21 4-speed', drivetrain: 'RWD', paint_color: 'Hugger Orange', interior: 'Black vinyl', wheels_tires: '15x7 Rally wheels' },
  },
  {
    owner_username: 'classic_joe',
    year: 1957,
    make: 'Chevrolet',
    model: 'Bel Air',
    slug: '57-bel-air-survivor',
    status_tag: 'survivor',
    body_style: 'Hardtop',
    description: 'Original unrestored survivor. One family owned since new.',
    specs: { engine: '283 V8', transmission: 'Powerglide 2-speed auto', drivetrain: 'RWD', paint_color: 'Tropical Turquoise / India Ivory', interior: 'Turquoise cloth', wheels_tires: 'Original 14" hubcaps' },
  },
  {
    owner_username: 'jdm_life',
    year: 1992,
    make: 'Acura',
    model: 'NSX',
    slug: '92-nsx-jdm-spec',
    status_tag: 'modified',
    body_style: 'Coupe',
    description: 'JDM-spec NA1 with tasteful modifications. VTEC.',
    specs: { engine: 'C30A 3.0L V6 VTEC', transmission: '5-speed manual', drivetrain: 'MR', paint_color: 'Berlina Black', interior: 'Black leather', wheels_tires: 'Volk TE37 17x8' },
  },
  {
    owner_username: 'big_block_tony',
    year: 1970,
    make: 'Chevrolet',
    model: 'Chevelle SS 454',
    slug: '70-chevelle-ss-454',
    status_tag: 'restored',
    body_style: 'Coupe',
    description: 'LS6 454 with factory 4-speed. COPO ordered.',
    specs: { engine: 'LS6 454 V8 450hp', transmission: 'Muncie M22 Rock Crusher 4-speed', drivetrain: 'RWD', paint_color: 'Cranberry Red', interior: 'Black vinyl bucket seats', wheels_tires: '15x7 SS wheels with Polyglas tires' },
  },
  {
    owner_username: 'patina_queen',
    year: 1951,
    make: 'Ford',
    model: 'F-1',
    slug: '51-ford-f1-patina',
    status_tag: 'barn_find',
    body_style: 'Pickup',
    description: 'Barn find with incredible natural patina. Flathead V8 runs strong.',
    specs: { engine: 'Flathead V8 239ci', transmission: '3-speed manual', drivetrain: 'RWD', paint_color: 'Original green (patina)', interior: 'Brown leather (reupholstered)', wheels_tires: '16" steel wheels with wide whites' },
  },
]

console.log('Inserting vehicles...')
for (const v of vehicles) {
  const ownerIndex = users.findIndex(u => u.username === v.owner_username)
  if (ownerIndex === -1 || !userIds[ownerIndex]) {
    console.error(`  Skipping vehicle ${v.slug}: owner ${v.owner_username} not found`)
    continue
  }
  const ownerId = userIds[ownerIndex]
  const { specs, owner_username, ...vehicleData } = v

  const { data: inserted, error } = await supabase
    .from('vehicles')
    .upsert({ ...vehicleData, owner_id: ownerId, visibility: 'public' }, { onConflict: 'slug' })
    .select('id')
    .single()

  if (error) {
    console.error(`  Vehicle "${v.year} ${v.make} ${v.model}" failed:`, error.message)
    continue
  }

  console.log(`  Inserted: '${v.year} ${v.make} ${v.model} (${inserted.id})`)

  // Insert specs
  if (specs) {
    const { error: specErr } = await supabase
      .from('vehicle_specs')
      .upsert({ vehicle_id: inserted.id, ...specs }, { onConflict: 'vehicle_id' })
    if (specErr) console.error(`    Specs failed:`, specErr.message)
    else console.log(`    Added specs`)
  }
}

console.log('\nSeed complete!')
