```mermaid
graph LR
    subgraph "Source Control"
        GIT[📝 Git Repository<br/>- Feature Branch<br/>- Main Branch<br/>- Pull Request]
        WEBHOOK[🔔 Webhook Trigger<br/>- Push to Main<br/>- PR Merge<br/>- Manual Trigger]
    end

    subgraph "CI/CD Pipeline - Jenkins"
        CHECKOUT[📥 Stage 1: Checkout<br/>- Clone Repository<br/>- Fetch Dependencies<br/>- Setup Workspace]

        SETUP[⚙️ Stage 2: Setup<br/>- Node.js Environment<br/>- Package Manager Detection<br/>- Cache Management]

        INSTALL[📦 Stage 3: Install<br/>- npm/pnpm/yarn install<br/>- Dependency Resolution<br/>- Security Audit]

        PARALLEL1{🔀 Parallel Quality Checks}
        LINT[🔍 Stage 4: Lint<br/>- ESLint Rules<br/>- Code Style Check<br/>- Format Validation]

        TYPECHECK[📋 Stage 5: Type Check<br/>- TypeScript Validation<br/>- Type Safety<br/>- Interface Compliance]

        TEST[🧪 Stage 6: Test<br/>- Unit Tests (Vitest)<br/>- Integration Tests<br/>- Coverage Reports]

        BUILD[🏗️ Stage 7: Build<br/>- Next.js Production Build<br/>- Static Generation<br/>- Bundle Optimization]

        DOCKERBUILD[🐳 Stage 8: Docker Build<br/>- Multi-stage Dockerfile<br/>- Health Check Setup<br/>- Security Hardening]

        DOCKERPUSH[📤 Stage 9: Push Image<br/>- Tag with Commit SHA<br/>- Tag as Latest<br/>- Registry Upload]

        DEPLOY[🚀 Stage 10: Deploy<br/>- SSH to VM<br/>- Container Replacement<br/>- Health Verification]
    end

    subgraph "Deployment Target"
        VM[🖥️ Production VM<br/>- Ubuntu Server<br/>- Docker Runtime<br/>- SSH Access]

        CONTAINER[📦 Application Container<br/>- Next.js App<br/>- Health Endpoints<br/>- Environment Config]

        HEALTH[❤️ Health Check<br/>- API Response<br/>- System Metrics<br/>- Readiness Probe]
    end

    subgraph "Monitoring & Recovery"
        MONITOR[📊 Monitoring<br/>- Container Status<br/>- Application Health<br/>- Performance Metrics]

        ROLLBACK[🔄 Rollback System<br/>- Previous Image Tag<br/>- Automated Recovery<br/>- Zero Downtime]

        ALERTS[🚨 Alerting<br/>- Build Failures<br/>- Deployment Issues<br/>- Health Check Failures]
    end

    subgraph "Artifacts & Registry"
        DOCKERHUB[🐳 Docker Registry<br/>- Tagged Images<br/>- Layer Caching<br/>- Version History]

        LOGS[📄 Build Logs<br/>- Pipeline Output<br/>- Test Results<br/>- Deployment Status]
    end

    %% Flow Connections
    GIT --> WEBHOOK
    WEBHOOK --> CHECKOUT
    CHECKOUT --> SETUP
    SETUP --> INSTALL
    INSTALL --> PARALLEL1

    PARALLEL1 --> LINT
    PARALLEL1 --> TYPECHECK
    PARALLEL1 --> TEST

    LINT --> BUILD
    TYPECHECK --> BUILD
    TEST --> BUILD

    BUILD --> DOCKERBUILD
    DOCKERBUILD --> DOCKERPUSH
    DOCKERPUSH --> DEPLOY

    DEPLOY --> VM
    VM --> CONTAINER
    CONTAINER --> HEALTH

    HEALTH --> MONITOR
    MONITOR --> ROLLBACK
    MONITOR --> ALERTS

    DOCKERPUSH --> DOCKERHUB
    DEPLOY --> LOGS

    %% Failure Paths
    HEALTH -.->|Health Check Fails| ROLLBACK
    DEPLOY -.->|Deployment Fails| ROLLBACK

    %% Styling
    classDef sourceStyle fill:#e3f2fd,stroke:#1565c0,stroke-width:2px
    classDef pipelineStyle fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
    classDef deployStyle fill:#e8f5e8,stroke:#2e7d32,stroke-width:2px
    classDef monitorStyle fill:#fff8e1,stroke:#f57c00,stroke-width:2px
    classDef artifactStyle fill:#fce4ec,stroke:#c2185b,stroke-width:2px

    class GIT,WEBHOOK sourceStyle
    class CHECKOUT,SETUP,INSTALL,LINT,TYPECHECK,TEST,BUILD,DOCKERBUILD,DOCKERPUSH,DEPLOY pipelineStyle
    class VM,CONTAINER,HEALTH deployStyle
    class MONITOR,ROLLBACK,ALERTS monitorStyle
    class DOCKERHUB,LOGS artifactStyle
```

# CI/CD Pipeline Architecture

## Pipeline Overview
The Jenkins-based CI/CD pipeline implements a 10-stage process for automated testing, building, and deployment of the AI Loan Approval System.

## Stage Details

### Source Control Integration
- **Git Repository**: Feature branches merged to main via pull requests
- **Webhook Triggers**: Automatic pipeline execution on code changes
- **Branch Protection**: Main branch requires PR approval and CI success

### Quality Assurance (Stages 1-6)
1. **Checkout**: Repository cloning with dependency fetching
2. **Setup**: Node.js environment with package manager detection
3. **Install**: Dependency installation with security auditing
4. **Parallel Quality Checks**:
   - **Lint**: ESLint code style and format validation
   - **Type Check**: TypeScript type safety verification
   - **Test**: Unit and integration testing with coverage

### Build & Packaging (Stages 7-8)
7. **Build**: Next.js production build with static generation
8. **Docker Build**: Multi-stage containerization with health checks

### Deployment (Stages 9-10)
9. **Docker Push**: Image tagging and registry upload
10. **Deploy**: SSH-based VM deployment with health verification

## Key Features

### Parallel Processing
- Quality checks run simultaneously for faster feedback
- Independent stage failures don't block unrelated checks
- Optimized build times with intelligent caching

### Error Handling
- Comprehensive error detection at each stage
- Automatic rollback on deployment failures
- Detailed logging for troubleshooting

### Security Integration
- Dependency vulnerability scanning
- Secrets management via environment variables
- Container security hardening

### Monitoring & Recovery
- Health check validation post-deployment
- Automatic rollback to previous stable version
- Real-time alerting on pipeline failures

## Deployment Strategy
- **Zero-Downtime**: Container replacement with health verification
- **Rollback Capability**: Previous image tags maintained for recovery
- **Environment Parity**: Consistent environments from dev to production

## Performance Optimizations
- **Docker Layer Caching**: Reduced build times
- **Dependency Caching**: npm/pnpm cache persistence
- **Parallel Execution**: Concurrent quality checks
