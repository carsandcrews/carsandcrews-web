'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function SearchBarLanding() {
  const [query, setQuery] = useState('')
  const router = useRouter()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/events?q=${encodeURIComponent(query.trim())}`)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="px-4 pb-5 sm:px-6 lg:px-7">
      <div className="flex items-center gap-2.5 rounded-3xl border border-border bg-surface px-5 py-3">
        <svg className="h-4 w-4 flex-shrink-0 text-text-faint" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search events, vehicles, or people..."
          className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-faint outline-none"
          aria-label="Search"
        />
        <div className="h-4 w-px bg-border" />
        <span className="flex items-center gap-1 text-[13px] text-text-faint">
          <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
          </svg>
          <span className="hidden sm:inline">Austin, TX</span>
          <span className="sm:hidden">Austin</span>
        </span>
      </div>
    </form>
  )
}
