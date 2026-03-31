'use client'

import { useState } from 'react'

const TABS = ['All', 'Events', 'Vehicles', 'People'] as const
export type FeedTab = typeof TABS[number]

interface FeedTabsProps {
  activeTab: FeedTab
  onChange: (tab: FeedTab) => void
}

export function FeedTabs({ activeTab, onChange }: FeedTabsProps) {
  return (
    <div className="flex gap-1.5 px-4 pb-1.5 sm:px-6 lg:px-7" role="tablist" aria-label="Feed filter">
      {TABS.map((tab) => (
        <button
          key={tab}
          role="tab"
          aria-selected={activeTab === tab}
          onClick={() => onChange(tab)}
          className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors duration-150 ${
            activeTab === tab
              ? 'bg-accent/12 text-accent'
              : 'text-text-faint hover:text-text-muted'
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  )
}

export function useFeedTab() {
  const [activeTab, setActiveTab] = useState<FeedTab>('All')
  return { activeTab, setActiveTab }
}
