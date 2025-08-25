```mermaid
graph TB
    subgraph "User Interface"
        User[👤 User]
        Browser[🌐 Browser]
    end

    subgraph "Next.js Application"
        UI[🎨 UI Components<br/>- Dashboard<br/>- Loan Forms<br/>- Decision Display]
        API[⚡ API Routes<br/>- /api/loans<br/>- /api/health<br/>- /api/loans/[id]/decide]
        Scorer[🤖 AI Scorer Module<br/>- Rule-based Logic<br/>- Logistic Model Option<br/>- Guardrails & Thresholds]
    end

    subgraph "Supabase Backend"
        Auth[🔐 Authentication<br/>- User Registration<br/>- Session Management<br/>- JWT Tokens]
        DB[(📊 PostgreSQL<br/>- profiles<br/>- loans<br/>- decisions<br/>- audit_logs)]
        RLS[🛡️ Row Level Security<br/>- Owner-only Access<br/>- Admin Override<br/>- Policy Enforcement]
    end

    subgraph "CI/CD Pipeline"
        Jenkins[🔧 Jenkins<br/>- Declarative Pipeline<br/>- 10 Stages<br/>- Automated Testing]
        Docker[🐳 Docker Registry<br/>- Multi-stage Build<br/>- Health Checks<br/>- Security Hardening]
        VM[🖥️ Production VM<br/>- SSH Deployment<br/>- Container Management<br/>- Health Monitoring]
    end

    subgraph "Monitoring & Operations"
        Health[❤️ Health Endpoints<br/>- System Metrics<br/>- Performance Tracking<br/>- Uptime Monitoring]
        Rollback[🔄 Rollback System<br/>- Previous Image Tags<br/>- Automated Recovery<br/>- Zero Downtime]
    end

    %% User Flow
    User --> Browser
    Browser --> UI
    UI --> API

    %% API Interactions
    API --> Auth
    API --> DB
    API --> Scorer

    %% Security Layer
    Auth --> RLS
    RLS --> DB

    %% CI/CD Flow
    Jenkins --> Docker
    Docker --> VM
    VM --> Health
    Health --> Rollback

    %% Monitoring
    VM --> Health
    API --> Health

    %% Styling
    classDef userStyle fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    classDef appStyle fill:#f3e5f5,stroke:#4a148c,stroke-width:2px
    classDef backendStyle fill:#e8f5e8,stroke:#1b5e20,stroke-width:2px
    classDef cicdStyle fill:#fff3e0,stroke:#e65100,stroke-width:2px
    classDef monitorStyle fill:#fce4ec,stroke:#880e4f,stroke-width:2px

    class User,Browser userStyle
    class UI,API,Scorer appStyle
    class Auth,DB,RLS backendStyle
    class Jenkins,Docker,VM cicdStyle
    class Health,Rollback monitorStyle
```

# AI Loan Approval System - Architecture Diagram

## System Overview
This diagram illustrates the complete architecture of the AI Loan Approval System, showing the flow from user interaction through the Next.js frontend, Supabase backend, AI scoring engine, and DevOps pipeline.

## Key Components

### Frontend Layer
- **Next.js Application**: Modern React-based frontend with server-side rendering
- **UI Components**: Dashboard, loan forms, decision display with Tailwind CSS + shadcn/ui
- **API Routes**: RESTful endpoints for loan management and AI decisions

### Backend Infrastructure
- **Supabase**: Backend-as-a-Service providing authentication and PostgreSQL database
- **Row Level Security (RLS)**: Database-level security ensuring data isolation
- **AI Scorer**: Modular decision engine with rule-based and optional ML models

### DevOps Pipeline
- **Jenkins**: 10-stage CI/CD pipeline with automated testing and deployment
- **Docker**: Containerized deployment with multi-stage builds and health checks
- **VM Deployment**: SSH-based deployment with zero-downtime container replacement

### Monitoring & Operations
- **Health Endpoints**: Comprehensive system metrics and performance tracking
- **Rollback System**: Automated recovery with previous container versions

## Data Flow
1. User interacts with Next.js UI
2. API routes handle requests with authentication
3. RLS policies enforce data access controls
4. AI scorer processes loan decisions
5. All changes are audited in the database
6. CI/CD pipeline ensures reliable deployments
7. Health monitoring enables proactive operations
