# Infrastructure Scripts for AI Loan Approval System

This directory contains deployment and operational scripts for the AI Loan Approval System.

## Scripts Overview

### `deploy.sh`
**Purpose**: Deploy a new Docker image to the production VM.

**Usage**:
```bash
sudo /opt/ai-loan-approval/deploy.sh <image-tag>
```

**Example**:
```bash
sudo /opt/ai-loan-approval/deploy.sh docker.io/youruser/ai-loan-approval:abc1234
```

**What it does**:
1. Pulls the specified Docker image
2. Stops the existing container
3. Starts a new container with the new image
4. Runs health checks
5. Records successful deployment or rolls back on failure

### `rollback.sh`
**Purpose**: Rollback to the previous successfully deployed version.

**Usage**:
```bash
sudo /opt/ai-loan-approval/rollback.sh
```

**What it does**:
1. Reads the last successful deployment from `/var/lib/ai-loan-approval/last_successful`
2. Stops the current container
3. Starts the previous version
4. Runs health checks

### `healthcheck.sh`
**Purpose**: Check if the application is healthy and responding.

**Usage**:
```bash
/opt/ai-loan-approval/healthcheck.sh
```

**What it does**:
1. Makes HTTP requests to `/api/health` endpoint
2. Retries up to 20 times with 2-second intervals
3. Returns exit code 0 for success, 1 for failure

## VM Setup Instructions

### 1. Install Docker
```bash
# Update package list
sudo apt update

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group
sudo usermod -aG docker $USER

# Start Docker service
sudo systemctl enable docker
sudo systemctl start docker
```

### 2. Create Directory Structure
```bash
# Create deployment directory
sudo mkdir -p /opt/ai-loan-approval
sudo mkdir -p /var/lib/ai-loan-approval

# Copy scripts to /opt/ai-loan-approval/
sudo cp infra/*.sh /opt/ai-loan-approval/

# Make scripts executable
sudo chmod +x /opt/ai-loan-approval/*.sh

# Set ownership
sudo chown -R root:root /opt/ai-loan-approval/
```

### 3. Create Environment File
Create `/etc/ai-loan-approval.env` with production environment variables:

```bash
sudo tee /etc/ai-loan-approval.env > /dev/null <<EOF
# Next.js Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# AI Configuration
AI_MODEL=rule_based
DECISION_THRESHOLDS_JSON={"approve":0.70,"review":0.55}
DECISION_MIN_DECISION_INTERVAL_SEC=60

# Runtime Configuration
NODE_ENV=production
PORT=3000
HOSTNAME=0.0.0.0
EOF
```

**Important**: Secure the environment file:
```bash
sudo chmod 600 /etc/ai-loan-approval.env
sudo chown root:root /etc/ai-loan-approval.env
```

### 4. Configure Firewall
```bash
# Allow SSH and application port
sudo ufw allow 22/tcp
sudo ufw allow 3000/tcp
sudo ufw --force enable
```

## Container Management

### View Running Containers
```bash
docker ps --filter "name=ai-loan-approval"
```

### View Container Logs
```bash
docker logs -f ai-loan-approval
```

### View Recent Logs
```bash
docker logs --tail 50 ai-loan-approval
```

### Restart Container
```bash
docker restart ai-loan-approval
```

### Stop Container
```bash
docker stop ai-loan-approval
```

## Monitoring and Maintenance

### Check Application Health
```bash
curl http://localhost:3000/api/health
```

### Check Deployment History
```bash
# View current deployment
cat /var/lib/ai-loan-approval/current_attempt

# View last successful deployment
cat /var/lib/ai-loan-approval/last_successful
```

### Clean Up Old Images
```bash
# Remove unused images (run weekly)
docker system prune -f

# Remove old ai-loan-approval images (keep last 3)
docker images docker.io/youruser/ai-loan-approval --format "table {{.Repository}}:{{.Tag}}\t{{.CreatedAt}}" | tail -n +4 | awk '{print $1}' | xargs -r docker rmi
```

### Disk Usage Monitoring
```bash
# Check Docker disk usage
docker system df

# Check container logs size
docker logs ai-loan-approval 2>&1 | wc -c
```

## Troubleshooting

### Container Won't Start
1. Check environment file: `sudo cat /etc/ai-loan-approval.env`
2. Check Docker logs: `docker logs ai-loan-approval`
3. Check port availability: `sudo netstat -tlnp | grep :3000`
4. Check image exists: `docker images | grep ai-loan-approval`

### Health Check Failing
1. Check if container is running: `docker ps | grep ai-loan-approval`
2. Check application logs: `docker logs --tail 100 ai-loan-approval`
3. Test health endpoint manually: `curl -v http://localhost:3000/api/health`
4. Check if port is accessible: `telnet localhost 3000`

### Rollback Issues
1. Verify last successful image exists: `cat /var/lib/ai-loan-approval/last_successful`
2. Check if image is available: `docker images | grep <last_successful_tag>`
3. Pull image if missing: `docker pull <last_successful_tag>`

### Performance Issues
1. Check container resource usage: `docker stats ai-loan-approval`
2. Check system resources: `htop` or `top`
3. Check disk space: `df -h`
4. Check memory: `free -h`

## Security Notes

- All scripts run with appropriate permissions (root for deployment, user for health checks)
- Environment file is secured with 600 permissions
- No sensitive credentials are logged
- Firewall configured to allow only necessary ports
- Regular image cleanup prevents disk space issues

## Backup and Recovery

### Backup Environment Configuration
```bash
sudo cp /etc/ai-loan-approval.env /etc/ai-loan-approval.env.backup.$(date +%Y%m%d)
```

### Emergency Recovery
If all else fails:
```bash
# Stop everything
docker rm -f ai-loan-approval

# Pull latest known good image
docker pull docker.io/youruser/ai-loan-approval:latest

# Start with latest
sudo /opt/ai-loan-approval/deploy.sh docker.io/youruser/ai-loan-approval:latest
```
