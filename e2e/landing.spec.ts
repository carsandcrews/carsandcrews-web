import { test, expect } from '@playwright/test'

test.describe('Landing page', () => {
  test('loads and displays brand', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('header')).toContainText('Cars & Crews')
  })

  test('displays navigation links', async ({ page }) => {
    await page.goto('/')
    const nav = page.locator('header nav')
    await expect(nav.getByText('Events')).toBeVisible()
    await expect(nav.getByText('Vehicles')).toBeVisible()
    await expect(nav.getByText('Map')).toBeVisible()
  })

  test('displays featured strip', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('This Weekend')).toBeVisible()
    await expect(page.getByText('Trending Build')).toBeVisible()
  })

  test('displays search bar', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByPlaceholder(/Search events/)).toBeVisible()
  })

  test('displays feed tabs', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('tablist')).toBeVisible()
    await expect(page.getByRole('tab', { name: 'All' })).toBeVisible()
    await expect(page.getByRole('tab', { name: 'Events' })).toBeVisible()
    await expect(page.getByRole('tab', { name: 'Vehicles' })).toBeVisible()
    await expect(page.getByRole('tab', { name: 'People' })).toBeVisible()
  })

  test('navigates to events page', async ({ page }) => {
    await page.goto('/')
    await page.locator('header nav').getByText('Events').click()
    await expect(page).toHaveURL(/\/events/)
  })

  test('navigates to vehicles page', async ({ page }) => {
    await page.goto('/')
    await page.locator('header nav').getByText('Vehicles').click()
    await expect(page).toHaveURL(/\/vehicles/)
  })

  test('displays footer', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('footer')).toContainText('Cars & Crews')
    await expect(page.locator('footer')).toContainText('All rights reserved')
  })

  test('sign up link navigates to sign-up page', async ({ page }) => {
    await page.goto('/')
    await page.locator('header').getByText('Sign Up').click()
    await expect(page).toHaveURL(/\/sign-up/)
  })
})
