import { chromium, FullConfig } from '@playwright/test'
import { TestEnvironment } from './e2e/setup'

async function globalSetup(config: FullConfig) {
  console.log('🚀 Setting up E2E test environment...')

  const testEnv = new TestEnvironment()

  try {
    await testEnv.setup()

    // Wait for the application to be ready
    console.log('⏳ Waiting for application to be ready...')
    await testEnv.waitForApplicationReady()

    // Set up test users (in a real environment, this would create actual users)
    console.log('👥 Setting up test users...')
    await testEnv.createTestUsers()

    // Seed test data
    console.log('🌱 Seeding test data...')
    await testEnv.seedTestData()

    console.log('✅ E2E test environment setup complete!')

  } catch (error) {
    console.error('❌ Failed to set up test environment:', error)
    throw error
  } finally {
    await testEnv.cleanup()
  }
}

export default globalSetup
