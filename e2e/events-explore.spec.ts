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

test.describe('Location filter', () => {
  test('displays location filter area', async ({ page }) => {
    await page.goto('/events')
    await expect(page.getByPlaceholder('ZIP code')).toBeVisible()
    await expect(page.getByLabel('Use GPS location')).toBeVisible()
  })

  test('ZIP entry updates URL', async ({ page }) => {
    await page.goto('/events')
    const zipInput = page.getByPlaceholder('ZIP code')
    await zipInput.fill('78701')
    await zipInput.press('Enter')
    await expect(page).toHaveURL(/zip=78701/)
  })

  test('distance chips visible after location set', async ({ page }) => {
    await page.goto('/events?zip=78701&radius=100')
    await expect(page.getByRole('button', { name: '25' })).toBeVisible()
    await expect(page.getByRole('button', { name: '100' })).toBeVisible()
    await expect(page.getByRole('button', { name: '500' })).toBeVisible()
  })

  test('clear button removes location params', async ({ page }) => {
    await page.goto('/events?zip=78701&radius=100')
    await page.getByLabel('Clear location').click()
    await expect(page).not.toHaveURL(/zip=/)
    await expect(page).not.toHaveURL(/radius=/)
  })
})
