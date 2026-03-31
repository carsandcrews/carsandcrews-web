import { resizeImage, type AspectRatio } from './resize'

export interface UploadResult {
  publicUrl: string
  key: string
  aspectRatio: AspectRatio
}

export interface UploadProgress {
  status: 'resizing' | 'uploading' | 'done' | 'error'
  percent: number
  error?: string
}

export async function uploadPhoto(
  file: File,
  folder: string,
  entityId: string,
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult> {
  onProgress?.({ status: 'resizing', percent: 0 })

  const { blob, aspectRatio } = await resizeImage(file)

  onProgress?.({ status: 'uploading', percent: 20 })

  const response = await fetch('/api/upload/signed-url', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      folder,
      entityId,
      filename: file.name.replace(/\.[^.]+$/, '.webp'),
      contentType: 'image/webp'
    })
  })

  if (!response.ok) {
    const err = await response.json()
    throw new Error(err.error || 'Failed to get upload URL')
  }

  const { signedUrl, publicUrl, key } = await response.json()

  onProgress?.({ status: 'uploading', percent: 50 })

  const uploadResponse = await fetch(signedUrl, {
    method: 'PUT',
    body: blob,
    headers: { 'Content-Type': 'image/webp' }
  })

  if (!uploadResponse.ok) {
    throw new Error('Upload failed')
  }

  onProgress?.({ status: 'done', percent: 100 })

  return { publicUrl, key, aspectRatio }
}
