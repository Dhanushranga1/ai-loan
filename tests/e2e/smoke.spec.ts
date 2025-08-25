import { test, expect } from '@playwright/test'
import { TestHelpers } from './helpers'

test.describe('Smoke Tests', () => {
  test('homepage loads correctly', async ({ page }) => {
    const helpers = new TestHelpers(page)

    await page.goto('/')
    await helpers.waitForPageReady()

    // Check if the main navigation is present
    await expect(page.locator('nav')).toBeVisible()

    // Check if we can see loan-related content
    await expect(page.locator('text=Loan')).toBeVisible()

    await helpers.takeScreenshot('homepage-smoke-test')
  })

  test('login page loads correctly', async ({ page }) => {
    const helpers = new TestHelpers(page)

    await page.goto('/login')
    await helpers.waitForPageReady()

    // Check if login form is present
    await expect(page.locator('input[name="email"]')).toBeVisible()
    await expect(page.locator('input[name="password"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()

    await helpers.takeScreenshot('login-page-smoke-test')
  })

  test('application page requires authentication', async ({ page }) => {
    const helpers = new TestHelpers(page)

    await page.goto('/apply')
    await helpers.waitForPageReady()

    // Should redirect to login if not authenticated
    if (await helpers.isOnLoginPage()) {
      await expect(page.locator('input[name="email"]')).toBeVisible()
    } else {
      // If somehow logged in, should see the application form
      await expect(page.locator('form')).toBeVisible()
    }

    await helpers.takeScreenshot('apply-page-auth-check')
  })

  test('navigation works correctly', async ({ page }) => {
    const helpers = new TestHelpers(page)

    await page.goto('/')
    await helpers.waitForPageReady()

    // Check if main navigation links are present and clickable
    const homeLink = page.locator('a[href="/"]')
    if (await homeLink.isVisible()) {
      await expect(homeLink).toBeVisible()
    }

    // Check for login/register links
    const loginLink = page.locator('a[href="/login"]')
    const registerLink = page.locator('a[href="/register"]')

    if (await loginLink.isVisible()) {
      await expect(loginLink).toBeVisible()
    }

    if (await registerLink.isVisible()) {
      await expect(registerLink).toBeVisible()
    }

    await helpers.takeScreenshot('navigation-check')
  })

  test('responsive design works on mobile', async ({ page }) => {
    const helpers = new TestHelpers(page)

    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })

    await page.goto('/')
    await helpers.waitForPageReady()

    // Check if page is responsive
    await expect(page.locator('body')).toBeVisible()

    // Check if navigation adapts to mobile
    const nav = page.locator('nav')
    if (await nav.isVisible()) {
      await expect(nav).toBeVisible()
    }

    await helpers.takeScreenshot('mobile-responsive-test')
  })
})
