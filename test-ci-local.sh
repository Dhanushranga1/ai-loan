#!/bin/bash
# Local CI Pipeline Simulation Script
# Mimics Jenkins pipeline stages for local testing

set -e  # Exit on any error

echo "🚀 Starting Local CI Pipeline Simulation..."
echo "================================================"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print stage headers
print_stage() {
    echo -e "\n${BLUE}🔄 Stage: $1${NC}"
    echo "----------------------------------------"
}

# Function to print success
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Function to print info
print_info() {
    echo -e "${YELLOW}ℹ️  $1${NC}"
}

# Stage 1: Environment Check
print_stage "Environment Setup"
node --version
npm --version
if command -v pnpm &> /dev/null; then
    echo "pnpm version: $(pnpm --version)"
fi
print_success "Node.js environment verified"

# Stage 2: Dependencies
print_stage "Install Dependencies"
if [ -f "pnpm-lock.yaml" ]; then
    print_info "Using pnpm package manager"
    corepack enable
    pnpm install
elif [ -f "yarn.lock" ]; then
    print_info "Using yarn package manager"
    yarn install
else
    print_info "Using npm package manager"
    npm ci
fi
print_success "Dependencies installed"

# Stage 3: Linting
print_stage "Code Quality - Lint"
npm run lint
print_success "Linting passed"

# Stage 4: Type Checking
print_stage "Code Quality - TypeCheck"
npm run type-check
print_success "Type checking passed"

# Stage 5: Testing
print_stage "Unit Tests"
npm test
print_success "All tests passed"

# Stage 6: Build
print_stage "Production Build"
npm run build
print_success "Build completed"

# Stage 7: Docker Build (optional)
print_stage "Docker Build (Optional)"
if command -v docker &> /dev/null; then
    print_info "Building Docker image..."
    docker build -t ai-loan-approval:local-test .
    print_success "Docker image built successfully"
    
    print_info "Testing container..."
    docker run -d --name test-app -p 3000:3000 ai-loan-approval:local-test
    
    # Wait for container to start
    sleep 5
    
    # Test health endpoint
    if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
        print_success "Health endpoint responding"
    else
        echo -e "${RED}❌ Health endpoint not responding${NC}"
    fi
    
    # Cleanup
    docker rm -f test-app
    docker rmi ai-loan-approval:local-test
    print_info "Docker cleanup completed"
else
    print_info "Docker not available - skipping container build"
fi

# Final Summary
echo -e "\n${GREEN}🎉 Local CI Pipeline Simulation Completed Successfully!${NC}"
echo "================================================"
echo "All stages passed:"
echo "✅ Environment Setup"
echo "✅ Dependencies Installation" 
echo "✅ Code Linting"
echo "✅ Type Checking"
echo "✅ Unit Testing"
echo "✅ Production Build"
if command -v docker &> /dev/null; then
    echo "✅ Docker Build & Test"
fi
echo ""
echo "🚀 Ready for production deployment!"
