#!/usr/bin/env bash
# Health check script for AI Loan Approval System
# Phase 5: CI/CD Pipeline & Deployment

set -euo pipefail

# Configuration
HEALTH_URL="http://localhost:3000/api/health"
MAX_ATTEMPTS=20
SLEEP_INTERVAL=2

# Logging function
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [health] $1"
}

log "Starting health check for $HEALTH_URL"

# Attempt health check with retries
for attempt in $(seq 1 $MAX_ATTEMPTS); do
    log "Health check attempt $attempt/$MAX_ATTEMPTS"
    
    if curl -fsS --max-time 5 "$HEALTH_URL" >/dev/null 2>&1; then
        log "Health check passed! Service is responding"
        
        # Get and display health response
        response=$(curl -sS "$HEALTH_URL" 2>/dev/null || echo '{"error":"failed to get response"}')
        log "Health response: $response"
        
        exit 0
    fi
    
    if [ $attempt -lt $MAX_ATTEMPTS ]; then
        log "Health check failed, waiting ${SLEEP_INTERVAL}s before retry..."
        sleep $SLEEP_INTERVAL
    fi
done

log "ERROR: Health check failed after $MAX_ATTEMPTS attempts"
log "Service is not responding at $HEALTH_URL"

# Try to get container logs for debugging
if command -v docker >/dev/null 2>&1; then
    log "Recent container logs:"
    docker logs --tail 20 ai-loan-approval 2>/dev/null || log "Could not retrieve container logs"
fi

exit 1
