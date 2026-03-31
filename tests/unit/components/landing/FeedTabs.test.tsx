import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { FeedTabs } from '@/components/landing/FeedTabs'

describe('FeedTabs', () => {
  it('renders all tab options', () => {
    render(<FeedTabs activeTab="All" onChange={() => {}} />)
    expect(screen.getByText('All')).toBeInTheDocument()
    expect(screen.getByText('Events')).toBeInTheDocument()
    expect(screen.getByText('Vehicles')).toBeInTheDocument()
    expect(screen.getByText('People')).toBeInTheDocument()
  })

  it('marks the active tab with aria-selected', () => {
    render(<FeedTabs activeTab="Events" onChange={() => {}} />)
    expect(screen.getByText('Events')).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByText('All')).toHaveAttribute('aria-selected', 'false')
  })

  it('calls onChange when a tab is clicked', () => {
    const onChange = vi.fn()
    render(<FeedTabs activeTab="All" onChange={onChange} />)
    fireEvent.click(screen.getByText('Vehicles'))
    expect(onChange).toHaveBeenCalledWith('Vehicles')
  })

  it('has proper tablist role', () => {
    render(<FeedTabs activeTab="All" onChange={() => {}} />)
    expect(screen.getByRole('tablist')).toBeInTheDocument()
  })
})
