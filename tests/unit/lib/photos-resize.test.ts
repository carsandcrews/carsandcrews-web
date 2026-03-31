import { describe, it, expect } from 'vitest'
import { detectAspectRatio } from '@/lib/photos/resize'

describe('detectAspectRatio', () => {
  it('detects landscape', () => {
    expect(detectAspectRatio(1600, 900)).toBe('landscape')
  })

  it('detects portrait', () => {
    expect(detectAspectRatio(900, 1600)).toBe('portrait')
  })

  it('detects square', () => {
    expect(detectAspectRatio(1000, 1000)).toBe('square')
  })

  it('detects near-square as square', () => {
    expect(detectAspectRatio(1000, 1050)).toBe('square')
  })
})
