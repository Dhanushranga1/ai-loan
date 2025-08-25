import { NextRequest } from 'next/server'

// In-memory store for rate limiting (in production, use Redis or similar)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

export interface RateLimitConfig {
  maxRequests: number
  windowMs: number
  message?: string
}

export interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  resetTime: number
  message?: string
}

/**
 * Rate limiting implementation
 * @param identifier - Unique identifier (usually user ID or IP)
 * @param config - Rate limit configuration
 * @returns Rate limit result
 */
export function rateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now()
  const key = `rate_limit:${identifier}`
  
  // Get current rate limit data
  const current = rateLimitStore.get(key)
  
  // If no previous record or window has expired, reset
  if (!current || now > current.resetTime) {
    const resetTime = now + config.windowMs
    rateLimitStore.set(key, { count: 1, resetTime })
    
    return {
      success: true,
      limit: config.maxRequests,
      remaining: config.maxRequests - 1,
      resetTime
    }
  }
  
  // If within rate limit, increment count
  if (current.count < config.maxRequests) {
    current.count++
    rateLimitStore.set(key, current)
    
    return {
      success: true,
      limit: config.maxRequests,
      remaining: config.maxRequests - current.count,
      resetTime: current.resetTime
    }
  }
  
  // Rate limit exceeded
  return {
    success: false,
    limit: config.maxRequests,
    remaining: 0,
    resetTime: current.resetTime,
    message: config.message || 'Rate limit exceeded'
  }
}

/**
 * Get rate limit identifier from request
 */
export function getRateLimitIdentifier(
  req: NextRequest,
  userId?: string
): string {
  // Prefer user ID if available
  if (userId) {
    return `user:${userId}`
  }
  
  // Fall back to IP address
  const forwarded = req.headers.get('x-forwarded-for')
  const realIp = req.headers.get('x-real-ip')
  const ip = forwarded ? forwarded.split(',')[0] : realIp || 'unknown'
  return `ip:${ip}`
}

/**
 * Rate limit middleware for API routes
 */
export function withRateLimit(
  config: RateLimitConfig,
  handler: (req: NextRequest) => Promise<Response>
) {
  return async (req: NextRequest) => {
    const identifier = getRateLimitIdentifier(req)
    const result = rateLimit(identifier, config)
    
    if (!result.success) {
      return new Response(
        JSON.stringify({
          error: result.message,
          limit: result.limit,
          remaining: result.remaining,
          resetTime: result.resetTime
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': result.limit.toString(),
            'X-RateLimit-Remaining': result.remaining.toString(),
            'X-RateLimit-Reset': result.resetTime.toString(),
            'Retry-After': Math.ceil((result.resetTime - Date.now()) / 1000).toString()
          }
        }
      )
    }
    
    // Add rate limit headers to successful responses
    const response = await handler(req)
    
    response.headers.set('X-RateLimit-Limit', result.limit.toString())
    response.headers.set('X-RateLimit-Remaining', result.remaining.toString())
    response.headers.set('X-RateLimit-Reset', result.resetTime.toString())
    
    return response
  }
}

/**
 * Cleanup expired rate limit entries (call periodically)
 */
export function cleanupRateLimitStore() {
  const now = Date.now()
  
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetTime) {
      rateLimitStore.delete(key)
    }
  }
}

// Cleanup expired entries every 5 minutes
if (typeof window === 'undefined') {
  setInterval(cleanupRateLimitStore, 5 * 60 * 1000)
}

// Predefined rate limit configurations
export const RATE_LIMITS = {
  // 3 requests per minute for loan decisions
  LOAN_DECISION: {
    maxRequests: 3,
    windowMs: 60 * 1000, // 1 minute
    message: 'Too many loan decision requests. Please wait before submitting another application.'
  },
  
  // 10 requests per minute for API calls
  API_GENERAL: {
    maxRequests: 10,
    windowMs: 60 * 1000,
    message: 'Too many API requests. Please slow down.'
  },
  
  // 5 requests per minute for authentication
  AUTH: {
    maxRequests: 5,
    windowMs: 60 * 1000,
    message: 'Too many authentication attempts. Please wait before trying again.'
  },
  
  // 20 requests per minute for data fetching
  DATA_FETCH: {
    maxRequests: 20,
    windowMs: 60 * 1000,
    message: 'Too many data requests. Please wait before refreshing.'
  }
}
