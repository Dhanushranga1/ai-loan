import { Page, expect } from '@playwright/test'

export class TestHelpers {
  constructor(public readonly page: Page) {}

  /**
   * Login as a test user
   */
  async loginAsUser(email: string, password: string) {
    await this.page.goto('/login')
    await this.page.fill('input[name="email"]', email)
    await this.page.fill('input[name="password"]', password)
    await this.page.click('button[type="submit"]')
    
    // Wait for redirect after login
    await this.page.waitForURL('/')
    await expect(this.page.locator('text=Welcome')).toBeVisible()
  }

  /**
   * Login as an admin user
   */
  async loginAsAdmin() {
    await this.loginAsUser('admin@test.com', 'testpassword123')
  }

  /**
   * Login as a regular user
   */
  async loginAsRegularUser() {
    await this.loginAsUser('user@test.com', 'testpassword123')
  }

  /**
   * Logout current user
   */
  async logout() {
    await this.page.click('button[aria-label="User menu"]')
    await this.page.click('text=Logout')
    await this.page.waitForURL('/login')
  }

  /**
   * Fill loan application form
   */
  async fillLoanApplication(data: {
    amount: number
    tenure: number
    purpose: string
    income: number
    employment: string
    creditScore?: number
  }) {
    await this.page.goto('/apply')
    
    // Fill loan details
    await this.page.fill('input[name="amount"]', data.amount.toString())
    await this.page.fill('input[name="tenure_months"]', data.tenure.toString())
    await this.page.fill('input[name="purpose"]', data.purpose)
    
    // Fill personal details
    await this.page.fill('input[name="annual_income"]', data.income.toString())
    await this.page.fill('input[name="employment_type"]', data.employment)
    
    if (data.creditScore) {
      await this.page.fill('input[name="credit_score"]', data.creditScore.toString())
    }
  }

  /**
   * Submit loan application
   */
  async submitLoanApplication() {
    await this.page.click('button[type="submit"]')
    
    // Wait for success message or redirect
    await expect(
      this.page.locator('text=Application submitted successfully')
    ).toBeVisible()
  }

  /**
   * Navigate to admin panel
   */
  async goToAdminPanel() {
    await this.page.goto('/loans')
    await expect(this.page.locator('h1:has-text("Admin - Loan Applications")')).toBeVisible()
  }

  /**
   * Wait for page to be ready
   */
  async waitForPageReady() {
    await this.page.waitForLoadState('networkidle')
    await this.page.waitForSelector('body')
  }

  /**
   * Take screenshot with name
   */
  async takeScreenshot(name: string) {
    await this.page.screenshot({ 
      path: `test-results/${name}.png`,
      fullPage: true 
    })
  }

  /**
   * Check if element is visible with timeout
   */
  async expectVisible(selector: string, timeout = 5000) {
    await expect(this.page.locator(selector)).toBeVisible({ timeout })
  }

  /**
   * Check if text is present on page
   */
  async expectText(text: string, timeout = 5000) {
    await expect(this.page.locator(`text=${text}`)).toBeVisible({ timeout })
  }

  /**
   * Fill form field by label
   */
  async fillFieldByLabel(label: string, value: string) {
    await this.page.fill(`input:near(label:has-text("${label}"))`, value)
  }

  /**
   * Click button by text
   */
  async clickButtonByText(text: string) {
    await this.page.click(`button:has-text("${text}")`)
  }

  /**
   * Wait for API response
   */
  async waitForApiResponse(urlPattern: string) {
    const responsePromise = this.page.waitForResponse(response => 
      response.url().includes(urlPattern) && response.status() === 200
    )
    return responsePromise
  }

  /**
   * Check if user is on login page
   */
  async isOnLoginPage() {
    return this.page.url().includes('/login')
  }

  /**
   * Check if user is logged in
   */
  async isLoggedIn() {
    try {
      await this.page.locator('button[aria-label="User menu"]').waitFor({ timeout: 2000 })
      return true
    } catch {
      return false
    }
  }
}
