// tests/unit/lib/resolve-center.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { resolveCenter } from '@/lib/location/resolve'

// Mock Supabase
vi.mock('@/lib/supabase/server', () => ({
  createServer: vi.fn()
}))

import { createServer } from '@/lib/supabase/server'
const mockCreateServer = vi.mocked(createServer)

function mockSupabase(zipResult: { data: unknown; error: unknown }) {
  const single = vi.fn().mockResolvedValue(zipResult)
  const eq = vi.fn().mockReturnValue({ single })
  const select = vi.fn().mockReturnValue({ eq })
  const from = vi.fn().mockReturnValue({ select })
  mockCreateServer.mockResolvedValue({ from } as any)
}

function makeCookies(value?: string) {
  return {
    get: vi.fn().mockReturnValue(value ? { value } : undefined)
  } as any
}

function makeHeaders(overrides: Record<string, string> = {}) {
  return new Headers(overrides)
}

describe('resolveCenter', () => {
  beforeEach(() => vi.clearAllMocks())

  it('resolves ZIP from URL params (precedence 1)', async () => {
    mockSupabase({ data: { lat: 30.27, lng: -97.74, city: 'Austin', state: 'TX' }, error: null })
    const result = await resolveCenter(
      { zip: '78701', radius: '50' },
      makeCookies(),
      makeHeaders()
    )
    expect(result).toEqual({
      lat: 30.27,
      lng: -97.74,
      label: '78701 · Austin, TX',
      source: 'zip',
      radius: 50
    })
  })

  it('returns null for unknown ZIP', async () => {
    mockSupabase({ data: null, error: null })
    const result = await resolveCenter(
      { zip: '00000' },
      makeCookies(),
      makeHeaders()
    )
    expect(result).toBeNull()
  })

  it('resolves lat/lng from URL params (precedence 2)', async () => {
    const result = await resolveCenter(
      { lat: '30.27', lng: '-97.74', radius: '250' },
      makeCookies(),
      makeHeaders()
    )
    expect(result).toEqual({
      lat: 30.27,
      lng: -97.74,
      label: 'GPS',
      source: 'gps',
      radius: 250
    })
  })

  it('resolves from cookie (precedence 3)', async () => {
    const cookie = JSON.stringify({ lat: 30.27, lng: -97.74, label: '78701 · Austin, TX', source: 'zip', radius: 100 })
    const result = await resolveCenter(
      {},
      makeCookies(cookie),
      makeHeaders()
    )
    expect(result).toEqual({
      lat: 30.27,
      lng: -97.74,
      label: '78701 · Austin, TX',
      source: 'zip',
      radius: 100
    })
  })

  it('resolves from IP headers (precedence 4)', async () => {
    const result = await resolveCenter(
      {},
      makeCookies(),
      makeHeaders({
        'x-vercel-ip-city': 'Austin',
        'x-vercel-ip-country-region': 'TX',
        'x-vercel-ip-latitude': '30.2672',
        'x-vercel-ip-longitude': '-97.7431'
      })
    )
    expect(result).toEqual({
      lat: 30.2672,
      lng: -97.7431,
      label: 'Austin, TX',
      source: 'ip',
      radius: 100
    })
  })

  it('returns null when nothing available', async () => {
    const result = await resolveCenter({}, makeCookies(), makeHeaders())
    expect(result).toBeNull()
  })

  it('clamps invalid radius to default', async () => {
    const result = await resolveCenter(
      { lat: '30.27', lng: '-97.74', radius: '999' },
      makeCookies(),
      makeHeaders()
    )
    expect(result?.radius).toBe(100)
  })

  it('ZIP takes precedence over lat/lng', async () => {
    mockSupabase({ data: { lat: 30.27, lng: -97.74, city: 'Austin', state: 'TX' }, error: null })
    const result = await resolveCenter(
      { zip: '78701', lat: '40.0', lng: '-74.0' },
      makeCookies(),
      makeHeaders()
    )
    expect(result?.source).toBe('zip')
  })
})
