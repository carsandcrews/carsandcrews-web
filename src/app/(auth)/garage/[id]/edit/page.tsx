import { notFound } from 'next/navigation'
import { createServer } from '@/lib/supabase/server'
import { VehicleForm } from '@/components/vehicles/VehicleForm'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditVehiclePage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createServer()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) notFound()

  const { data: vehicle } = await supabase
    .from('vehicles')
    .select('*, vehicle_specs(*), vehicle_photos(*)')
    .eq('id', id)
    .eq('owner_id', user.id)
    .single()

  if (!vehicle) notFound()

  const initialData = {
    id: vehicle.id,
    year: vehicle.year,
    make: vehicle.make,
    model: vehicle.model,
    body_style: vehicle.body_style || undefined,
    status_tag: vehicle.status_tag,
    description: vehicle.description || '',
    visibility: vehicle.visibility,
    slug: vehicle.slug,
    specs: vehicle.vehicle_specs?.[0] || vehicle.vehicle_specs || undefined,
    photos: (vehicle.vehicle_photos || [])
      .sort((a: { position: number }, b: { position: number }) => a.position - b.position)
      .map((p: { id: string; url: string; thumbnail_url: string | null; caption: string | null; position: number }) => ({
        id: p.id,
        url: p.url,
        thumbnail_url: p.thumbnail_url,
        caption: p.caption || '',
        position: p.position
      }))
  }

  return (
    <main className="min-h-screen bg-[#111113]">
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-7">
        <h1 className="mb-8 text-2xl font-bold text-[#f5f5f0]">Edit Vehicle</h1>
        <VehicleForm mode="edit" initialData={initialData} />
      </div>
    </main>
  )
}
