import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { PhotoGallery } from '@/components/photos/PhotoGallery'

describe('PhotoGallery', () => {
  const photos = [
    { url: 'https://example.com/1.jpg', caption: 'Front view' },
    { url: 'https://example.com/2.jpg', caption: 'Side view' },
    { url: 'https://example.com/3.jpg', caption: null }
  ]

  it('renders thumbnail grid', () => {
    render(<PhotoGallery photos={photos} />)
    const images = screen.getAllByRole('img')
    expect(images).toHaveLength(3)
  })

  it('opens lightbox when thumbnail is clicked', () => {
    render(<PhotoGallery photos={photos} />)
    fireEvent.click(screen.getAllByRole('img')[0])
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('shows caption in lightbox', () => {
    render(<PhotoGallery photos={photos} />)
    fireEvent.click(screen.getAllByRole('img')[0])
    expect(screen.getByText('Front view')).toBeInTheDocument()
  })

  it('navigates to next photo with arrow button', () => {
    render(<PhotoGallery photos={photos} />)
    fireEvent.click(screen.getAllByRole('img')[0])
    fireEvent.click(screen.getByLabelText(/next/i))
    expect(screen.getByText('Side view')).toBeInTheDocument()
  })

  it('navigates to previous photo with arrow button', () => {
    render(<PhotoGallery photos={photos} />)
    fireEvent.click(screen.getAllByRole('img')[1])
    fireEvent.click(screen.getByLabelText(/previous/i))
    expect(screen.getByText('Front view')).toBeInTheDocument()
  })

  it('closes lightbox with close button', () => {
    render(<PhotoGallery photos={photos} />)
    fireEvent.click(screen.getAllByRole('img')[0])
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    fireEvent.click(screen.getByLabelText(/close/i))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('closes lightbox with Escape key', () => {
    render(<PhotoGallery photos={photos} />)
    fireEvent.click(screen.getAllByRole('img')[0])
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('navigates with arrow keys', () => {
    render(<PhotoGallery photos={photos} />)
    fireEvent.click(screen.getAllByRole('img')[0])
    fireEvent.keyDown(document, { key: 'ArrowRight' })
    expect(screen.getByText('Side view')).toBeInTheDocument()
    fireEvent.keyDown(document, { key: 'ArrowLeft' })
    expect(screen.getByText('Front view')).toBeInTheDocument()
  })

  it('shows thumbnail strip in lightbox', () => {
    render(<PhotoGallery photos={photos} />)
    fireEvent.click(screen.getAllByRole('img')[0])
    // Thumbnails in the strip + the main lightbox image
    const allImages = screen.getAllByRole('img')
    expect(allImages.length).toBeGreaterThanOrEqual(4) // 3 thumbnails + 1 main
  })

  it('renders nothing when no photos', () => {
    const { container } = render(<PhotoGallery photos={[]} />)
    expect(container.innerHTML).toBe('')
  })
})
