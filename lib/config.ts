/**
 * Environment Configuration and Validation
 * Phase 7: Production Hardening
 */

export interface EnvironmentConfig {
  // Application
  NODE_ENV: string
  PORT: string
  APP_URL: string

  // Database & Auth
  NEXT_PUBLIC_SUPABASE_URL: string
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string
  SUPABASE_SERVICE_ROLE_KEY?: string

  // AI & Scoring
  AI_MODEL_ENDPOINT?: string
  AI_API_KEY?: string

  // Build Information
  BUILD_SHA?: string
  BUILD_TIMESTAMP?: string
  BUILD_VERSION?: string

  // Monitoring & Logging
  LOG_LEVEL?: string
  ENABLE_ANALYTICS?: string
  SENTRY_DSN?: string

  // Feature Flags
  ENABLE_RATE_LIMITING?: string
  ENABLE_AUDIT_LOGGING?: string
  ENABLE_E2E_TESTS?: string

  // Security
  ALLOWED_ORIGINS?: string
  SESSION_SECRET?: string
  ENCRYPTION_KEY?: string
}

/**
 * Required environment variables for the application to function
 */
const REQUIRED_ENV_VARS: (keyof EnvironmentConfig)[] = [
  'NODE_ENV',
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY'
]

/**
 * Development environment defaults
 */
const DEV_DEFAULTS: Partial<EnvironmentConfig> = {
  PORT: '3000',
  APP_URL: 'http://localhost:3000',
  LOG_LEVEL: 'debug',
  ENABLE_ANALYTICS: 'false',
  ENABLE_RATE_LIMITING: 'true',
  ENABLE_AUDIT_LOGGING: 'true',
  ENABLE_E2E_TESTS: 'false'
}

/**
 * Production environment defaults
 */
const PROD_DEFAULTS: Partial<EnvironmentConfig> = {
  PORT: '3000',
  LOG_LEVEL: 'info',
  ENABLE_ANALYTICS: 'true',
  ENABLE_RATE_LIMITING: 'true',
  ENABLE_AUDIT_LOGGING: 'true',
  ENABLE_E2E_TESTS: 'false'
}

/**
 * Validation rules for environment variables
 */
const VALIDATION_RULES = {
  NODE_ENV: (value: string) => ['development', 'production', 'test'].includes(value),
  PORT: (value: string) => !isNaN(parseInt(value)) && parseInt(value) > 0,
  APP_URL: (value: string) => {
    try {
      new URL(value)
      return true
    } catch {
      return false
    }
  },
  NEXT_PUBLIC_SUPABASE_URL: (value: string) => {
    try {
      const url = new URL(value)
      return url.protocol === 'https:' || url.hostname === 'localhost'
    } catch {
      return false
    }
  },
  LOG_LEVEL: (value: string) => ['error', 'warn', 'info', 'debug'].includes(value),
  ENABLE_ANALYTICS: (value: string) => ['true', 'false'].includes(value),
  ENABLE_RATE_LIMITING: (value: string) => ['true', 'false'].includes(value),
  ENABLE_AUDIT_LOGGING: (value: string) => ['true', 'false'].includes(value),
  ENABLE_E2E_TESTS: (value: string) => ['true', 'false'].includes(value)
}

/**
 * Load and validate environment configuration
 */
export function loadEnvironmentConfig(): EnvironmentConfig {
  const env = process.env
  const nodeEnv = env.NODE_ENV || 'development'
  const isDev = nodeEnv === 'development'
  const isProd = nodeEnv === 'production'

  // Apply defaults based on environment
  const defaults = isDev ? DEV_DEFAULTS : isProd ? PROD_DEFAULTS : {}

  // Build configuration object
  const config: EnvironmentConfig = {
    // Required variables
    NODE_ENV: nodeEnv,
    PORT: env.PORT || defaults.PORT || '3000',
    APP_URL: env.APP_URL || defaults.APP_URL || (isProd ? 'https://localhost:3000' : 'http://localhost:3000'),

    // Database & Auth
    NEXT_PUBLIC_SUPABASE_URL: env.NEXT_PUBLIC_SUPABASE_URL!,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    SUPABASE_SERVICE_ROLE_KEY: env.SUPABASE_SERVICE_ROLE_KEY,

    // AI & Scoring
    AI_MODEL_ENDPOINT: env.AI_MODEL_ENDPOINT,
    AI_API_KEY: env.AI_API_KEY,

    // Build Information
    BUILD_SHA: env.BUILD_SHA || env.GITHUB_SHA || 'unknown',
    BUILD_TIMESTAMP: env.BUILD_TIMESTAMP || new Date().toISOString(),
    BUILD_VERSION: env.BUILD_VERSION || env.npm_package_version || '1.0.0',

    // Monitoring & Logging
    LOG_LEVEL: env.LOG_LEVEL || defaults.LOG_LEVEL || 'info',
    ENABLE_ANALYTICS: env.ENABLE_ANALYTICS || defaults.ENABLE_ANALYTICS || 'false',
    SENTRY_DSN: env.SENTRY_DSN,

    // Feature Flags
    ENABLE_RATE_LIMITING: env.ENABLE_RATE_LIMITING || defaults.ENABLE_RATE_LIMITING || 'true',
    ENABLE_AUDIT_LOGGING: env.ENABLE_AUDIT_LOGGING || defaults.ENABLE_AUDIT_LOGGING || 'true',
    ENABLE_E2E_TESTS: env.ENABLE_E2E_TESTS || defaults.ENABLE_E2E_TESTS || 'false',

    // Security
    ALLOWED_ORIGINS: env.ALLOWED_ORIGINS,
    SESSION_SECRET: env.SESSION_SECRET,
    ENCRYPTION_KEY: env.ENCRYPTION_KEY
  }

  return config
}

