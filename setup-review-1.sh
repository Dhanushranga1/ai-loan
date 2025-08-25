#!/bin/bash

# 🏦 AI Loan Approval - Review 1 Setup Script
# Prepares everything for the CI/CD pipeline demonstration

echo "🏦 AI Loan Approval System - Review 1 Setup"
echo "============================================"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}📋 Checking prerequisites...${NC}"

# Check Node.js
if command -v node >/dev/null 2>&1; then
    echo "✅ Node.js: $(node --version)"
else
    echo "❌ Node.js not found"
    exit 1
fi

# Check npm
if command -v npm >/dev/null 2>&1; then
    echo "✅ npm: $(npm --version)"
else
    echo "❌ npm not found"
    exit 1
fi

# Check Git
if command -v git >/dev/null 2>&1; then
    echo "✅ Git: $(git --version)"
else
    echo "❌ Git not found"
    exit 1
fi

echo ""
echo -e "${BLUE}📦 Installing dependencies...${NC}"
if npm install --silent; then
    echo "✅ Dependencies installed"
else
    echo "⚠️  Some dependencies might have issues (continuing...)"
fi

echo ""
echo -e "${BLUE}🔧 Setting up demo files...${NC}"

# Make scripts executable
chmod +x ci-pipeline-demo.sh
echo "✅ Demo script is executable"

# Check if we have the CI/CD workflow
if [ -f ".github/workflows/ci-cd.yml" ]; then
    echo "✅ GitHub Actions workflow ready"
else
    echo "❌ GitHub Actions workflow missing"
fi

# Check if we have the presentation guide
if [ -f "REVIEW-1-PRESENTATION.md" ]; then
    echo "✅ Presentation guide ready"
else
    echo "❌ Presentation guide missing"
fi

echo ""
echo -e "${GREEN}🎉 Setup Complete!${NC}"
echo ""
echo "📋 For your Review 1 presentation, you have:"
echo ""
echo "1. 🖥️  CI/CD Pipeline Demo:"
echo "   Run: ./ci-pipeline-demo.sh"
echo ""
echo "2. 📊 GitHub Actions Workflow:"
echo "   File: .github/workflows/ci-cd.yml"
echo ""
echo "3. 📖 Presentation Guide:"
echo "   File: REVIEW-1-PRESENTATION.md"
echo ""
echo "4. 🏗️  Jenkins Pipeline:"
echo "   File: Jenkinsfile"
echo ""
echo -e "${YELLOW}💡 Quick Demo Commands:${NC}"
echo "   ./ci-pipeline-demo.sh          # Full pipeline demo"
echo "   cat REVIEW-1-PRESENTATION.md   # Presentation outline"
echo "   code .github/workflows/ci-cd.yml # GitHub Actions workflow"
echo ""
echo -e "${GREEN}🚀 You're ready for tomorrow's review! Good luck! 🎉${NC}"
