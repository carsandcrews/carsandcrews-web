import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchMakes, fetchModels } from '@/lib/nhtsa'

beforeEach(() => {
  vi.restoreAllMocks()
})

describe('fetchMakes', () => {
  it('fetches makes for a given year', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        Results: [
          { MakeId: 474, MakeName: 'CHEVROLET' },
          { MakeId: 460, MakeName: 'FORD' }
        ]
      })
    })

    const result = await fetchMakes(2020)
    expect(result).toEqual(['CHEVROLET', 'FORD'])
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('2020'))
  })

  it('returns empty array on error', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false })
    const result = await fetchMakes(2020)
    expect(result).toEqual([])
  })
})

describe('fetchModels', () => {
  it('fetches models for a given year and make', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        Results: [
          { Model_ID: 1, Model_Name: 'Camaro' },
          { Model_ID: 2, Model_Name: 'Corvette' }
        ]
      })
    })

    const result = await fetchModels(2020, 'Chevrolet')
    expect(result).toEqual(['Camaro', 'Corvette'])
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('Chevrolet'))
  })

  it('returns empty array on error', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false })
    const result = await fetchModels(2020, 'Chevrolet')
    expect(result).toEqual([])
  })
})
