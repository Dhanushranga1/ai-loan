/**
 * Integration test for health endpoint
 * Validates API functionality in CI environment
 */

import { GET } from '@/app/api/health/route'

describe('/api/health endpoint', () => {
  it('should return health status with correct structure', async () => {
    // Call the health endpoint
    const response = await GET()

    // Verify response status
    expect(response.status).toBe(200)

    // Parse response body
    const healthData = await response.json()

    // Verify response structure
    expect(healthData).toHaveProperty('ok')
    expect(healthData).toHaveProperty('timestamp')
    expect(healthData).toHaveProperty('service')
    expect(healthData).toHaveProperty('version')

    // Verify response values
    expect(healthData.ok).toBe(true)
    expect(healthData.service).toBe('ai-loan-approval')
    expect(typeof healthData.timestamp).toBe('string')
    expect(typeof healthData.version).toBe('string')

    // Verify timestamp is recent (within last minute)
    const timestamp = new Date(healthData.timestamp)
    const now = new Date()
    const timeDiff = now.getTime() - timestamp.getTime()
    expect(timeDiff).toBeLessThan(60000) // Less than 1 minute
  })

  it('should return consistent response format', async () => {
    // Make multiple calls
    const response1 = await GET()
    const response2 = await GET()

    const health1 = await response1.json()
    const health2 = await response2.json()

    // Should have same structure
    expect(Object.keys(health1).sort()).toEqual(Object.keys(health2).sort())

    // Static values should be the same
    expect(health1.ok).toBe(health2.ok)
    expect(health1.service).toBe(health2.service)
  })

  it('should return correct HTTP response format', async () => {
    const response = await GET()

    expect(response.status).toBe(200)
    expect(response.headers.get('content-type')).toBe('application/json')
  })
})
