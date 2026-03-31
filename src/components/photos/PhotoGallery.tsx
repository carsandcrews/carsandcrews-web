'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

interface Photo {
  url: string
  caption: string | null
}

interface PhotoGalleryProps {
  photos: Photo[]
}

export function PhotoGallery({ photos }: PhotoGalleryProps) {
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null)
  const touchStartX = useRef<number | null>(null)

  const isOpen = lightboxIdx !== null

  const goNext = useCallback(() => {
    if (lightboxIdx === null) return
    setLightboxIdx((lightboxIdx + 1) % photos.length)
  }, [lightboxIdx, photos.length])

  const goPrev = useCallback(() => {
    if (lightboxIdx === null) return
    setLightboxIdx((lightboxIdx - 1 + photos.length) % photos.length)
  }, [lightboxIdx, photos.length])

  const close = useCallback(() => {
    setLightboxIdx(null)
  }, [])

  useEffect(() => {
    if (!isOpen) return

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') close()
      if (e.key === 'ArrowRight') goNext()
      if (e.key === 'ArrowLeft') goPrev()
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, close, goNext, goPrev])

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return
    const diff = e.changedTouches[0].clientX - touchStartX.current
    if (Math.abs(diff) > 50) {
      if (diff > 0) goPrev()
      else goNext()
    }
    touchStartX.current = null
  }

  if (photos.length === 0) return null

  return (
    <>
      {/* Thumbnail grid */}
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {photos.map((photo, idx) => (
          <button
            key={photo.url}
            type="button"
            onClick={() => setLightboxIdx(idx)}
            className="relative aspect-square overflow-hidden rounded-xl bg-[#1a1a1d] transition-opacity duration-150 hover:opacity-80"
          >
            <img
              src={photo.url}
              alt={photo.caption || `Photo ${idx + 1}`}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {isOpen && lightboxIdx !== null ? (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/95"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Close button */}
          <button
            type="button"
            aria-label="close"
            onClick={close}
            className="absolute top-4 right-4 z-10 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-colors duration-150"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
            </svg>
          </button>

          {/* Navigation */}
          {photos.length > 1 ? (
            <>
              <button
                type="button"
                aria-label="previous"
                onClick={goPrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 rounded-full bg-white/10 p-3 text-white hover:bg-white/20 transition-colors duration-150"
              >
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                </svg>
              </button>
              <button
                type="button"
                aria-label="next"
                onClick={goNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 rounded-full bg-white/10 p-3 text-white hover:bg-white/20 transition-colors duration-150"
              >
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                </svg>
              </button>
            </>
          ) : null}

          {/* Main image */}
          <div className="flex-1 flex items-center justify-center px-16 py-4 max-h-[80vh] w-full">
            <img
              src={photos[lightboxIdx].url}
              alt={photos[lightboxIdx].caption || `Photo ${lightboxIdx + 1}`}
              className="max-h-full max-w-full object-contain"
            />
          </div>

          {/* Caption */}
          {photos[lightboxIdx].caption ? (
            <p className="text-sm text-white/80 text-center px-4 pb-2">
              {photos[lightboxIdx].caption}
            </p>
          ) : null}

          {/* Counter */}
          <p className="text-xs text-white/50 pb-2">
            {lightboxIdx + 1} / {photos.length}
          </p>

          {/* Thumbnail strip */}
          <div className="flex gap-1.5 px-4 pb-4 overflow-x-auto max-w-full">
            {photos.map((photo, idx) => (
              <button
                key={photo.url}
                type="button"
                onClick={() => setLightboxIdx(idx)}
                className={`flex-shrink-0 h-14 w-14 overflow-hidden rounded-lg transition-all duration-150 border-2 ${
                  idx === lightboxIdx ? 'border-amber-500 opacity-100' : 'border-transparent opacity-50 hover:opacity-80'
                }`}
              >
                <img
                  src={photo.url}
                  alt={photo.caption || `Thumbnail ${idx + 1}`}
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </>
  )
}
