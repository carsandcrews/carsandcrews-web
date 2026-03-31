export interface UserLocation {
  city: string
  state: string
  lat: number
  lng: number
  source: 'gps' | 'ip' | 'manual'
}

export function parseVercelHeaders(headers: Headers): UserLocation | null {
  const city = headers.get('x-vercel-ip-city')
  const state = headers.get('x-vercel-ip-country-region')
  const lat = headers.get('x-vercel-ip-latitude')
  const lng = headers.get('x-vercel-ip-longitude')

  if (!city || !state || !lat || !lng) return null

  return {
    city: decodeURIComponent(city),
    state,
    lat: parseFloat(lat),
    lng: parseFloat(lng),
    source: 'ip'
  }
}

export function getGPSLocation(): Promise<UserLocation | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          city: '',
          state: '',
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          source: 'gps'
        })
      },
      () => resolve(null),
      { timeout: 5000, maximumAge: 600000 }
    )
  })
}
