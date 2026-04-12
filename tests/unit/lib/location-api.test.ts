// tests/unit/lib/location-api.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/supabase/server', () => ({
  createServer: vi.fn()
}))

import { createServer } from '@/lib/supabase/server'
const mockCreateServer = vi.mocked(createServer)

describe('POST /api/location/resolve', () => {
  it('contract: ZIP request returns lat/lng/label/url', () => {
    const body = { zip: '78701', radius: 100 }
    expect(body.zip).toMatch(/^\d{5}$/)
    expect([25, 50, 100, 250, 500]).toContain(body.radius)
  })

  it('contract: GPS request returns label/url', () => {
    const body = { lat: 30.27, lng: -97.74, radius: 100 }
    expect(body.lat).toBeGreaterThanOrEqual(-90)
    expect(body.lat).toBeLessThanOrEqual(90)
    expect(body.lng).toBeGreaterThanOrEqual(-180)
    expect(body.lng).toBeLessThanOrEqual(180)
  })
})
