// Health check endpoint for deployment monitoring
// Phase 5: CI/CD Pipeline & Deployment

export async function GET() {
  const startTime = process.hrtime.bigint()

  // Gather system information for production monitoring
  const healthData = {
    ok: true,
    timestamp: new Date().toISOString(),
    service: 'ai-loan-approval',
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    build: process.env.BUILD_NUMBER ? `v1.0.0-${process.env.BUILD_NUMBER}` : 'local',
    uptime: process.uptime(),
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      rss: Math.round(process.memoryUsage().rss / 1024 / 1024)
    },
    system: {
      platform: process.platform,
      nodeVersion: process.version,
      pid: process.pid
    }
  }

  const endTime = process.hrtime.bigint()
  const responseTime = Number(endTime - startTime) / 1000000 // Convert to milliseconds

  return new Response(
    JSON.stringify({
      ...healthData,
      responseTime: Math.round(responseTime * 100) / 100 // Round to 2 decimal places
    }),
    {
      headers: {
        'content-type': 'application/json',
        'cache-control': 'no-cache, no-store, must-revalidate'
      },
      status: 200
    }
  )
}
