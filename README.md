# 🏦 AI Loan Approval System

## Abstract

The AI Loan Approval System is a modern, full-stack web application that automates loan approval decisions using transparent AI scoring. Built with Next.js, Supabase, and deployed through a Jenkins CI/CD pipeline with Docker containerization.

## 🎯 Features

- **🤖 AI-Powered Decisions**: Transparent rule-based scoring with explainable AI
- **📊 Smart Analytics**: Real-time loan scoring with detailed explanations
- **🔐 Secure Authentication**: Supabase-powered auth with role-based access
- **📝 Loan Management**: Complete application lifecycle from submission to decision
- **👨‍💼 Admin Dashboard**: Administrative oversight for loan officers
- **💰 EMI Calculator**: Real-time payment calculations as users input data
- **📈 Decision History**: Complete audit trail for compliance and transparency
- **🎨 Modern UI**: Clean, responsive design with shadcn/ui components
- **⚡ Real-time Updates**: Live decision processing with instant feedback
- **🔍 Transparent Scoring**: See exactly how decisions are made

## 🛠 Tech Stack

### Frontend & Backend
- **Next.js 14** (App Router, TypeScript)
- **Tailwind CSS** + **shadcn/ui** components
- **Inter Font** (Google Fonts)

### Database & Authentication
- **Supabase** (PostgreSQL + Auth)
- **Row Level Security (RLS)** for data protection

### AI & Scoring
- **🧠 Rule-based Scoring Engine** - Transparent weights and thresholds
- **📋 Explainable AI** - 3-6 concrete reasons for every decision  
- **🔄 Idempotency System** - Consistent decisions for identical inputs
- **⚖️ Configurable Thresholds** - Customizable approve/review/reject limits
- **📊 Feature Engineering** - EMI calculation, DTI analysis, risk assessment
- **🔍 Decision Audit Trail** - Complete history for compliance

### DevOps & Infrastructure
- **Docker** containerization
- **Jenkins** CI/CD pipeline
- **Git** version control
- **VM Deployment** with automated scripts

## 🏗 Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Next.js App   │────│   Supabase DB   │    │  Jenkins CI/CD  │
│                 │    │                 │    │                 │
│ • Auth Pages    │    │ • Users         │    │ • Build         │
│ • Loan Forms    │    │ • Loans         │    │ • Test          │
│ • Dashboard     │    │ • Decisions     │    │ • Deploy        │
│ • Admin Panel   │    │ • Audit Logs    │    │ • Docker        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │  AI Scoring     │
                    │                 │
                    │ • Rule Engine   │
                    │ • ML Models     │
                    │ • Explanations  │
                    └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- **Node.js 20+**
- **pnpm** (package manager)
- **Docker** (for containerization)
- **Supabase account** (free tier)

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd ai-loan-approval
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your Supabase credentials
   ```

4. **Set up Supabase**

   a. **Create a new Supabase project**
   - Go to [https://supabase.com](https://supabase.com)
   - Click "New Project"
   - Choose your organization and create the project
   - Wait for the project to initialize

   b. **Get your project credentials**
   - Go to Settings > API
   - Copy the Project URL and anon/public API key
   - Copy the service_role key (keep this secure!)

   c. **Configure environment variables**
   ```bash
   # Update .env.local with your actual Supabase credentials
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

   d. **Run database migrations**
   - Go to Supabase Dashboard > SQL Editor
   - Copy and run the SQL from `/supabase/migrations.sql`
   - This will create all tables, RLS policies, and triggers

   e. **Configure authentication**
   - Go to Authentication > Settings
   - Enable email authentication
   - Optionally configure OAuth providers
   - Set up email templates as needed

5. **Run the development server**
   ```bash
   pnpm dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:3000`

### Environment Variables

Create a `.env.local` file with:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# AI Configuration
AI_MODEL=rule_based
DECISION_THRESHOLDS_JSON='{"approve":0.70,"review":0.55}'
DECISION_MIN_DECISION_INTERVAL_SEC=60

