import { test, expect } from '@playwright/test'

test.describe('Events explore page', () => {
  test('loads events page', async ({ page }) => {
    await page.goto('/events')
    await expect(page).toHaveURL(/\/events/)
  })

  test('displays search bar', async ({ page }) => {
    await page.goto('/events')
    await expect(page.getByPlaceholder(/Search/)).toBeVisible()
  })

  test('displays filter chips', async ({ page }) => {
    await page.goto('/events')
    await expect(page.getByText('Car Show')).toBeVisible()
    await expect(page.getByText('Cars & Coffee')).toBeVisible()
  })

  test('displays map view link', async ({ page }) => {
    await page.goto('/events')
    await expect(page.getByText('Map view')).toBeVisible()
  })

  test('map view link navigates to map', async ({ page }) => {
    await page.goto('/events')
    await page.getByText('Map view').click()
    await expect(page).toHaveURL(/\/events\/map/)
  })
})
