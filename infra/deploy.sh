#!/usr/bin/env bash
# Deploy script for AI Loan Approval System
# Phase 5: CI/CD Pipeline & Deployment

set -euo pipefail

# Configuration
IMAGE="${1:?Usage: deploy.sh <image>}"
CONTAINER_NAME="ai-loan-approval"
ENV_FILE="/etc/ai-loan-approval.env"
DATA_DIR="/var/lib/ai-loan-approval"
PORT="3000"

# Logging function
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [deploy] $1"
}

# Ensure data directory exists
mkdir -p "$DATA_DIR"

# Record current deployment attempt
echo "$IMAGE" > "$DATA_DIR/current_attempt"

log "Starting deployment of image: $IMAGE"

# Pull the latest image
log "Pulling image: $IMAGE"
docker pull "$IMAGE"

# Stop and remove existing container if it exists
log "Stopping existing container (if any)"
docker rm -f "$CONTAINER_NAME" 2>/dev/null || true

# Start new container
log "Starting new container"
docker run -d \
    --name "$CONTAINER_NAME" \
    --env-file "$ENV_FILE" \
    -p "${PORT}:3000" \
    --restart unless-stopped \
    --health-cmd="curl -f http://localhost:3000/api/health || exit 1" \
    --health-interval=30s \
    --health-timeout=10s \
    --health-retries=3 \
    "$IMAGE"

# Wait for container to be ready
log "Waiting for container to start..."
sleep 5

# Run health check
log "Running health check"
if /opt/ai-loan-approval/healthcheck.sh; then
    # Record successful deployment
    echo "$IMAGE" > "$DATA_DIR/last_successful"
    log "Deployment successful! Container is healthy and responding"

    # Show container status
    docker ps --filter "name=$CONTAINER_NAME" --format "table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}"

    exit 0
else
    log "Health check failed! Rolling back to previous version"

    # Attempt rollback
    if /opt/ai-loan-approval/rollback.sh; then
        log "Rollback completed successfully"
    else
        log "Rollback failed! Manual intervention required"
    fi

    exit 1
fi
