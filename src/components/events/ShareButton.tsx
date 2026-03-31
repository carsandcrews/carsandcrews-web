'use client'

export function ShareButton({ name }: { name: string }) {
  return (
    <button
      type="button"
      className="inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-150 text-white/70 hover:text-white hover:bg-white/5"
      onClick={() => {
        if (navigator.share) {
          navigator.share({ title: name, url: window.location.href })
        } else {
          navigator.clipboard.writeText(window.location.href)
        }
      }}
    >
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
        <path d="M13 4.5a2.5 2.5 0 11.702 1.737L6.97 9.604a2.518 2.518 0 010 .799l6.733 3.366a2.5 2.5 0 11-.671 1.341l-6.733-3.366a2.5 2.5 0 110-3.482l6.733-3.366A2.52 2.52 0 0113 4.5z" />
      </svg>
      Share
    </button>
  )
}
