// Loan detail page with AI decision integration
import { Suspense } from 'react'
import { Container } from '@/app/components/container'
import { createServerSupabaseClient } from '@/app/lib/supabaseServer'
import { requireUser } from '@/app/lib/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Badge } from '@/app/components/ui/badge'
import { Button } from '@/app/components/ui/button'
import { ArrowLeft, Calendar, DollarSign, User, FileText, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { DecisionCard } from '@/app/components/DecisionCard'
import { RunDecisionButton } from '@/app/components/RunDecisionButton'

interface LoanApplication {
  id: string
  user_id: string
  amount: number
  tenure_months: number
  purpose: string
  monthly_income: number
  existing_debts: number
  credit_score: number
  employment_type: string
  employment_years: number
  status: string
  ai_decision: string | null
  ai_confidence: number | null
  ai_reasoning: string | null
  calculated_emi: number | null
  debt_to_income_ratio: number | null
  created_at: string
  submitted_at: string | null
  decided_at: string | null
}

interface Decision {
  id: string
  decision: string
  score: number
  reasons: string[]
  created_at: string
}

async function getLoanApplication(id: string, userId: string): Promise<LoanApplication | null> {
  const supabase = await createServerSupabaseClient()

  const { data: loan, error } = await supabase
    .from('loan_applications')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !loan) {
    return null
  }

  // Check if user owns the loan or is admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single()

  const isOwner = loan.user_id === userId
  const isAdmin = profile?.role === 'admin'

  if (!isOwner && !isAdmin) {
    return null
  }

  return loan
}

async function getLatestDecision(loanId: string): Promise<Decision | null> {
  const supabase = await createServerSupabaseClient()

  const { data: decision, error } = await supabase
    .from('decisions')
    .select('*')
    .eq('loan_id', loanId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  return decision
}

function getStatusIcon(status: string) {
  switch (status) {
    case 'approved':
      return <CheckCircle className="w-5 h-5 text-green-600" />
    case 'rejected':
      return <XCircle className="w-5 h-5 text-red-600" />
    case 'under_review':
    case 'needs_review':
      return <AlertCircle className="w-5 h-5 text-yellow-600" />
    default:
      return <Clock className="w-5 h-5 text-gray-600" />
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case 'approved':
      return 'bg-green-100 text-green-800'
    case 'rejected':
      return 'bg-red-100 text-red-800'
    case 'under_review':
    case 'needs_review':
      return 'bg-yellow-100 text-yellow-800'
    case 'submitted':
      return 'bg-blue-100 text-blue-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(amount)
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

async function LoanDetailContent({ params }: { params: { id: string } }) {
  const user = await requireUser()
  const loan = await getLoanApplication(params.id, user.id)

  if (!loan) {
    notFound()
  }

  const decision = await getLatestDecision(loan.id)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/loans">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Loans
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Loan Application</h1>
            <p className="text-gray-600">Application ID: {loan.id}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {getStatusIcon(loan.status)}
          <Badge className={getStatusColor(loan.status)}>
            {loan.status.replace('_', ' ').toUpperCase()}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Loan Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <DollarSign className="w-5 h-5 mr-2" />
              Loan Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Amount</p>
                <p className="text-lg font-semibold">{formatCurrency(loan.amount)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Tenure</p>
                <p className="text-lg font-semibold">{loan.tenure_months} months</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Purpose</p>
                <p className="text-lg font-semibold capitalize">{loan.purpose}</p>
              </div>
              {loan.calculated_emi && (
                <div>
                  <p className="text-sm font-medium text-gray-500">EMI</p>
                  <p className="text-lg font-semibold">{formatCurrency(loan.calculated_emi)}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Applicant Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="w-5 h-5 mr-2" />
              Applicant Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Monthly Income</p>
                <p className="text-lg font-semibold">{formatCurrency(loan.monthly_income)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Credit Score</p>
                <p className="text-lg font-semibold">{loan.credit_score}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Employment</p>
                <p className="text-lg font-semibold capitalize">{loan.employment_type}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Experience</p>
                <p className="text-lg font-semibold">{loan.employment_years} years</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Existing Debts</p>
                <p className="text-lg font-semibold">{formatCurrency(loan.existing_debts)}</p>
              </div>
              {loan.debt_to_income_ratio && (
                <div>
                  <p className="text-sm font-medium text-gray-500">DTI Ratio</p>
                  <p className="text-lg font-semibold">{(loan.debt_to_income_ratio * 100).toFixed(1)}%</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Application Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Timeline
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Created</span>
              <span className="text-sm text-gray-600">{formatDate(loan.created_at)}</span>
            </div>
            {loan.submitted_at && (
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Submitted</span>
                <span className="text-sm text-gray-600">{formatDate(loan.submitted_at)}</span>
              </div>
            )}
            {loan.decided_at && (
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Decided</span>
                <span className="text-sm text-gray-600">{formatDate(loan.decided_at)}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* AI Decision Section */}
        <div className="space-y-4">
          {decision ? (
            <DecisionCard
              decision={decision.decision as 'approve' | 'reject' | 'needs_review'}
              score={decision.score}
              reasons={decision.reasons}
              timestamp={decision.created_at}
            />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  AI Decision
                </CardTitle>
                <CardDescription>
                  Run AI analysis to get an automated decision on this loan application
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RunDecisionButton
                  loanId={loan.id}
                  currentStatus={loan.status}
                  onDecisionMade={(decision) => {
                    // TODO: Handle decision update
                    console.log('Decision made:', decision)
                  }}
                  disabled={!(loan.status === 'submitted' || loan.status === 'under_review')}
                />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

export default async function LoanDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  return (
    <Container>
      <div className="py-8">
        <Suspense fallback={
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        }>
          <LoanDetailContent params={{ id }} />
        </Suspense>
      </div>
    </Container>
  )
}
