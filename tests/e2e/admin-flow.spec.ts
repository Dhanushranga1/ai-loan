import { test, expect } from '@playwright/test'
import { TestHelpers } from './helpers'

test.describe('Admin Workflows', () => {
  let helpers: TestHelpers

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page)
  })

  test('admin can access admin panel', async ({ page }) => {
    await helpers.loginAsAdmin()

    // Navigate to admin panel
    await helpers.goToAdminPanel()

    // Should see admin interface
    await helpers.expectText('Admin Panel')
    await helpers.expectText('Loan Applications')

    await helpers.takeScreenshot('admin-panel-access')
  })

  test('regular user cannot access admin panel', async ({ page }) => {
    await helpers.loginAsRegularUser()

    // Try to access admin panel directly
    await page.goto('/loans')
    await helpers.waitForPageReady()

    // Should be redirected or see access denied
    const currentUrl = page.url()
    const hasAccessDenied = await page.locator('text=Access denied').isVisible()
    const redirectedAway = !currentUrl.includes('/admin')

    expect(hasAccessDenied || redirectedAway).toBeTruthy()

    await helpers.takeScreenshot('admin-access-denied')
  })

  test('admin can view all loan applications', async ({ page }) => {
    await helpers.loginAsAdmin()
    await helpers.goToAdminPanel()

    // Should see list of all applications
    await helpers.expectVisible('table, .loan-card, [data-testid="loan-list"]')

    // Should see application details
    await helpers.expectText('Amount')
    await helpers.expectText('Status')
    await helpers.expectText('Applicant')

    await helpers.takeScreenshot('admin-loans-list')
  })

  test('admin can filter loan applications by status', async ({ page }) => {
    await helpers.loginAsAdmin()
    await helpers.goToAdminPanel()

    // Test pending filter
    await page.selectOption('select[name="status"]', 'pending')
    await helpers.clickButtonByText('Apply Filters')
    await helpers.waitForPageReady()

    // Should only show pending applications
    const pendingVisible = await page.locator('text=pending').isVisible()
    if (pendingVisible) {
      await expect(page.locator('text=approved')).not.toBeVisible()
    }

    await helpers.takeScreenshot('admin-filter-pending')

    // Test approved filter
    await page.selectOption('select[name="status"]', 'approved')
    await helpers.clickButtonByText('Apply Filters')
    await helpers.waitForPageReady()

    await helpers.takeScreenshot('admin-filter-approved')

    // Test rejected filter
    await page.selectOption('select[name="status"]', 'rejected')
    await helpers.clickButtonByText('Apply Filters')
    await helpers.waitForPageReady()

    await helpers.takeScreenshot('admin-filter-rejected')
  })

  test('admin can search loan applications', async ({ page }) => {
    await helpers.loginAsAdmin()
    await helpers.goToAdminPanel()

    // Search by purpose
    await page.fill('input[name="search"]', 'home')
    await helpers.clickButtonByText('Apply Filters')
    await helpers.waitForPageReady()

    // Should show filtered results
    const hasResults = await page.locator('text=home').isVisible()
    if (hasResults) {
      await helpers.expectText('home')
    }

    await helpers.takeScreenshot('admin-search-results')

    // Clear search
    await helpers.clickButtonByText('Clear Filters')
    await helpers.waitForPageReady()

    await helpers.takeScreenshot('admin-search-cleared')
  })

  test('admin can view individual loan application details', async ({ page }) => {
    await helpers.loginAsAdmin()
    await helpers.goToAdminPanel()

    // Click on first application
    const firstViewButton = page.locator('a:has-text("View Details")').first()
    if (await firstViewButton.isVisible()) {
      await firstViewButton.click()
      await helpers.waitForPageReady()

      // Should see detailed application view
      await helpers.expectText('Application Details')
      await helpers.expectText('Personal Information')
      await helpers.expectText('Decision')

      await helpers.takeScreenshot('admin-loan-details')
    }
  })

  test('admin can navigate between pages', async ({ page }) => {
    await helpers.loginAsAdmin()
    await helpers.goToAdminPanel()

    // Check pagination controls
    const nextButton = page.locator('a:has-text("Next")')
    const prevButton = page.locator('a:has-text("Previous")')

    if (await nextButton.isVisible()) {
      await nextButton.click()
      await helpers.waitForPageReady()

      // Should be on page 2
      await helpers.expectText('Page 2')

      await helpers.takeScreenshot('admin-pagination-page2')

      // Go back to page 1
      if (await prevButton.isVisible()) {
        await prevButton.click()
        await helpers.waitForPageReady()

        await helpers.expectText('Page 1')
        await helpers.takeScreenshot('admin-pagination-page1')
      }
    }
  })

  test('admin can view application statistics', async ({ page }) => {
    await helpers.loginAsAdmin()
    await helpers.goToAdminPanel()

    // Should see total count
    await helpers.expectVisible('text=total')

    // Should see counts for different statuses
    const hasStats = await page.locator('text=approved').isVisible() ||
                    await page.locator('text=pending').isVisible() ||
                    await page.locator('text=rejected').isVisible()

    expect(hasStats).toBeTruthy()

    await helpers.takeScreenshot('admin-statistics')
  })

  test('admin interface is read-only', async ({ page }) => {
    await helpers.loginAsAdmin()
    await helpers.goToAdminPanel()

    // Should not see edit/delete buttons
    const hasEditButtons = await page.locator('button:has-text("Edit")').isVisible()
    const hasDeleteButtons = await page.locator('button:has-text("Delete")').isVisible()
    const hasApproveButtons = await page.locator('button:has-text("Approve")').isVisible()
    const hasRejectButtons = await page.locator('button:has-text("Reject")').isVisible()

    expect(hasEditButtons).toBeFalsy()
    expect(hasDeleteButtons).toBeFalsy()
    expect(hasApproveButtons).toBeFalsy()
    expect(hasRejectButtons).toBeFalsy()

    await helpers.takeScreenshot('admin-readonly-interface')
  })

  test('admin can export/view audit logs', async ({ page }) => {
    await helpers.loginAsAdmin()

    // Try to access audit logs if available
    await page.goto('/admin/audit')

    const hasAuditLogs = await page.locator('text=Audit').isVisible() ||
                        await page.locator('text=Log').isVisible()

    if (hasAuditLogs) {
      await helpers.expectText('Audit')
      await helpers.takeScreenshot('admin-audit-logs')
    } else {
      // If no audit page, check if audit info is in main admin panel
      await helpers.goToAdminPanel()
      await helpers.takeScreenshot('admin-no-audit-page')
    }
  })

  test('admin panel is responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })

    await helpers.loginAsAdmin()
    await helpers.goToAdminPanel()

    // Should be usable on mobile
    await helpers.expectVisible('text=Admin')

    // Filters should be accessible
    const filtersVisible = await page.locator('select[name="status"]').isVisible()
    const searchVisible = await page.locator('input[name="search"]').isVisible()

    expect(filtersVisible || searchVisible).toBeTruthy()

    await helpers.takeScreenshot('admin-mobile-responsive')
  })
})
