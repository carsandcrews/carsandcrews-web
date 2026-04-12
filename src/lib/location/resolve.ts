// src/lib/location/resolve.ts
import { createServer } from '@/lib/supabase/server'
import { parseVercelHeaders } from '@/lib/location/detect'
import { parseRadius, type ResolvedCenter } from '@/lib/location/types'

export async function resolveCenter(
  params: Record<string, string | undefined>,
  cookies: { get: (name: string) => { value: string } | undefined },
  headers: Headers
): Promise<ResolvedCenter | null> {
  const radius = parseRadius(params.radius)

  // 1. ZIP param
  if (params.zip && /^\d{5}$/.test(params.zip)) {
    const supabase = await createServer()
    const { data } = await supabase
      .from('zip_codes')
      .select('lat, lng, city, state')
      .eq('zip', params.zip)
      .single()
    if (data) {
      return {
        lat: data.lat,
        lng: data.lng,
        label: `${params.zip} · ${data.city}, ${data.state}`,
        source: 'zip',
        radius
      }
    }
    return null
  }

  // 2. lat/lng params (GPS)
  const lat = parseFloat(params.lat || '')
  const lng = parseFloat(params.lng || '')
  if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
    return { lat, lng, label: 'GPS', source: 'gps', radius }
  }

  // 3. Cookie
  const cookie = cookies.get('cc_loc')
  if (cookie) {
    try {
      const parsed = JSON.parse(cookie.value)
      if (typeof parsed.lat === 'number' && typeof parsed.lng === 'number') {
        return {
          lat: parsed.lat,
          lng: parsed.lng,
          label: parsed.label || 'Saved location',
          source: parsed.source || 'zip',
          radius: parseRadius(String(parsed.radius))
        }
      }
    } catch {
      // invalid cookie, fall through
    }
  }

  // 4. IP headers
  const ipLocation = parseVercelHeaders(headers)
  if (ipLocation) {
    return {
      lat: ipLocation.lat,
      lng: ipLocation.lng,
      label: `${ipLocation.city}, ${ipLocation.state}`,
      source: 'ip',
      radius
    }
  }

  // 5. Nothing
  return null
}
