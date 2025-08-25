# AI Loan Approval System - Operational Runbook

## Overview

This runbook provides operational procedures, monitoring guidelines, and troubleshooting steps for the AI Loan Approval System in production.

**Service:** `ai-loan-approval`
**Version:** 1.0.0
**Environment:** Production
**Last Updated:** August 2025

## Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Load Balancer │    │   Next.js App   │    │   Supabase DB   │
│     (Nginx)     │◄──►│   (Container)   │◄──►│   (PostgreSQL)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │   AI Scoring    │
                       │    Service      │
                       └─────────────────┘
```

### Core Components
- **Frontend:** Next.js React application
- **Backend:** Next.js API routes
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **AI Scoring:** Internal scoring algorithm
- **Monitoring:** Health checks, structured logging

## Service Endpoints

### Health Check
- **URL:** `/api/health`
- **Method:** GET
- **Expected Status:** 200 (healthy) / 503 (unhealthy)
- **Response Time:** < 100ms

### Key API Endpoints
- **Loan Application:** `POST /api/loans`
- **Decision Making:** `POST /api/loans/[id]/decide`
- **Authentication:** `POST /api/auth/login`
- **Admin Panel:** `/admin/loans` (requires admin role)

## Monitoring & Alerting

### Health Checks

#### Application Health
```bash
curl -f http://localhost:3000/api/health
```

Expected response:
```json
{
  "ok": true,
  "status": "healthy",
  "timestamp": "2025-08-25T10:00:00.000Z",
  "checks": {
    "environment": true,
    "database": true,
    "services": true
  }
}
```

#### Database Connectivity
Monitor Supabase dashboard or use health check endpoint which includes DB connectivity.

### Key Metrics to Monitor

#### Application Metrics
- **Response Time:** API endpoints < 2s (p95)
- **Error Rate:** < 5% for all endpoints
- **Availability:** > 99.5% uptime
- **Memory Usage:** < 80% of container limit
- **CPU Usage:** < 70% average

#### Business Metrics
- **Loan Applications:** Track daily/hourly volume
- **Decision Accuracy:** Monitor approval/rejection rates
- **Processing Time:** Loan decision processing < 10s
- **User Sessions:** Active user count

#### Security Metrics
- **Failed Login Attempts:** Monitor for brute force attacks
- **Rate Limit Triggers:** Track API rate limiting events
- **Unauthorized Access:** Monitor 401/403 responses

### Log Monitoring

#### Log Levels
- **ERROR:** Service errors, failed operations
- **WARN:** Rate limits, security events, performance issues
- **INFO:** User actions, API requests, business events
- **DEBUG:** Detailed troubleshooting information

#### Key Log Patterns to Monitor
```bash
# Application errors
grep "ERROR" logs/ | grep -E "database|auth|scoring"

# Security events
grep "Security Event" logs/ | grep -E "high|medium"

# Performance issues
grep "responseTime" logs/ | awk '$NF > 2000'

# Rate limiting
grep "Rate limit exceeded" logs/
```

## Deployment Procedures

### Pre-Deployment Checklist
- [ ] Code reviewed and approved
- [ ] Tests passing (unit, integration, E2E)
- [ ] Security scan completed
- [ ] Database migrations tested
- [ ] Environment variables validated
- [ ] Backup completed

### Deployment Steps

#### 1. Prepare Environment
```bash
# Validate configuration
npm run config:validate

# Run tests
npm run test
npm run test:e2e

# Build application
npm run build
```

#### 2. Deploy to Staging
```bash
# Deploy to staging environment
jenkins deploy --environment=staging --branch=main

# Validate staging deployment
curl -f https://staging.loan-app.com/api/health
```

#### 3. Production Deployment
```bash
# Deploy to production
jenkins deploy --environment=production --branch=main

# Validate production deployment
curl -f https://app.loan-approval.com/api/health

# Monitor logs for errors
tail -f /var/log/app/application.log
```

### Post-Deployment Verification
- [ ] Health check returns 200
- [ ] Key user flows work (login, apply for loan)
- [ ] Admin panel accessible
- [ ] Database connectivity confirmed
- [ ] No error spikes in logs

## Environment Configuration

### Required Environment Variables

#### Production Environment
```bash
NODE_ENV=production
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
APP_URL=https://your-domain.com
SESSION_SECRET=your-32-char-secret
LOG_LEVEL=info
ENABLE_RATE_LIMITING=true
ENABLE_AUDIT_LOGGING=true
SENTRY_DSN=your-sentry-dsn
```

#### Build Information
```bash
BUILD_SHA=${GITHUB_SHA}
BUILD_TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
BUILD_VERSION=${npm_package_version}
```

### Configuration Validation
```bash
# Check configuration
curl -s http://localhost:3000/api/health | jq '.checks.environment'
```

## Troubleshooting Guide

### Common Issues

#### 1. Service Not Starting

**Symptoms:**
- Container fails to start
- Health check returns 503
- "Configuration validation failed" error

**Diagnosis:**
```bash
# Check container logs
docker logs ai-loan-approval

