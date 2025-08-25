# Jenkins and VM Setup Guide

## 📋 Prerequisites

Before proceeding with the CI/CD setup, ensure you have:

1. **Jenkins Server**: Running Jenkins with Docker support
2. **Target VM**: Ubuntu/Debian server with Docker installed
3. **Docker Hub Account**: For image registry
4. **GitHub Repository**: With webhook capability

---

## 🔧 Jenkins Setup

### 1. Install Required Plugins

Install these Jenkins plugins via **Manage Jenkins > Manage Plugins**:

- **Pipeline** (for Jenkinsfile support)
- **Git** (for source control)
- **Docker Pipeline** (for Docker commands)
- **SSH Agent** (for deployment)
- **Credentials Binding** (for secrets management)
- **JUnit** (for test reports)
- **Build Timeout** (for pipeline timeouts)

### 2. Create Jenkins Credentials

Navigate to **Manage Jenkins > Manage Credentials > System > Global credentials**:

#### a) Docker Hub Credentials
- **Kind**: Username with password
- **ID**: `dockerhub-creds`
- **Username**: Your Docker Hub username
- **Password**: Your Docker Hub password or access token
- **Description**: Docker Hub credentials for image push

#### b) VM SSH Key
- **Kind**: SSH Username with private key
- **ID**: `vm-ssh-key`
- **Username**: `ubuntu` (or your VM user)
- **Private Key**: Your SSH private key for VM access
- **Description**: SSH key for production VM deployment

#### c) GitHub Credentials (if private repo)
- **Kind**: Username with password or Personal Access Token
- **ID**: `github-creds`
- **Username**: Your GitHub username
- **Password**: GitHub Personal Access Token
- **Description**: GitHub access for private repositories

### 3. Create Jenkins Pipeline Job

1. **New Item** > **Pipeline** > Enter name: `ai-loan-approval`

2. **Pipeline Configuration**:
   - **Definition**: Pipeline script from SCM
   - **SCM**: Git
   - **Repository URL**: Your GitHub repository URL
   - **Credentials**: Select `github-creds` if private repo
   - **Branch Specifier**: `*/main` or `*/master`
   - **Script Path**: `Jenkinsfile`

3. **Build Triggers**:
   - ☑️ **GitHub hook trigger for GITScm polling**
   - ☑️ **Poll SCM**: `H/5 * * * *` (every 5 minutes as fallback)

4. **Pipeline Syntax**:
   - ☑️ **Use Groovy Sandbox**

### 4. Configure GitHub Webhook

1. Go to your GitHub repository
2. **Settings > Webhooks > Add webhook**
3. **Payload URL**: `http://your-jenkins-server:8080/github-webhook/`
4. **Content type**: `application/json`
5. **Events**: Send me everything or select:
   - Push events
   - Pull request events
6. **Active**: ☑️ Checked

### 5. Update Jenkinsfile Variables

Edit the Jenkinsfile and update these variables:

```groovy
environment {
    REGISTRY_USER = 'your-dockerhub-username'  // Replace with your Docker Hub username
    VM_HOST = 'your-vm-ip'                     // Replace with your VM IP address
    VM_USER = 'ubuntu'                         // Replace with your VM username
}
```

---

## 🖥️ VM Setup

### 1. Initial Server Setup

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install essential packages
sudo apt install -y curl wget git htop unzip

# Create deployment user (if not using ubuntu)
sudo useradd -m -s /bin/bash deployer
sudo usermod -aG sudo deployer
```

### 2. Install Docker

```bash
# Install Docker using the convenience script
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group
sudo usermod -aG docker $USER
sudo usermod -aG docker ubuntu  # if using ubuntu user

# Start and enable Docker
sudo systemctl enable docker
sudo systemctl start docker

# Verify Docker installation
docker --version
docker run hello-world
```

### 3. Create Directory Structure

```bash
# Create application directories
sudo mkdir -p /opt/ai-loan-approval
sudo mkdir -p /var/lib/ai-loan-approval

# Create logs directory
sudo mkdir -p /var/log/ai-loan-approval

