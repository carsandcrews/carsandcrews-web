// src/lib/location/types.ts
export const VALID_RADII = [25, 50, 100, 250, 500] as const
export type ValidRadius = typeof VALID_RADII[number]
export const DEFAULT_RADIUS: ValidRadius = 100

export interface ResolvedCenter {
  lat: number
  lng: number
  label: string
  source: 'zip' | 'gps' | 'ip'
  radius: ValidRadius
}

export function parseRadius(value: string | undefined): ValidRadius {
  const num = parseInt(value || '', 10)
  return VALID_RADII.includes(num as ValidRadius) ? (num as ValidRadius) : DEFAULT_RADIUS
}
