import { test, expect } from '@playwright/test'

test.describe('Vehicles explore page', () => {
  test('loads vehicles page', async ({ page }) => {
    await page.goto('/vehicles')
    await expect(page).toHaveURL(/\/vehicles/)
  })

  test('displays vehicle filters', async ({ page }) => {
    await page.goto('/vehicles')
    await expect(page.getByLabel('Make')).toBeVisible()
    await expect(page.getByLabel('Era')).toBeVisible()
    await expect(page.getByLabel('Status')).toBeVisible()
  })
})
