/**
 * Structured Logging Utility
 * Phase 7: Production Hardening
 */

export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug'
}

export interface LogContext {
  userId?: string
  sessionId?: string
  requestId?: string
  correlationId?: string
  userAgent?: string
  ip?: string
  method?: string
  url?: string
  statusCode?: number
  duration?: number
  [key: string]: any
}

export interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  service: string
  version: string
  environment: string
  context?: LogContext
  error?: {
    name: string
    message: string
    stack?: string
    code?: string
  }
  tags?: string[]
  metadata?: Record<string, any>
}

class Logger {
  private serviceName: string
  private version: string
  private environment: string
  private defaultContext: LogContext
  private logLevel: LogLevel

  constructor() {
    this.serviceName = 'ai-loan-approval'
    this.version = process.env.BUILD_VERSION || '1.0.0'
    this.environment = process.env.NODE_ENV || 'development'
    this.defaultContext = {}

    // Set log level from environment
    const envLogLevel = process.env.LOG_LEVEL?.toLowerCase()
    this.logLevel = this.parseLogLevel(envLogLevel) || LogLevel.INFO
  }

  private parseLogLevel(level?: string): LogLevel | undefined {
    switch (level) {
      case 'error': return LogLevel.ERROR
      case 'warn': return LogLevel.WARN
      case 'info': return LogLevel.INFO
      case 'debug': return LogLevel.DEBUG
      default: return undefined
    }
  }

  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.ERROR, LogLevel.WARN, LogLevel.INFO, LogLevel.DEBUG]
    const currentLevelIndex = levels.indexOf(this.logLevel)
    const messageLevelIndex = levels.indexOf(level)
    return messageLevelIndex <= currentLevelIndex
  }

  private createLogEntry(
    level: LogLevel,
    message: string,
    context?: LogContext,
    error?: Error,
    tags?: string[],
    metadata?: Record<string, any>
  ): LogEntry {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      service: this.serviceName,
      version: this.version,
      environment: this.environment,
      context: { ...this.defaultContext, ...context },
      tags,
      metadata
    }

    if (error) {
      entry.error = {
        name: error.name,
        message: error.message,
        stack: error.stack,
        code: (error as any).code
      }
    }

    return entry
  }

  private formatForConsole(entry: LogEntry): string {
    if (this.environment === 'development') {
      // Human-readable format for development
      const timestamp = new Date(entry.timestamp).toLocaleTimeString()
      const level = entry.level.toUpperCase().padEnd(5)
      const context = entry.context ? ` [${Object.entries(entry.context).map(([k, v]) => `${k}=${v}`).join(', ')}]` : ''
      const error = entry.error ? `\n  Error: ${entry.error.message}\n  Stack: ${entry.error.stack}` : ''

      return `${timestamp} ${level} ${entry.message}${context}${error}`
    } else {
      // JSON format for production
      return JSON.stringify(entry)
    }
  }

  private output(entry: LogEntry): void {
    if (!this.shouldLog(entry.level)) return

    const formatted = this.formatForConsole(entry)

    switch (entry.level) {
      case LogLevel.ERROR:
        console.error(formatted)
        break
      case LogLevel.WARN:
        console.warn(formatted)
        break
      case LogLevel.INFO:
        console.info(formatted)
        break
      case LogLevel.DEBUG:
        console.debug(formatted)
        break
    }

    // In production, you might also send to external logging service
    if (this.environment === 'production') {
      this.sendToExternalService(entry)
    }
  }

  private sendToExternalService(entry: LogEntry): void {
    // Placeholder for external logging service integration
    // Examples: Sentry, LogDNA, DataDog, CloudWatch, etc.

    if (process.env.SENTRY_DSN && entry.level === LogLevel.ERROR && entry.error) {
      // Would integrate with Sentry for error tracking
    }

    if (process.env.LOG_ENDPOINT) {
      // Would send to custom log aggregation endpoint
    }
  }

  setDefaultContext(context: LogContext): void {
    this.defaultContext = { ...this.defaultContext, ...context }
  }

  clearDefaultContext(): void {
    this.defaultContext = {}
  }

  error(message: string, error?: Error, context?: LogContext, metadata?: Record<string, any>): void {
    const entry = this.createLogEntry(LogLevel.ERROR, message, context, error, ['error'], metadata)
    this.output(entry)
  }

  warn(message: string, context?: LogContext, metadata?: Record<string, any>): void {
    const entry = this.createLogEntry(LogLevel.WARN, message, context, undefined, ['warning'], metadata)
    this.output(entry)
  }

  info(message: string, context?: LogContext, metadata?: Record<string, any>): void {
    const entry = this.createLogEntry(LogLevel.INFO, message, context, undefined, ['info'], metadata)
    this.output(entry)
  }

  debug(message: string, context?: LogContext, metadata?: Record<string, any>): void {
    const entry = this.createLogEntry(LogLevel.DEBUG, message, context, undefined, ['debug'], metadata)
    this.output(entry)
  }

  // Specific logging methods for common scenarios

  logApiRequest(method: string, url: string, statusCode: number, duration: number, context?: LogContext): void {
    this.info('API Request', {
      ...context,
      method,
      url,
      statusCode,
      duration
    }, {
      type: 'api_request',
      performance: { responseTime: duration }
    })
  }

  logUserAction(action: string, userId: string, context?: LogContext, metadata?: Record<string, any>): void {
    this.info(`User Action: ${action}`, {
      ...context,
      userId
    }, {
      type: 'user_action',
      action,
      ...metadata
    })
  }

  logLoanDecision(loanId: string, decision: string, score: number, userId: string, context?: LogContext): void {
    this.info('Loan Decision Made', {
      ...context,
      userId
    }, {
      type: 'loan_decision',
      loanId,
      decision,
      score
    })
  }

  logSecurityEvent(event: string, severity: 'low' | 'medium' | 'high', context?: LogContext, metadata?: Record<string, any>): void {
    const level = severity === 'high' ? LogLevel.ERROR : severity === 'medium' ? LogLevel.WARN : LogLevel.INFO

    const entry = this.createLogEntry(level, `Security Event: ${event}`, context, undefined, ['security', severity], {
      type: 'security_event',
      event,
      severity,
      ...metadata
    })

    this.output(entry)
  }

  logPerformanceMetric(metric: string, value: number, unit: string, context?: LogContext): void {
    this.debug(`Performance Metric: ${metric}`, context, {
      type: 'performance',
      metric,
      value,
      unit
    })
  }

  // Create a child logger with additional context
  child(context: LogContext): Logger {
    const childLogger = new Logger()
    childLogger.setDefaultContext({ ...this.defaultContext, ...context })
    return childLogger
  }
}

