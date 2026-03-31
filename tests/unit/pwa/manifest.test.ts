import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { join } from 'path'

describe('PWA manifest', () => {
  const manifest = JSON.parse(
    readFileSync(join(process.cwd(), 'public/manifest.json'), 'utf-8')
  )

  it('has the correct app name', () => {
    expect(manifest.name).toBe('Cars & Crews')
  })

  it('has a short name', () => {
    expect(manifest.short_name).toBe('Cars & Crews')
  })

  it('uses standalone display mode', () => {
    expect(manifest.display).toBe('standalone')
  })

  it('has the correct theme color', () => {
    expect(manifest.theme_color).toBe('#f59e0b')
  })

  it('has the correct background color', () => {
    expect(manifest.background_color).toBe('#111113')
  })

  it('has required icon sizes', () => {
    const sizes = manifest.icons.map((i: { sizes: string }) => i.sizes)
    expect(sizes).toContain('192x192')
    expect(sizes).toContain('512x512')
  })

  it('starts from the root URL', () => {
    expect(manifest.start_url).toBe('/')
  })
})
