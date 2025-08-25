#!/usr/bin/env bash
# Rollback script for AI Loan Approval System
# Phase 5: CI/CD Pipeline & Deployment

set -euo pipefail

# Configuration
CONTAINER_NAME="ai-loan-approval"
ENV_FILE="/etc/ai-loan-approval.env"
DATA_DIR="/var/lib/ai-loan-approval"
PORT="3000"

# Logging function
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [rollback] $1"
}

log "Starting rollback process"

# Check if we have a previous successful deployment recorded
if [ ! -f "$DATA_DIR/last_successful" ]; then
    log "ERROR: No previous successful deployment found"
    log "Cannot rollback without a known good image"
    exit 1
fi

PREVIOUS_IMAGE=$(cat "$DATA_DIR/last_successful")

if [ -z "$PREVIOUS_IMAGE" ]; then
    log "ERROR: Previous image record is empty"
    exit 1
fi

log "Rolling back to previous image: $PREVIOUS_IMAGE"

# Stop current container
log "Stopping current container"
docker rm -f "$CONTAINER_NAME" 2>/dev/null || true

# Start previous container
log "Starting previous container"
docker run -d \
    --name "$CONTAINER_NAME" \
    --env-file "$ENV_FILE" \
    -p "${PORT}:3000" \
    --restart unless-stopped \
    --health-cmd="curl -f http://localhost:3000/api/health || exit 1" \
    --health-interval=30s \
    --health-timeout=10s \
    --health-retries=3 \
    "$PREVIOUS_IMAGE"

# Wait for container to start
log "Waiting for container to start..."
sleep 5

# Run health check
log "Running health check on rolled back container"
if /opt/ai-loan-approval/healthcheck.sh; then
    log "Rollback successful! Previous version is healthy and responding"
    
    # Show container status
    docker ps --filter "name=$CONTAINER_NAME" --format "table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}"
    
    exit 0
else
    log "ERROR: Rollback failed! Previous version is also unhealthy"
    log "Manual intervention required - check logs with: docker logs $CONTAINER_NAME"
    exit 1
fi