// Create singleton logger instance
export const logger = new Logger()

// Request logging middleware helper
export function createRequestLogger(req: Request) {
  const requestId = crypto.randomUUID()
  const startTime = Date.now()

  return {
    requestId,
    log: logger.child({
      requestId,
      method: req.method,
      url: req.url,
      userAgent: req.headers.get('user-agent') || undefined,
      ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || undefined
    }),
    finish: (statusCode: number) => {
      const duration = Date.now() - startTime
      logger.logApiRequest(req.method, req.url, statusCode, duration, {
        requestId
      })
    }
  }
}

// Express-style middleware for API routes
export function logMiddleware(req: Request, handler: (req: Request) => Promise<Response>) {
  return async (request: Request) => {
    const requestLogger = createRequestLogger(request)

    try {
      const response = await handler(request)
      requestLogger.finish(response.status)
      return response
    } catch (error) {
      requestLogger.log.error('Request handler error', error as Error, {
        requestId: requestLogger.requestId
      })
      requestLogger.finish(500)
      throw error
    }
  }
}

// Performance monitoring helper
export function withPerformanceLogging<T>(
  operationName: string,
  operation: () => Promise<T>,
  context?: LogContext
): Promise<T> {
  return new Promise(async (resolve, reject) => {
    const startTime = Date.now()

    try {
      const result = await operation()
      const duration = Date.now() - startTime

      logger.logPerformanceMetric('operation_duration', duration, 'ms', {
        ...context,
        operation: operationName
      })

      resolve(result)
    } catch (error) {
      const duration = Date.now() - startTime

      logger.error(`Operation failed: ${operationName}`, error as Error, {
        ...context,
        operation: operationName,
        duration
      })

      reject(error)
    }
  })
}

export default logger