# Set permissions
sudo chown -R root:root /opt/ai-loan-approval
sudo chown -R ubuntu:ubuntu /var/lib/ai-loan-approval
sudo chown -R ubuntu:ubuntu /var/log/ai-loan-approval
```

### 4. Copy Deployment Scripts

From your local repository, copy the scripts to the VM:

```bash
# Copy scripts to VM (run from your local machine)
scp -r infra/*.sh ubuntu@your-vm-ip:/tmp/

# On the VM, move scripts to proper location
sudo mv /tmp/*.sh /opt/ai-loan-approval/
sudo chmod +x /opt/ai-loan-approval/*.sh
sudo chown root:root /opt/ai-loan-approval/*.sh
```

### 5. Create Environment File

Create the production environment file:

```bash
sudo tee /etc/ai-loan-approval.env > /dev/null <<'EOF'
# Next.js Public Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# AI Model Configuration
AI_MODEL=rule_based
DECISION_THRESHOLDS_JSON={"approve":0.70,"review":0.55}
DECISION_MIN_DECISION_INTERVAL_SEC=60

# Runtime Configuration
NODE_ENV=production
PORT=3000
HOSTNAME=0.0.0.0
NEXT_TELEMETRY_DISABLED=1
EOF
```

**Secure the environment file**:
```bash
sudo chmod 600 /etc/ai-loan-approval.env
sudo chown root:root /etc/ai-loan-approval.env
```

### 6. Configure Firewall

```bash
# Configure UFW firewall
sudo ufw --force reset
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Allow SSH (adjust port if not 22)
sudo ufw allow 22/tcp

# Allow application port
sudo ufw allow 3000/tcp

# Allow HTTP/HTTPS if using reverse proxy later
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw --force enable

# Check status
sudo ufw status
```

### 7. Setup SSH Key Access

On your local machine (or Jenkins server):

```bash
# Generate SSH key pair if you don't have one
ssh-keygen -t rsa -b 4096 -C "jenkins@your-domain.com"

# Copy public key to VM
ssh-copy-id ubuntu@your-vm-ip

# Test SSH access
ssh ubuntu@your-vm-ip "echo 'SSH access working'"
```

### 8. Test Deployment Scripts

```bash
# Test health check script
/opt/ai-loan-approval/healthcheck.sh

# Expected output: Health check should fail (no container running yet)
```

---

## 🧪 Testing the Setup

### 1. Test Docker Image Build Locally

```bash
# On your development machine
cd /path/to/ai-loan-approval
docker build -t ai-loan-approval:test .

# Test the built image
docker run -d --name test-app -p 3000:3000 ai-loan-approval:test

# Test health endpoint
curl http://localhost:3000/api/health

# Cleanup
docker rm -f test-app
docker rmi ai-loan-approval:test
```

### 2. Test Jenkins Pipeline

1. **Create a test branch**:
   ```bash
   git checkout -b test-ci-setup
   echo "Test CI setup" > test-file.txt
   git add test-file.txt
   git commit -m "test: trigger CI pipeline"
   git push origin test-ci-setup
   ```

2. **Create Pull Request** and verify:
   - Jenkins triggers automatically
   - All stages pass except deployment (PR branch)
   - Test results are published
   - Build artifacts are archived

3. **Merge to main** and verify:
   - Full pipeline runs including deployment
   - Docker image is built and pushed
   - Application is deployed to VM
   - Health checks pass

### 3. Test Rollback

```bash
# On the VM, test rollback functionality
sudo /opt/ai-loan-approval/rollback.sh

# Should show message about no previous version if this is first deployment
```

---

## 📊 Monitoring and Verification

### 1. Pipeline Monitoring

Monitor these aspects of your Jenkins pipeline:

- **Build Duration**: Should complete in under 15 minutes
- **Test Success Rate**: Aim for 100% passing tests
- **Docker Build Time**: Monitor for increases indicating dependency bloat
- **Deployment Success**: Track successful vs failed deployments

### 2. Application Monitoring

Set up basic monitoring:

```bash
# Create monitoring script
sudo tee /opt/ai-loan-approval/monitor.sh > /dev/null <<'EOF'
#!/bin/bash
echo "=== Application Status ==="
docker ps --filter "name=ai-loan-approval" --format "table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}"

echo "=== Health Check ==="
curl -s http://localhost:3000/api/health | jq .

echo "=== Container Logs (last 10 lines) ==="
docker logs --tail 10 ai-loan-approval

echo "=== System Resources ==="
free -h
df -h /var/lib/docker
EOF

sudo chmod +x /opt/ai-loan-approval/monitor.sh
```

### 3. Log Rotation

Set up log rotation for Docker containers:

```bash
# Create Docker daemon configuration
sudo tee /etc/docker/daemon.json > /dev/null <<'EOF'
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
EOF

# Restart Docker to apply changes
sudo systemctl restart docker
```

---

## 🔐 Security Considerations

### 1. Secrets Management
- Never commit credentials to version control
- Use Jenkins credentials store for all secrets
- Rotate credentials regularly
- Use least-privilege access for all accounts

### 2. Network Security
- Configure firewall to allow only necessary ports
- Use SSH key authentication, disable password auth
- Consider VPN for Jenkins to VM communication
- Regular security updates on all systems

### 3. Access Control
- Limit Jenkins admin access
- Use separate deployment user on VM
- Regular audit of user permissions
- Enable Jenkins security realm

---

## 📝 Troubleshooting Common Issues

### Jenkins Pipeline Issues

**Problem**: Pipeline fails with "permission denied" on Docker commands
**Solution**:
```bash
# Add Jenkins user to docker group
sudo usermod -aG docker jenkins
sudo systemctl restart jenkins
```

**Problem**: SSH connection fails to VM
**Solution**:
```bash
# Check SSH key in Jenkins credentials
# Verify VM firewall allows SSH
# Test manual SSH connection
ssh -i /path/to/key ubuntu@vm-ip
```

### VM Deployment Issues

**Problem**: Container fails to start
**Solution**:
```bash
# Check environment file
sudo cat /etc/ai-loan-approval.env

# Check Docker logs
docker logs ai-loan-approval

# Check port availability
sudo netstat -tlnp | grep :3000
```

**Problem**: Health check fails
**Solution**:
```bash
# Check if application is responding
curl -v http://localhost:3000/api/health

# Check container status
docker ps

# Check application logs
docker logs --tail 50 ai-loan-approval
```

This setup provides a robust CI/CD pipeline for the AI Loan Approval System with proper monitoring, security, and troubleshooting procedures.
