```mermaid
erDiagram
    profiles {
        uuid id PK "auth.uid"
        text email "from auth.users"
        text full_name
        text role "user|admin"
        timestamp created_at
        timestamp updated_at
    }

    loans {
        uuid id PK
        uuid user_id FK "references profiles(id)"
        text status "pending|approved|rejected|under_review"
        decimal amount "loan amount requested"
        integer term_months "loan term in months"
        decimal annual_income "borrower annual income"
        integer credit_score "credit score 300-850"
        decimal debt_to_income_ratio "DTI ratio"
        decimal employment_years "years of employment"
        text purpose "loan purpose"
        text input_hash "for decision idempotency"
        timestamp created_at
        timestamp updated_at
    }

    decisions {
        uuid id PK
        uuid loan_id FK "references loans(id)"
        text status "approved|rejected|under_review"
        decimal score "calculated score 0-1"
        json reasons "array of explanation strings"
        text model_used "rule_based|logistic"
        text input_hash "matches loan.input_hash"
        decimal confidence "model confidence"
        timestamp created_at
        timestamp updated_at
    }

    audit_logs {
        uuid id PK
        uuid user_id FK "references profiles(id)"
        uuid loan_id FK "references loans(id), nullable"
        uuid decision_id FK "references decisions(id), nullable"
        text action "loan_created|decision_made|status_updated"
        json metadata "additional context data"
        text ip_address "request IP"
        text user_agent "browser info"
        timestamp created_at
    }

    %% Relationships
    profiles ||--o{ loans : "owns"
    profiles ||--o{ audit_logs : "performs"
    loans ||--o| decisions : "has"
    loans ||--o{ audit_logs : "tracked_in"
    decisions ||--o{ audit_logs : "tracked_in"

    %% RLS Policies Indicators
    profiles {
        rls_policy owner_access "users see own profile"
        rls_policy admin_access "admins see all profiles"
    }

    loans {
        rls_policy owner_access "users see own loans"
        rls_policy admin_access "admins see all loans"
    }

    decisions {
        rls_policy owner_access "users see own decisions"
        rls_policy admin_access "admins see all decisions"
    }

    audit_logs {
        rls_policy owner_access "users see own actions"
        rls_policy admin_access "admins see all actions"
    }
```

# Database Entity Relationship Diagram (ERD)

## Schema Overview
The AI Loan Approval System uses a PostgreSQL database hosted on Supabase with comprehensive Row Level Security (RLS) policies.

## Core Entities

### profiles
- **Purpose**: User management with role-based access
- **Key Features**: Links to Supabase auth.users, supports admin roles
- **RLS**: Users access own profile, admins access all

### loans
- **Purpose**: Loan application data and status tracking
- **Key Features**: Complete borrower information, status workflow
- **RLS**: Owner-only access with admin override
- **Relationships**: Belongs to user, has one decision

### decisions
- **Purpose**: AI scoring results and explanations
- **Key Features**: Score, reasons, model tracking, confidence
- **RLS**: Tied to loan ownership via foreign key
- **Relationships**: Belongs to loan, tracked in audit logs

### audit_logs
- **Purpose**: Complete action tracking for compliance
- **Key Features**: User actions, IP tracking, metadata
- **RLS**: Users see own actions, admins see all
- **Relationships**: Links to users, loans, and decisions

## Security Model

### Row Level Security (RLS)
- **Owner Access**: `user_id = auth.uid()` for user data isolation
- **Admin Access**: `profiles.role = 'admin'` for administrative override
- **Audit Trail**: All actions logged with user context
- **Data Isolation**: No cross-user data leakage possible

### Indexes & Performance
- Primary keys on all entities (UUID)
- Foreign key indexes for relationships
- Compound indexes on frequently queried fields
- Input hash for decision idempotency

## Business Rules
- One decision per loan (1:1 relationship)
- All actions audited (comprehensive logging)
- Soft deletes via status fields
- Immutable decision records
- Time-based decision intervals
