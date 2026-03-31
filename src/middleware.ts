import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Rewrite /@username paths to /username (strip the @)
  if (pathname.startsWith('/@') || pathname.startsWith('/%40')) {
    const cleanPath = pathname.replace(/^\/@/, '/').replace(/^\/%40/, '/')
    const url = request.nextUrl.clone()
    url.pathname = cleanPath
    return NextResponse.rewrite(url)
  }

  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'
  ]
}
