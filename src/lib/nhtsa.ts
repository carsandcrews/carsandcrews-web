const BASE_URL = 'https://vpic.nhtsa.dot.gov/api/vehicles'

export async function fetchMakes(year: number): Promise<string[]> {
  try {
    const res = await fetch(`${BASE_URL}/GetMakesForVehicleType/car?year=${year}&format=json`)
    if (!res.ok) return []
    const data = await res.json()
    return (data.Results || []).map((r: { MakeName: string }) => r.MakeName)
  } catch {
    return []
  }
}

export async function fetchModels(year: number, make: string): Promise<string[]> {
  try {
    const res = await fetch(`${BASE_URL}/GetModelsForMakeYear/make/${encodeURIComponent(make)}/modelyear/${year}?format=json`)
    if (!res.ok) return []
    const data = await res.json()
    return (data.Results || []).map((r: { Model_Name: string }) => r.Model_Name)
  } catch {
    return []
  }
}