/**
 * Validate environment configuration
 */
export function validateEnvironmentConfig(config: EnvironmentConfig): {
  isValid: boolean
  errors: string[]
  warnings: string[]
} {
  const errors: string[] = []
  const warnings: string[] = []

  // Check required variables
  for (const requiredVar of REQUIRED_ENV_VARS) {
    const value = config[requiredVar]
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      errors.push(`Required environment variable ${requiredVar} is missing or empty`)
    }
  }

  // Validate values according to rules
  for (const [key, validator] of Object.entries(VALIDATION_RULES)) {
    const value = config[key as keyof EnvironmentConfig]
    if (value && !validator(value)) {
      errors.push(`Environment variable ${key} has invalid value: ${value}`)
    }
  }

  // Production-specific validations
  if (config.NODE_ENV === 'production') {
    if (!config.SUPABASE_SERVICE_ROLE_KEY) {
      warnings.push('SUPABASE_SERVICE_ROLE_KEY is not set for production')
    }

    if (!config.SESSION_SECRET || config.SESSION_SECRET.length < 32) {
      errors.push('SESSION_SECRET must be set and at least 32 characters long in production')
    }

    if (!config.ENCRYPTION_KEY) {
      warnings.push('ENCRYPTION_KEY is not set for production')
    }

    if (config.APP_URL.includes('localhost')) {
      warnings.push('APP_URL appears to be set to localhost in production')
    }

    if (!config.SENTRY_DSN) {
      warnings.push('SENTRY_DSN is not set for production error monitoring')
    }
  }

  // Development-specific validations
  if (config.NODE_ENV === 'development') {
    if (config.ENABLE_ANALYTICS === 'true') {
      warnings.push('Analytics are enabled in development environment')
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

/**
 * Get environment configuration with validation
 */
export function getValidatedConfig(): EnvironmentConfig {
  const config = loadEnvironmentConfig()
  const validation = validateEnvironmentConfig(config)

  // Log warnings
  if (validation.warnings.length > 0) {
    console.warn('Environment configuration warnings:')
    validation.warnings.forEach(warning => console.warn(`  - ${warning}`))
  }

  // Throw on errors
  if (!validation.isValid) {
    console.error('Environment configuration errors:')
    validation.errors.forEach(error => console.error(`  - ${error}`))
    throw new Error(`Invalid environment configuration: ${validation.errors.join(', ')}`)
  }

  return config
}

/**
 * Feature flag helpers
 */
export function isFeatureEnabled(feature: string, config?: EnvironmentConfig): boolean {
  const envConfig = config || loadEnvironmentConfig()
  const featureKey = `ENABLE_${feature.toUpperCase()}` as keyof EnvironmentConfig
  return envConfig[featureKey] === 'true'
}

/**
 * Get build information
 */
export function getBuildInfo(config?: EnvironmentConfig) {
  const envConfig = config || loadEnvironmentConfig()

  return {
    version: envConfig.BUILD_VERSION,
    sha: envConfig.BUILD_SHA?.substring(0, 8) || 'unknown',
    timestamp: envConfig.BUILD_TIMESTAMP,
    environment: envConfig.NODE_ENV
  }
}

/**
 * Check if application is ready
 */
export async function healthCheck(): Promise<{
  status: 'healthy' | 'unhealthy'
  checks: Record<string, boolean>
  timestamp: string
}> {
  const checks: Record<string, boolean> = {}

  // Environment validation
  try {
    getValidatedConfig()
    checks.environment = true
  } catch {
    checks.environment = false
  }

  // Database connectivity (basic check)
  try {
    // This would be a basic connectivity test to Supabase
    checks.database = true // Placeholder
  } catch {
    checks.database = false
  }

  // Service dependencies
  checks.services = true // Placeholder for external service checks

  const allHealthy = Object.values(checks).every(check => check)

  return {
    status: allHealthy ? 'healthy' : 'unhealthy',
    checks,
    timestamp: new Date().toISOString()
  }
}

// Initialize and validate config on import (server-side only)
let cachedConfig: EnvironmentConfig | null = null

export function getConfig(): EnvironmentConfig {
  if (typeof window !== 'undefined') {
    throw new Error('getConfig() should only be called server-side')
  }

  if (!cachedConfig) {
    cachedConfig = getValidatedConfig()
  }

  return cachedConfig
}
