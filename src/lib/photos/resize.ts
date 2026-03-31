export type AspectRatio = 'landscape' | 'portrait' | 'square'

export function detectAspectRatio(width: number, height: number): AspectRatio {
  const ratio = width / height
  if (ratio > 1.1) return 'landscape'
  if (ratio < 0.9) return 'portrait'
  return 'square'
}

const MAX_DIMENSION = 2048
const QUALITY = 0.85

export async function resizeImage(file: File): Promise<{
  blob: Blob
  width: number
  height: number
  aspectRatio: AspectRatio
}> {
  const bitmap = await createImageBitmap(file)
  let { width, height } = bitmap

  if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
    const scale = MAX_DIMENSION / Math.max(width, height)
    width = Math.round(width * scale)
    height = Math.round(height * scale)
  }

  const canvas = new OffscreenCanvas(width, height)
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(bitmap, 0, 0, width, height)
  bitmap.close()

  const blob = await canvas.convertToBlob({ type: 'image/webp', quality: QUALITY })
  const aspectRatio = detectAspectRatio(width, height)

  return { blob, width, height, aspectRatio }
}
