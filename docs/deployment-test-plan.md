# Main Branch Deployment Test - Phase 5 Task 8

## 🎯 Test Objective
Validate the complete Jenkins CI/CD pipeline for main branch deployments, including Docker image creation, registry push, and VM deployment.

## 📋 Test Scenario

### Production Deployment Simulation
This test simulates a real production deployment by:
1. Creating a production-ready feature
2. Triggering the full Jenkins pipeline
3. Testing Docker image build and push
4. Validating VM deployment process
5. Verifying health checks and application availability

## 🚀 Deployment Test Features

### Feature: Enhanced Production Monitoring
Added production-ready monitoring capabilities to the health endpoint and application layout.

### Changes Made:
1. **Enhanced Health Endpoint**: Added more comprehensive system information
2. **Production Layout**: Added deployment information for better tracking
3. **Version Management**: Improved version handling in production environment

## 📊 Expected Pipeline Execution

### Full CI/CD Pipeline (Main Branch)
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   GitHub Push   │ -> │ Jenkins Trigger │ -> │  Full Pipeline  │
│   (main branch) │    │   (webhook)     │    │  (all stages)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

#### Stage Execution Plan:
1. **Checkout** ✅ - Retrieve source from main branch
2. **Setup** ✅ - Node.js 20 + package manager detection
3. **Install** ✅ - Dependencies with cache optimization
4. **Lint** ✅ - ESLint code quality validation
5. **TypeCheck** ✅ - TypeScript compilation check
6. **Test** ✅ - Vitest test suite execution
7. **Build** ✅ - Next.js production build
8. **Docker Build** ✅ - Multi-stage container creation
9. **Docker Push** ✅ - Push to Docker Hub registry
10. **Deploy** ✅ - SSH deployment to production VM

## 🔄 Deployment Process Validation

### Docker Operations
```bash
# Image build with version tag
docker build -t username/ai-loan-approval:latest .
docker build -t username/ai-loan-approval:v1.0.0-${BUILD_NUMBER} .

# Registry push
docker push username/ai-loan-approval:latest
docker push username/ai-loan-approval:v1.0.0-${BUILD_NUMBER}
```

### VM Deployment Process
```bash
# SSH to production VM
ssh ubuntu@vm-ip "cd /opt/ai-loan-approval && ./deploy.sh latest"

# Deployment script execution:
# 1. Pull latest image
# 2. Stop current container
# 3. Start new container with health check
# 4. Verify application health
# 5. Update last successful deployment
```

### Health Check Validation
```bash
# Application health verification
curl http://vm-ip:3000/api/health

# Expected response:
{
  "ok": true,
  "timestamp": "2025-08-25T...",
  "service": "ai-loan-approval",
  "version": "1.0.0",
  "environment": "production",
  "uptime": "...",
  "build": "v1.0.0-123"
}
```

## 🧪 Testing Environment

### Local Testing Commands
Before production deployment, validate locally:

```bash
# 1. Build and test locally
npm run build
npm run test

# 2. Docker build test
docker build -t ai-loan-approval:test .

# 3. Container health test
docker run -d --name test-deploy -p 3000:3000 ai-loan-approval:test
curl http://localhost:3000/api/health
docker logs test-deploy

# 4. Cleanup
docker rm -f test-deploy
docker rmi ai-loan-approval:test
```

## 📈 Success Criteria

### ✅ Deployment Success Indicators
- **Pipeline Status**: All 10 stages successful
- **Build Time**: Under 15 minutes
- **Docker Push**: Images uploaded to registry
- **VM Deployment**: Container running on production VM
- **Health Check**: Application responding correctly
- **Zero Downtime**: Seamless container replacement

### 📊 Key Metrics
- **Total Pipeline Duration**: ~12-15 minutes
- **Docker Build Time**: ~5-7 minutes
- **Deployment Time**: ~2-3 minutes
- **Health Check Response**: < 2 seconds
- **Application Startup**: < 30 seconds

## 🔍 Validation Steps

### 1. Pre-Deployment Validation
```bash
# Code quality checks
npm run lint
npm run type-check
npm test

# Build verification
npm run build
ls -la .next/standalone/
```

### 2. Docker Validation
```bash
# Container build test
docker build -t ai-loan-approval:validate .

# Security scan (optional)
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
  -v $PWD:/src quay.io/microscanner/microscanner:latest \
  ai-loan-approval:validate
```

### 3. Deployment Validation
```bash
# SSH connectivity test
ssh ubuntu@vm-ip "echo 'SSH connection successful'"

# Deployment script test
ssh ubuntu@vm-ip "cd /opt/ai-loan-approval && ./healthcheck.sh"

# Post-deployment verification
curl http://vm-ip:3000/api/health
curl http://vm-ip:3000/
```

## 🎯 Task 8 Deliverables

### ✅ Expected Outputs
1. **Production-Ready Code**: Enhanced features for deployment
2. **Deployment Logs**: Complete Jenkins pipeline execution
3. **Docker Images**: Tagged images in registry
4. **Live Application**: Running on production VM
5. **Health Verification**: Confirmed application health
6. **Documentation**: Complete deployment process record

---

**Test Date**: August 25, 2025
**Deployment Target**: Production VM
**Pipeline**: Jenkins CI/CD
**Expected Duration**: 15 minutes
**Status**: Ready for execution