# Validate environment
node -e "require('./lib/config').getValidatedConfig()"

# Check required variables
env | grep -E "SUPABASE|NODE_ENV"
```

**Resolution:**
1. Verify all required environment variables are set
2. Check Supabase connectivity
3. Validate configuration format
4. Restart service with correct configuration

#### 2. Database Connection Issues

**Symptoms:**
- 500 errors on API calls
- "Database connection failed" in logs
- Health check shows `database: false`

**Diagnosis:**
```bash
# Test Supabase connection
curl -H "apikey: YOUR_ANON_KEY" \
     "https://YOUR_PROJECT.supabase.co/rest/v1/profiles?select=id&limit=1"

# Check connection pool
grep "database" logs/ | tail -20
```

**Resolution:**
1. Verify Supabase service status
2. Check API keys and URLs
3. Review database connection limits
4. Restart application

#### 3. High Response Times

**Symptoms:**
- Slow page loads
- API timeouts
- Response times > 2s

**Diagnosis:**
```bash
# Check performance logs
grep "responseTime" logs/ | sort -k4 -nr | head -10

# Monitor system resources
top
free -h
df -h
```

**Resolution:**
1. Check database query performance
2. Review memory/CPU usage
3. Scale horizontal if needed
4. Optimize slow queries

#### 4. Rate Limiting Issues

**Symptoms:**
- 429 responses
- "Rate limit exceeded" errors
- Users unable to complete actions

**Diagnosis:**
```bash
# Check rate limit logs
grep "Rate limit exceeded" logs/ | tail -20

# Monitor rate limit headers
curl -I http://localhost:3000/api/loans/test/decide
```

**Resolution:**
1. Review rate limit thresholds
2. Check for legitimate traffic spikes
3. Implement user-specific limits
4. Add rate limit bypass for admin users

#### 5. Authentication Problems

**Symptoms:**
- Login failures
- Session timeouts
- Unauthorized access errors

**Diagnosis:**
```bash
# Check auth logs
grep "auth" logs/ | grep ERROR

# Verify Supabase auth status
curl "https://YOUR_PROJECT.supabase.co/auth/v1/settings"
```

**Resolution:**
1. Verify Supabase auth configuration
2. Check JWT token validity
3. Review session management
4. Clear browser cache/cookies

### Performance Tuning

#### Database Optimization
```sql
-- Check slow queries
SELECT query, mean_time, calls
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;

-- Index recommendations
SELECT schemaname, tablename, attname, n_distinct, correlation
FROM pg_stats
WHERE tablename IN ('profiles', 'loan_applications', 'decisions');
```

#### Application Optimization
- Enable response compression
- Implement caching for static data
- Optimize bundle size
- Use CDN for static assets

## Security Procedures

### Security Monitoring
- Monitor failed authentication attempts
- Track privilege escalation attempts
- Review admin access logs
- Monitor for suspicious patterns

### Incident Response

#### Security Incident (High Priority)
1. **Immediate Response**
   - Isolate affected systems
   - Preserve logs and evidence
   - Notify security team
   - Document timeline

2. **Assessment**
   - Determine scope of breach
   - Identify affected data
   - Assess system integrity

3. **Containment**
   - Patch vulnerabilities
   - Reset compromised credentials
   - Update security policies

4. **Recovery**
   - Restore from clean backups
   - Implement additional monitoring
   - Validate system security

### Regular Security Tasks
- [ ] Weekly: Review access logs
- [ ] Monthly: Update dependencies
- [ ] Monthly: Security scan
- [ ] Quarterly: Penetration testing
- [ ] Annually: Security audit

## Backup & Recovery

### Backup Procedures

#### Database Backup
Supabase provides automated backups, but for critical data:
```sql
-- Manual backup
pg_dump your_database > backup_$(date +%Y%m%d_%H%M%S).sql

-- Verify backup
pg_restore --list backup_file.sql
```

#### Application Backup
- Source code: Git repository
- Configuration: Environment variables
- Logs: Archived in log management system

### Recovery Procedures

#### Database Recovery
```bash
# Restore from Supabase backup
# Use Supabase dashboard or API

