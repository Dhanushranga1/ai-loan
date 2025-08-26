// Health check endpoint
// Returns system status for monitoring

import { NextResponse } from 'next/server'

export async function GET() {
  const healthStatus = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  }

  return NextResponse.json(healthStatus)
}
