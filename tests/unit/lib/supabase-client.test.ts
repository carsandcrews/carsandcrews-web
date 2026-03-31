import { describe, it, expect, vi } from 'vitest'

vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co')
vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'test-anon-key')

describe('createBrowserClient', () => {
  it('exports a function', async () => {
    const mod = await import('@/lib/supabase/client')
    expect(typeof mod.createBrowserClient).toBe('function')
  })
})