# Restore from manual backup
psql your_database < backup_file.sql
```

#### Application Recovery
```bash
# Redeploy from last known good state
jenkins deploy --environment=production --commit=LAST_GOOD_SHA

# Verify deployment
curl -f https://app.loan-approval.com/api/health
```

## Maintenance Procedures

### Regular Maintenance

#### Daily
- [ ] Check health status
- [ ] Review error logs
- [ ] Monitor key metrics
- [ ] Verify backup completion

#### Weekly
- [ ] Review performance metrics
- [ ] Update dependencies
- [ ] Clean old logs
- [ ] Security scan

#### Monthly
- [ ] Capacity planning review
- [ ] Security audit
- [ ] Update documentation
- [ ] Disaster recovery test

### Planned Maintenance

#### Database Maintenance
```sql
-- Update statistics
ANALYZE;

-- Clean up old data
DELETE FROM audit_logs WHERE created_at < NOW() - INTERVAL '90 days';

-- Reindex tables
REINDEX TABLE loan_applications;
```

#### Application Maintenance
```bash
# Update dependencies
npm audit fix
npm update

# Clear caches
redis-cli FLUSHALL

# Rotate logs
logrotate /etc/logrotate.d/app
```

## Emergency Procedures

### Service Outage Response

#### Priority 1 (Service Down)
1. **Immediate Response (0-5 minutes)**
   - Check health endpoint
   - Review error logs
   - Verify infrastructure status

2. **Diagnosis (5-15 minutes)**
   - Identify root cause
   - Check dependencies
   - Review recent changes

3. **Resolution (15-30 minutes)**
   - Implement fix or rollback
   - Verify service restoration
   - Monitor for stability

#### Priority 2 (Degraded Performance)
1. **Assessment (0-10 minutes)**
   - Identify affected components
   - Measure impact scope
   - Check resource utilization

2. **Mitigation (10-30 minutes)**
   - Scale resources if needed
   - Implement temporary fixes
   - Route traffic if possible

3. **Resolution (30-60 minutes)**
   - Address root cause
   - Validate performance
   - Document lessons learned

### Disaster Recovery

#### Complete System Failure
1. **Activate DR Plan**
   - Notify stakeholders
   - Activate backup systems
   - Redirect traffic

2. **Restore Service**
   - Deploy to DR environment
   - Restore database
   - Validate functionality

3. **Recovery Validation**
   - Test all user flows
   - Verify data integrity
   - Monitor for issues

## Contact Information

### On-Call Rotation
- **Primary:** DevOps Team Lead
- **Secondary:** Senior Developer
- **Escalation:** Engineering Manager

### External Contacts
- **Supabase Support:** support@supabase.io
- **Cloud Provider:** [Your cloud provider support]
- **Security Team:** security@company.com

### Communication Channels
- **Incidents:** #incidents-ai-loan
- **Monitoring:** #monitoring-alerts
- **General:** #ai-loan-team

## Appendix

### Useful Commands

#### Docker Management
```bash
# View running containers
docker ps

# View logs
docker logs -f ai-loan-approval

# Restart service
docker restart ai-loan-approval

# Shell access
docker exec -it ai-loan-approval /bin/bash
```

#### Log Analysis
```bash
# Error analysis
grep ERROR logs/*.log | cut -d' ' -f3- | sort | uniq -c | sort -nr

# Response time analysis
grep "responseTime" logs/*.log | awk '{print $NF}' | sort -n

# User action analysis
grep "User Action" logs/*.log | cut -d':' -f3 | sort | uniq -c
```

#### Database Queries
```sql
-- Active connections
SELECT count(*) FROM pg_stat_activity;

-- Long running queries
SELECT pid, now() - pg_stat_activity.query_start AS duration, query
FROM pg_stat_activity
WHERE (now() - pg_stat_activity.query_start) > interval '5 minutes';

-- Table sizes
SELECT schemaname,tablename,pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Configuration Templates

#### Environment Template
```bash
# Copy this template and fill in values
NODE_ENV=production
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
APP_URL=
SESSION_SECRET=
LOG_LEVEL=info
ENABLE_RATE_LIMITING=true
ENABLE_AUDIT_LOGGING=true
SENTRY_DSN=
```

#### Monitoring Template
```yaml
# Example monitoring configuration
alerts:
  - name: "High Error Rate"
    condition: "error_rate > 5%"
    duration: "5m"
    severity: "critical"

  - name: "Slow Response Time"
    condition: "response_time_p95 > 2s"
    duration: "10m"
    severity: "warning"
```

---

**Document Version:** 1.0
**Last Updated:** August 25, 2025
**Next Review:** September 25, 2025
