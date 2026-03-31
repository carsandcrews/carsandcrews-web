import { redirect } from 'next/navigation'
import { createServer } from '@/lib/supabase/server'

export default async function AuthLayout({
  children
}: {
  children: React.ReactNode
}) {
  const supabase = await createServer()
  const { data: { user } } = await supabase.auth.getUser()

  // If user is already signed in and trying to access sign-in/sign-up, redirect to dashboard
  // Otherwise, just render the children (for dashboard, garage, settings, etc.)
  return <>{children}</>
}
