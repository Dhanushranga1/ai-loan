# E2E Testing Documentation

## Overview

This directory contains End-to-End (E2E) tests for the AI Loan Approval System using Playwright. These tests verify the complete user workflows and ensure the application works correctly from the user's perspective.

## Test Structure

```
tests/e2e/
├── helpers.ts           # Test utilities and helper functions
├── setup.ts            # Test environment setup and configuration
├── smoke.spec.ts       # Basic smoke tests
├── loan-flow.spec.ts   # Complete loan application workflows
└── admin-flow.spec.ts  # Admin panel and workflow tests
```

## Test Categories

### 1. Smoke Tests (`smoke.spec.ts`)
- Homepage loads correctly
- Login page functionality
- Navigation works
- Authentication requirements
- Responsive design

### 2. Loan Application Flow (`loan-flow.spec.ts`)
- Complete application submission
- Form validation
- Decision processing
- Application history
- Status updates
- Decision reasoning display

### 3. Admin Workflows (`admin-flow.spec.ts`)
- Admin access control
- Loan applications list
- Filtering and search
- Pagination
- Read-only interface verification
- Audit capabilities

## Running Tests

### Prerequisites
1. Ensure the application is running locally (`npm run dev`)
2. Have test users set up in the database:
   - `admin@test.com` with admin role
   - `user@test.com` with user role

### Basic Commands

```bash
# Run all E2E tests
npm run test:e2e

# Run with UI mode (interactive)
npm run test:e2e:ui

# Run in headed mode (see browser)
npm run test:e2e:headed

# Run only smoke tests
npm run test:e2e:smoke

# Debug tests
npm run test:e2e:debug

# View test report
npm run test:e2e:report
```

### Advanced Commands

```bash
# Run specific test file
npx playwright test loan-flow.spec.ts

# Run specific test
npx playwright test -g "complete loan application flow"

# Run tests in specific browser
npx playwright test --project=chromium

# Run tests with trace
npx playwright test --trace on
```

## Test Configuration

### Environment Variables
- `PLAYWRIGHT_BASE_URL`: Application URL (default: http://localhost:3000)
- `TEST_ADMIN_EMAIL`: Admin user email (default: admin@test.com)
- `TEST_ADMIN_PASSWORD`: Admin user password (default: testpassword123)
- `TEST_USER_EMAIL`: Regular user email (default: user@test.com)
- `TEST_USER_PASSWORD`: Regular user password (default: testpassword123)

### Browser Support
Tests run on:
- Chrome/Chromium
- Firefox
- Safari/WebKit
- Mobile Chrome
- Mobile Safari
- Microsoft Edge

## Test Data Management

### Test Users
The tests expect these users to exist:

```javascript
// Admin user
{
  email: 'admin@test.com',
  password: 'testpassword123',
  role: 'admin',
  full_name: 'Test Admin'
}

// Regular user
{
  email: 'user@test.com',
  password: 'testpassword123',
  role: 'user',
  full_name: 'Test User'
}
```

### Test Applications
Tests may create loan applications with various scenarios:
- High credit score (750+) - likely approval
- Low credit score (450-) - likely rejection
- Various loan amounts and purposes
- Different employment types

## Helper Functions

The `helpers.ts` file provides utilities for:
- User authentication
- Form filling
- Navigation
- Screenshot capture
- API response waiting
- Element visibility checks

### Example Usage

```typescript
import { TestHelpers } from './helpers'

test('example test', async ({ page }) => {
  const helpers = new TestHelpers(page)

  await helpers.loginAsUser('user@test.com', 'password')
  await helpers.fillLoanApplication({
    amount: 50000,
    tenure: 24,
    purpose: 'Home renovation'
  })
  await helpers.submitLoanApplication()
  await helpers.takeScreenshot('test-result')
})
```

## Debugging Tests

### Screenshots
Failed tests automatically capture screenshots in `test-results/`

### Videos
Failed tests record videos for debugging

### Traces
Use `--trace on` to record detailed traces for debugging

### Debug Mode
Use `npm run test:e2e:debug` to step through tests interactively

## CI/CD Integration

### Jenkins Pipeline
Tests can be integrated into the Jenkins pipeline:

```groovy
stage('E2E Tests') {
  steps {
    sh 'npm run test:e2e'
  }
  post {
    always {
      publishHTML([
        allowMissing: false,
        alwaysLinkToLastBuild: true,
        keepAll: true,
        reportDir: 'playwright-report',
        reportFiles: 'index.html',
        reportName: 'E2E Test Report'
      ])
    }
  }
}
```

### Docker Support
Tests can run in containerized environments with proper setup.

## Best Practices

### Test Writing
1. Use descriptive test names
2. Include assertions for key behaviors
3. Take screenshots at important steps
4. Use helper functions for common operations
5. Keep tests focused and independent

### Maintenance
1. Update selectors when UI changes
2. Maintain test data consistency
3. Review and update test scenarios regularly
4. Monitor test execution times
5. Keep helper functions up to date

## Troubleshooting

### Common Issues

1. **Application not ready**
   - Ensure `npm run dev` is running
   - Check application loads at http://localhost:3000

2. **Authentication failures**
   - Verify test users exist in database
   - Check user credentials in test configuration

3. **Element not found**
   - Update selectors if UI changed
   - Add proper wait conditions
   - Check element visibility timing

4. **Timeout errors**
   - Increase timeout for slow operations
   - Wait for network requests to complete
   - Use proper loading indicators

### Debug Commands

```bash
# Run single test with debug
npx playwright test -g "specific test name" --debug

# Generate test code from recordings
npx playwright codegen localhost:3000

# Run tests with full trace
npx playwright test --trace on

# View test results
npx playwright show-report
```

## Contributing

When adding new tests:
1. Follow existing naming conventions
2. Add appropriate helper functions
3. Include proper assertions
4. Add screenshots for visual verification
5. Update this documentation

For test maintenance:
1. Review test failures promptly
2. Update selectors when UI changes
3. Maintain test data integrity
4. Monitor test execution performance
