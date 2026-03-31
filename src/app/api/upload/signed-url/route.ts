import { NextResponse } from 'next/server'
import { createServer } from '@/lib/supabase/server'
import { buildR2Key, createSignedUploadUrl, getPublicUrl } from '@/lib/r2/client'

export async function POST(request: Request) {
  const supabase = await createServer()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { folder, entityId, filename, contentType } = await request.json()

  if (!folder || !entityId || !filename || !contentType) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic']
  if (!allowedTypes.includes(contentType)) {
    return NextResponse.json({ error: 'Invalid content type' }, { status: 400 })
  }

  const timestamp = Date.now()
  const safeFilename = `${timestamp}-${filename.replace(/[^a-zA-Z0-9._-]/g, '')}`
  const key = buildR2Key(folder, entityId, safeFilename)

  const signedUrl = await createSignedUploadUrl(key, contentType)
  const publicUrl = getPublicUrl(key)

  return NextResponse.json({ signedUrl, publicUrl, key })
}
