import { VehicleForm } from '@/components/vehicles/VehicleForm'

export default function AddVehiclePage() {
  return (
    <main className="min-h-screen bg-[#111113]">
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-7">
        <h1 className="mb-8 text-2xl font-bold text-[#f5f5f0]">Add Vehicle</h1>
        <VehicleForm />
      </div>
    </main>
  )
}
