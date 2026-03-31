import { redirect } from 'next/navigation'
import { createServer } from '@/lib/supabase/server'

const NAV_ITEMS = [
  { label: 'Events', href: '/admin/events' },
  { label: 'Submissions', href: '/admin/submissions' },
  { label: 'Claims', href: '/admin/claims' },
  { label: 'Users', href: '/admin/users' },
  { label: 'Vehicles', href: '/admin/vehicles' },
  { label: 'Audit Log', href: '/admin/audit-log' }
]

export default async function AdminLayout({
  children
}: {
  children: React.ReactNode
}) {
  const supabase = await createServer()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/sign-in')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') redirect('/')

  return (
    <div className="min-h-screen bg-[#111113] md:flex">
      {/* Sidebar — hidden on mobile, shown as top nav */}
      <aside className="w-full flex-shrink-0 border-b border-white/5 bg-[#0d0d0f] md:w-56 md:border-b-0 md:border-r">
        <div className="md:sticky md:top-0 px-4 py-4 md:py-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-amber-500 mb-3 md:mb-6">Admin</h2>
          <nav className="flex flex-wrap gap-1 md:flex-col md:space-y-1 md:gap-0">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="block rounded-lg px-3 py-2 text-sm text-[#f5f5f0]/70 transition-colors duration-150 hover:bg-white/5 hover:text-[#f5f5f0]"
              >
                {item.label}
              </a>
            ))}
          </nav>
          <div className="mt-4 border-t border-white/5 pt-3 md:mt-8 md:pt-4">
            <a
              href="/dashboard"
              className="block text-xs text-[#555] hover:text-[#888] transition-colors"
            >
              Back to Dashboard
            </a>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0">
        {children}
      </main>
    </div>
  )
}
