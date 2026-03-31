import { test, expect } from '@playwright/test'

test.describe('Authentication pages', () => {
  test('sign-in page loads', async ({ page }) => {
    await page.goto('/sign-in')
    await expect(page.getByText('Sign In')).toBeVisible()
    await expect(page.getByLabel('Email')).toBeVisible()
    await expect(page.getByLabel('Password')).toBeVisible()
  })

  test('sign-up page loads', async ({ page }) => {
    await page.goto('/sign-up')
    await expect(page.getByText('Create Account')).toBeVisible()
    await expect(page.getByLabel('Email')).toBeVisible()
    await expect(page.getByLabel('Password')).toBeVisible()
  })

  test('sign-in page has Google OAuth button', async ({ page }) => {
    await page.goto('/sign-in')
    await expect(page.getByText('Continue with Google')).toBeVisible()
  })

  test('sign-in page links to sign-up', async ({ page }) => {
    await page.goto('/sign-in')
    await page.getByText('Sign up').click()
    await expect(page).toHaveURL(/\/sign-up/)
  })

  test('sign-up page links to sign-in', async ({ page }) => {
    await page.goto('/sign-up')
    await page.getByText('Sign in').click()
    await expect(page).toHaveURL(/\/sign-in/)
  })

  test('sign-in with invalid credentials shows error', async ({ page }) => {
    await page.goto('/sign-in')
    await page.getByLabel('Email').fill('invalid@test.com')
    await page.getByLabel('Password').fill('wrongpassword')
    await page.getByRole('button', { name: 'Sign In' }).click()
    // Should show an error message (from Supabase)
    await expect(page.locator('.text-red-400')).toBeVisible({ timeout: 10000 })
  })
})
