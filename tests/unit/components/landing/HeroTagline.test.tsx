import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { HeroTagline } from '@/components/landing/HeroTagline'

describe('HeroTagline', () => {
  it('renders the main tagline', () => {
    render(<HeroTagline />)
    expect(screen.getByText(/Where car culture/)).toBeInTheDocument()
    expect(screen.getByText(/comes together/)).toBeInTheDocument()
  })

  it('renders the subtitle', () => {
    render(<HeroTagline />)
    expect(screen.getByText('Discover events. Showcase your build. Find your crew.')).toBeInTheDocument()
  })

  it('renders as an h1', () => {
    render(<HeroTagline />)
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
  })
})
