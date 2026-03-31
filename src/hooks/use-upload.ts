'use client'

import { useState, useCallback } from 'react'
import { uploadPhoto, type UploadResult, type UploadProgress } from '@/lib/photos/upload'

export function useUpload() {
  const [uploads, setUploads] = useState<Map<string, UploadProgress>>(new Map())

  const upload = useCallback(async (
    file: File,
    folder: string,
    entityId: string
  ): Promise<UploadResult> => {
    const fileId = `${file.name}-${Date.now()}`

    const result = await uploadPhoto(file, folder, entityId, (progress) => {
      setUploads((prev) => new Map(prev).set(fileId, progress))
    })

    setUploads((prev) => {
      const next = new Map(prev)
      next.delete(fileId)
      return next
    })

    return result
  }, [])

  const isUploading = Array.from(uploads.values()).some(
    (u) => u.status === 'resizing' || u.status === 'uploading'
  )

  return { upload, uploads, isUploading }
}
