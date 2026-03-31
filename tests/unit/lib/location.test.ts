import { describe, it, expect } from 'vitest'
import { parseVercelHeaders, type UserLocation } from '@/lib/location/detect'

describe('parseVercelHeaders', () => {
  it('extracts location from Vercel headers', () => {
    const headers = new Headers({
      'x-vercel-ip-city': 'Austin',
      'x-vercel-ip-country-region': 'TX',
      'x-vercel-ip-latitude': '30.2672',
      'x-vercel-ip-longitude': '-97.7431'
    })
    const result = parseVercelHeaders(headers)
    expect(result).toEqual({
      city: 'Austin',
      state: 'TX',
      lat: 30.2672,
      lng: -97.7431,
      source: 'ip'
    })
  })

  it('returns null if headers are missing', () => {
    const headers = new Headers({})
    const result = parseVercelHeaders(headers)
    expect(result).toBeNull()
  })
})
