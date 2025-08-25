# 🏦 AI Loan Approval System

## Abstract

The AI Loan Approval System is a modern, full-stack web application that automates loan approval decisions using transparent AI scoring. Built with Next.js, Supabase, and deployed through a Jenkins CI/CD pipeline with Docker containerization.

## 🎯 Features

- **Smart Loan Decisioning**: Rule-based AI scoring with transparent explanations
- **User Authentication**: Secure auth powered by Supabase
- **Loan Management**: Create, view, and track loan applications
- **Admin Dashboard**: Administrative oversight for loan officers
- **Real-time EMI Calculator**: Live calculation as users input data
- **Audit Trail**: Complete activity logging for compliance
- **Modern UI**: Clean, responsive design with Inter font and Tailwind CSS

## 🛠 Tech Stack

### Frontend & Backend
- **Next.js 14** (App Router, TypeScript)
- **Tailwind CSS** + **shadcn/ui** components
- **Inter Font** (Google Fonts)

### Database & Authentication
- **Supabase** (PostgreSQL + Auth)
- **Row Level Security (RLS)** for data protection

### AI & Scoring
- **Rule-based Decision Engine** with transparent weights
- **Optional Logistic Regression** model
- **Explanatory AI** - provides clear reasoning for decisions

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
AI_MODEL=rules
NODE_ENV=development
PORT=3000
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
