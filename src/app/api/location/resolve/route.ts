// src/app/api/location/resolve/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServer } from '@/lib/supabase/server'
import { VALID_RADII, DEFAULT_RADIUS, type ValidRadius } from '@/lib/location/types'

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  if (!body) {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const radius: ValidRadius = VALID_RADII.includes(body.radius) ? body.radius : DEFAULT_RADIUS

  // ZIP mode
  if (body.zip && /^\d{5}$/.test(body.zip)) {
    const supabase = await createServer()
    const { data } = await supabase
      .from('zip_codes')
      .select('lat, lng, city, state')
      .eq('zip', body.zip)
      .single()

    if (!data) {
      return NextResponse.json({ error: 'Unknown ZIP code' }, { status: 404 })
    }

    const label = `${body.zip} · ${data.city}, ${data.state}`
    const cookieStore = await cookies()
    cookieStore.set('cc_loc', JSON.stringify({
      lat: data.lat, lng: data.lng, label, source: 'zip', radius
    }), {
      maxAge: 30 * 24 * 60 * 60,
      path: '/events',
      sameSite: 'lax'
    })

    return NextResponse.json({
      lat: data.lat,
      lng: data.lng,
      label,
      url: `/events?zip=${body.zip}&radius=${radius}`
    })
  }

  // GPS mode
  const lat = parseFloat(body.lat)
  const lng = parseFloat(body.lng)
  if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return NextResponse.json({ error: 'Invalid coordinates' }, { status: 400 })
  }

  // Reverse lookup nearest ZIP for a label
  const supabase = await createServer()
  const { data: nearest } = await supabase
    .rpc('nearest_zip', { user_lat: lat, user_lng: lng })

  const label = nearest ? `${nearest.city}, ${nearest.state}` : 'GPS'

  const cookieStore = await cookies()
  cookieStore.set('cc_loc', JSON.stringify({
    lat, lng, label, source: 'gps', radius
  }), {
    maxAge: 30 * 24 * 60 * 60,
    path: '/events',
    sameSite: 'lax'
  })

  return NextResponse.json({
    lat, lng, label,
    url: `/events?lat=${lat}&lng=${lng}&radius=${radius}`
  })
}
