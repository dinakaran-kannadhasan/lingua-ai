import { test, expect } from '@playwright/test'

test.describe('Onboarding flow', () => {
  test('selecting language and level enables Start button', async ({ page }) => {
    await page.goto('/login')
    await page.fill('[name="email"]', 'e2e@test.com')
    await page.fill('[name="password"]', 'TestPass123!')
    await page.click('button[type="submit"]')
    await page.waitForURL(/dashboard|onboarding/, { timeout: 10000 })
    await page.goto('/onboarding')

    // Button should be disabled before any selection
    await expect(page.getByRole('button', { name: /Select a language/i })).toBeDisabled()

    await page.click('[data-lang="french"]')
    await page.click('[data-level="A1"]')
    await page.fill('[name="name"]', 'E2E User')

    await expect(page.getByRole('button', { name: /Begin French/i })).toBeEnabled()
  })

  test('onboarding saves to database and redirects to dashboard', async ({ page }) => {
    await page.goto('/login')
    await page.fill('[name="email"]', 'e2e@test.com')
    await page.fill('[name="password"]', 'TestPass123!')
    await page.click('button[type="submit"]')
    await page.waitForURL(/dashboard|onboarding/, { timeout: 10000 })
    await page.goto('/onboarding')

    await page.click('[data-lang="german"]')
    await page.click('[data-level="A2"]')
    await page.fill('[name="name"]', 'E2E User')
    await page.click('button[type="submit"]')

    await expect(page).toHaveURL(/dashboard/, { timeout: 10000 })
    await expect(page.getByText(/german/i)).toBeVisible()
  })
})
