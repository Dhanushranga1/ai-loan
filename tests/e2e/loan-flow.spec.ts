import { test, expect } from '@playwright/test'
import { TestHelpers } from './helpers'

test.describe('Loan Application Flow', () => {
  let helpers: TestHelpers

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page)
  })

  test('complete loan application flow - approved scenario', async ({ page }) => {
    await helpers.loginAsRegularUser()

    // Navigate to application form
    await page.goto('/apply')
    await helpers.waitForPageReady()

    // Fill loan application with good credit profile
    await helpers.fillLoanApplication({
      amount: 50000,
      tenure: 24,
      purpose: 'Home renovation',
      income: 80000,
      employment: 'Full-time',
      creditScore: 750
    })

    await helpers.takeScreenshot('loan-form-filled')

    // Submit application
    await helpers.submitLoanApplication()

    // Wait for processing
    await helpers.waitForApiResponse('/api/decision')

    // Check if we're redirected to application status/details
    await helpers.expectText('Application Status')

    // Should see approval decision for good credit
    await helpers.expectText('Approved')

    await helpers.takeScreenshot('loan-approved-result')
  })

  test('complete loan application flow - rejected scenario', async ({ page }) => {
    await helpers.loginAsRegularUser()

    await page.goto('/apply')
    await helpers.waitForPageReady()

    // Fill loan application with poor credit profile
    await helpers.fillLoanApplication({
      amount: 100000,
      tenure: 60,
      purpose: 'Business expansion',
      income: 30000,
      employment: 'Part-time',
      creditScore: 450
    })

    await helpers.takeScreenshot('loan-form-poor-credit')

    // Submit application
    await helpers.submitLoanApplication()

    // Wait for processing
    await helpers.waitForApiResponse('/api/decision')

    // Should see rejection for poor credit/high risk
    await helpers.expectText('Rejected')

    await helpers.takeScreenshot('loan-rejected-result')
  })

  test('form validation works correctly', async ({ page }) => {
    await helpers.loginAsRegularUser()

    await page.goto('/apply')
    await helpers.waitForPageReady()

    // Try to submit empty form
    await helpers.clickButtonByText('Submit Application')

    // Should see validation errors
    await helpers.expectText('required')

    await helpers.takeScreenshot('form-validation-errors')

    // Fill invalid data
    await page.fill('input[name="amount"]', '-1000')
    await page.fill('input[name="tenure_months"]', '0')
    await page.fill('input[name="annual_income"]', 'invalid')

    await helpers.clickButtonByText('Submit Application')

    // Should still see validation errors
    await helpers.expectText('must be positive')

    await helpers.takeScreenshot('form-validation-invalid-data')
  })

  test('can view application history', async ({ page }) => {
    await helpers.loginAsRegularUser()

    // Go to applications list/history page
    await page.goto('/loans')
    await helpers.waitForPageReady()

    // Should see list of applications
    await helpers.expectVisible('text=Your Loan Applications')

    // Click on first application if any exist
    const firstApplication = page.locator('a[href^="/loans/"]').first()
    if (await firstApplication.isVisible()) {
      await firstApplication.click()

      // Should see application details
      await helpers.expectText('Application Details')
      await helpers.expectText('Decision')

      await helpers.takeScreenshot('application-details-view')
    }
  })

  test('can apply for multiple loans', async ({ page }) => {
    await helpers.loginAsRegularUser()

    // Submit first application
    await page.goto('/apply')
    await helpers.fillLoanApplication({
      amount: 25000,
      tenure: 12,
      purpose: 'Car purchase',
      income: 60000,
      employment: 'Full-time',
      creditScore: 700
    })
    await helpers.submitLoanApplication()

    // Submit second application
    await page.goto('/apply')
    await helpers.fillLoanApplication({
      amount: 15000,
      tenure: 18,
      purpose: 'Education',
      income: 60000,
      employment: 'Full-time',
      creditScore: 700
    })
    await helpers.submitLoanApplication()

    // Check that both applications exist in history
    await page.goto('/loans')
    await helpers.expectText('Car purchase')
    await helpers.expectText('Education')

    await helpers.takeScreenshot('multiple-applications')
  })

  test('application status updates correctly', async ({ page }) => {
    await helpers.loginAsRegularUser()

    await page.goto('/apply')
    await helpers.fillLoanApplication({
      amount: 40000,
      tenure: 36,
      purpose: 'Debt consolidation',
      income: 70000,
      employment: 'Full-time',
      creditScore: 680
    })

    // Submit and capture initial status
    await helpers.submitLoanApplication()

    // Should show processing/pending initially
    await helpers.expectText('Processing')

    // Wait for AI decision
    await helpers.waitForApiResponse('/api/decision')

    // Refresh to see updated status
    await page.reload()

    // Should show final decision
    const hasApproved = await page.locator('text=Approved').isVisible()
    const hasRejected = await page.locator('text=Rejected').isVisible()

    expect(hasApproved || hasRejected).toBeTruthy()

    await helpers.takeScreenshot('final-application-status')
  })

  test('decision reasoning is displayed', async ({ page }) => {
    await helpers.loginAsRegularUser()

    await page.goto('/apply')
    await helpers.fillLoanApplication({
      amount: 30000,
      tenure: 24,
      purpose: 'Medical expenses',
      income: 55000,
      employment: 'Full-time',
      creditScore: 620
    })

    await helpers.submitLoanApplication()
    await helpers.waitForApiResponse('/api/decision')

    // Should see decision reasoning
    await helpers.expectText('Decision Factors')

    // Should see specific factors like credit score, income, etc.
    const hasReasoningText = await page.locator('text=credit score').isVisible() ||
                           await page.locator('text=income').isVisible() ||
                           await page.locator('text=debt-to-income').isVisible()

    expect(hasReasoningText).toBeTruthy()

    await helpers.takeScreenshot('decision-reasoning')
  })
})
