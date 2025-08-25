// Health check endpoint for deployment monitoring
// Phase 5: CI/CD Pipeline & Deployment

export async function GET() {
  return new Response(
    JSON.stringify({
      ok: true,
      timestamp: new Date().toISOString(),
      service: 'ai-loan-approval',
      version: process.env.npm_package_version || 'unknown'
    }),
    {
      headers: { 'content-type': 'application/json' },
      status: 200
    }
  )
}