# Environment
NODE_ENV=development
PORT=3000
```

## 🤖 AI Scoring System

### Decision Engine
The system uses a transparent rule-based scoring engine that evaluates loan applications based on weighted criteria:

| Factor | Weight | Description |
|--------|---------|-------------|
| **Credit Score** | 35% | Primary creditworthiness indicator |
| **Debt-to-Income** | 25% | Existing debt burden assessment |
| **EMI Ratio** | 25% | Payment affordability check |
| **Employment Years** | 10% | Income stability factor |
| **Amount vs Income** | 5% | Loan size appropriateness |

### Decision Thresholds
- **Approve**: Score ≥ 70% (automatic approval)
- **Review**: Score ≥ 55% (manual review required)  
- **Reject**: Score < 55% (automatic rejection)

### Guardrails
- Credit score below 500: Automatic rejection
- DTI ratio above 60%: Automatic rejection
- EMI ratio above 40%: Score capped at 65%

### Explainable AI
Every decision includes 3-6 concrete reasons such as:
- "Strong credit score of 750 indicates good creditworthiness"
- "Low debt-to-income ratio of 20% shows good financial health"
- "Stable employment of 5 years reduces default risk"

### API Usage
```bash
# Generate AI decision for a loan
POST /api/loans/{id}/decide
Authorization: Bearer {token}

# Response
{
  "decision": "approve",
  "score": 0.85,
  "reasons": ["Strong credit score...", "Low DTI ratio..."],
  "cached": false,
  "timestamp": "2024-01-15T10:00:00Z"
}
```

## 🧪 Testing

```bash
# Run unit tests
pnpm test

# Run unit tests in watch mode
pnpm test:watch

# Run e2e tests (optional)
pnpm test:e2e
```

## 🐳 Docker

### Build the image
```bash
docker build -t ai-loan-approval .
```

### Run the container
```bash
docker run -p 3000:3000 --env-file .env ai-loan-approval
```

## 🔄 CI/CD Pipeline

The Jenkins pipeline automatically:

1. **Checkout** code from Git
2. **Install** dependencies
3. **Test** the application
4. **Build** for production
5. **Dockerize** the application
6. **Push** to container registry
7. **Deploy** to VM via SSH

### Pipeline Triggers
- Pull requests to `main`
- Commits to `main` branch

## 📊 AI Scoring Model

### Decision Factors (Rule-based)
- **Credit Score** (35% weight): CIBIL score 300-900
- **Debt-to-Income Ratio** (25% weight): Lower is better
- **Income-to-EMI Ratio** (25% weight): EMI should be ≤35% of income
- **Employment Length** (10% weight): Longer tenure preferred
- **Loan Amount vs Income** (5% weight): Relative loan size

### Decision Thresholds
- **Score ≥ 0.70**: ✅ **Approved**
- **0.55 ≤ Score < 0.70**: ⏳ **Needs Review**
- **Score < 0.55**: ❌ **Rejected**

### Transparency
Every decision includes clear explanations like:
- "High DTI ratio (0.55) above preferred 0.35"
- "Credit score strong (780)"
- "Employment length excellent (8 years)"

## 🗂 Project Structure

```
ai-loan-approval/
├── README.md
├── Jenkinsfile
├── Dockerfile
├── package.json
├── app/                    # Next.js app directory
│   ├── (auth)/            # Auth pages
│   ├── (dashboard)/       # Dashboard
│   ├── (loans)/          # Loan management
│   ├── api/              # API routes
│   ├── components/       # UI components
│   └── lib/              # Utilities
├── ai/                   # AI scoring engine
│   ├── scoring.ts
│   ├── logistic.ts
│   └── __tests__/
├── supabase/            # Database
│   ├── migrations.sql
│   ├── policies.sql
│   └── seed.sql
├── infra/               # Infrastructure
│   └── deploy.sh
├── docs/                # Documentation
│   ├── screenshots/
│   ├── AI-Loan-Approval-Abstract.pdf
│   └── Review1-Slides.pptx
└── e2e/                 # End-to-end tests
```

## 👥 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feat/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Support

For support, please open an issue on GitHub or contact the development team.

---

**Built with ❤️ for DevOps Review-1**
