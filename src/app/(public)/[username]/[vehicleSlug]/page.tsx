import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createServer } from '@/lib/supabase/server'
import { VehicleDetailHeader } from '@/components/vehicles/VehicleDetailHeader'
import { VehicleSpecsPanel } from '@/components/vehicles/VehicleSpecsPanel'
import { ShareButton } from '@/components/events/ShareButton'
import { PhotoGallery } from '@/components/photos/PhotoGallery'
import type { VehicleStatusTag } from '@/lib/constants'

interface PageProps {
  params: Promise<{ username: string; vehicleSlug: string }>
}

async function getVehicle(username: string, vehicleSlug: string) {
  const cleanUsername = username.startsWith('@') ? username.slice(1) : username
  const supabase = await createServer()
  const { data } = await supabase
    .from('vehicles')
    .select('*, vehicle_photos(*), vehicle_specs(*), owner:profiles!owner_id(username, display_name, avatar_url)')
    .eq('slug', vehicleSlug)
    .eq('visibility', 'public')
    .single()

  if (!data) return null

  // Verify the vehicle belongs to the requested username
  const owner = data.owner as { username: string; display_name: string; avatar_url: string | null } | null
  if (!owner || owner.username !== cleanUsername) return null

  return data
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username, vehicleSlug } = await params
  const vehicle = await getVehicle(username, vehicleSlug)
  if (!vehicle) return { title: 'Vehicle Not Found' }

  const cleanUsername = username.startsWith('@') ? username.slice(1) : username
  const title = `${vehicle.year} ${vehicle.make} ${vehicle.model} | Cars & Crews`
  const description = vehicle.description
    ? vehicle.description.slice(0, 160)
    : `${vehicle.year} ${vehicle.make} ${vehicle.model} — ${vehicle.status_tag}`

  const photos = (vehicle.vehicle_photos || []).sort((a: { position: number }, b: { position: number }) => a.position - b.position)
  const heroUrl = photos[0]?.url || null

  return {
    title,
    description,
    alternates: {
      canonical: `/@${cleanUsername}/${vehicleSlug}`
    },
    openGraph: {
      title: `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
      description,
      type: 'website',
      url: `/@${cleanUsername}/${vehicleSlug}`,
      ...(heroUrl ? { images: [{ url: heroUrl }] } : {})
    },
    twitter: {
      card: heroUrl ? 'summary_large_image' : 'summary',
      title: `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
      description
    }
  }
}

export default async function VehicleDetailPage({ params }: PageProps) {
  const { username, vehicleSlug } = await params
  const vehicle = await getVehicle(username, vehicleSlug)
  if (!vehicle) notFound()

  const photos = (vehicle.vehicle_photos || [])
    .sort((a: { position: number }, b: { position: number }) => a.position - b.position)
  const heroPhoto = photos[0] || null
  const galleryPhotos = photos.slice(1)

  const owner = vehicle.owner as { username: string; display_name: string; avatar_url: string | null } | null
  const specs = Array.isArray(vehicle.vehicle_specs)
    ? vehicle.vehicle_specs[0]
    : vehicle.vehicle_specs

  return (
    <main className="min-h-screen bg-[#111113]">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-7">
        <VehicleDetailHeader
          year={vehicle.year}
          make={vehicle.make}
          model={vehicle.model}
          statusTag={vehicle.status_tag as VehicleStatusTag}
          heroPhotoUrl={heroPhoto?.url || null}
          ownerName={owner?.display_name || 'Unknown'}
          ownerUsername={owner?.username || ''}
        />

        {/* Photo gallery with lightbox */}
        {galleryPhotos.length > 0 ? (
          <div className="mt-8">
            <PhotoGallery
              photos={galleryPhotos.map((p: { url: string; caption: string | null }) => ({
                url: p.url,
                caption: p.caption
              }))}
            />
          </div>
        ) : null}

        <div className="mt-8 space-y-8">
          {vehicle.description ? (
            <div className="border-t border-white/5 pt-6">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[#888]">About</h2>
              <p className="text-sm leading-relaxed text-[#f5f5f0]/80 whitespace-pre-wrap">
                {vehicle.description}
              </p>
            </div>
          ) : null}

          {specs ? (
            <VehicleSpecsPanel
              engine={specs.engine}
              transmission={specs.transmission}
              drivetrain={specs.drivetrain}
              paintColor={specs.paint_color}
              interior={specs.interior}
              wheelsTires={specs.wheels_tires}
            />
          ) : null}

          <div className="border-t border-white/5 pt-6">
            <ShareButton name={`${vehicle.year} ${vehicle.make} ${vehicle.model}`} />
          </div>
        </div>
      </div>
    </main>
  )
}
