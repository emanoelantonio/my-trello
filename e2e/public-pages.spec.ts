import { expect, test } from '@playwright/test'

test.describe('Public pages', () => {
  test('home page loads and shows hero and auth buttons', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByRole('heading', { name: /Organize work and life/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /Start for Free/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /Watch demo/i })).toBeVisible()
  })

  test('pricing page loads and shows pricing heading', async ({ page }) => {
    await page.goto('/pricing')

    await expect(page.getByRole('heading', { name: /Choose Your Plan/i })).toBeVisible()
  })

  test('dashboard route redirects unauthenticated user to sign in', async ({ page }) => {
    await page.goto('/dashboard')

    await expect(page.getByText(/Sign In|Sign in/)).toBeVisible()
  })
})
