import { describe, it, expect } from 'vitest'
import { buildR2Key } from '@/lib/r2/client'

describe('buildR2Key', () => {
  it('builds a key for vehicle photos', () => {
    const key = buildR2Key('vehicles', 'abc-123', 'photo.jpg')
    expect(key).toBe('vehicles/abc-123/photo.jpg')
  })

  it('builds a key for avatars', () => {
    const key = buildR2Key('avatars', 'user-456', 'avatar.webp')
    expect(key).toBe('avatars/user-456/avatar.webp')
  })

  it('builds a key for event banners', () => {
    const key = buildR2Key('events', 'evt-789', 'banner.webp')
    expect(key).toBe('events/evt-789/banner.webp')
  })
})
