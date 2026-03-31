import { describe, it, expect } from 'vitest'
import { generateSlug, formatEventDate, formatEventType } from '@/lib/utils'

describe('generateSlug', () => {
  it('converts a name to a slug', () => {
    expect(generateSlug('Cars & Coffee at The Domain')).toBe('cars-coffee-at-the-domain')
  })

  it('handles special characters', () => {
    expect(generateSlug("Bob's Big Show!!! 2026")).toBe('bobs-big-show-2026')
  })

  it('truncates to max length', () => {
    const long = 'a'.repeat(100)
    expect(generateSlug(long).length).toBeLessThanOrEqual(60)
  })

  it('removes trailing hyphens', () => {
    expect(generateSlug('test -- name')).toBe('test-name')
  })
})

describe('formatEventDate', () => {
  it('formats a single date', () => {
    expect(formatEventDate('2026-04-05', null)).toBe('Apr 5, 2026')
  })

  it('formats a date range', () => {
    expect(formatEventDate('2026-04-05', '2026-04-06')).toBe('Apr 5–6, 2026')
  })

  it('formats a date range across months', () => {
    expect(formatEventDate('2026-03-30', '2026-04-02')).toBe('Mar 30 – Apr 2, 2026')
  })
})

describe('formatEventType', () => {
  it('formats car_show', () => {
    expect(formatEventType('car_show')).toBe('Car Show')
  })

  it('formats cars_and_coffee', () => {
    expect(formatEventType('cars_and_coffee')).toBe('Cars & Coffee')
  })

  it('formats cruise_in', () => {
    expect(formatEventType('cruise_in')).toBe('Cruise-In')
  })
})
