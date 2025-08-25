// Decision orchestration helpers
// Phase 4: AI Scoring & Decisions

import { createServerSupabaseClient } from '../app/lib/supabaseServer'
import { generateInputHash, extractFeatures, LoanApplicationData } from './features'
import { getMinDecisionInterval } from '../ai/thresholds'

export interface LoanRecord {
  id: string
  user_id: string
  amount: number
  tenure_months: number
  monthly_income: number
  existing_debts: number
  credit_score: number
  employment_type: string
  employment_years: number
  purpose: string
  status: string
  created_at: string
  updated_at: string
}

export interface DecisionRecord {
  id: string
  loan_id: string
  decision: string
  score: number
  reasons: string[]
  input_hash: string
  created_at: string
}

/**
 * Check if we can make a decision on this loan
 */
export async function canMakeDecision(loanId: string, userId: string): Promise<{
  canDecide: boolean
  reason?: string
  loan?: LoanRecord
}> {
  const supabase = await createServerSupabaseClient()

  // Get loan with RLS protection
  const { data: loan, error } = await supabase
    .from('loan_applications')
    .select('*')
    .eq('id', loanId)
    .single()

  if (error || !loan) {
    return { canDecide: false, reason: 'Loan not found' }
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
    return { canDecide: false, reason: 'Access denied' }
  }

  // Check if loan is in a state that allows decisions
  if (loan.status === 'approved' || loan.status === 'rejected') {
    return { canDecide: false, reason: 'Loan already has final decision' }
  }

  return { canDecide: true, loan }
}

/**
 * Check for recent identical decisions (idempotency)
 */
export async function getRecentDecision(
  loanId: string,
  inputHash: string
): Promise<DecisionRecord | null> {
  const supabase = await createServerSupabaseClient()
  const minInterval = getMinDecisionInterval()
  const cutoffTime = new Date(Date.now() - minInterval * 1000).toISOString()

  const { data: decision } = await supabase
    .from('decisions')
    .select('*')
    .eq('loan_id', loanId)
    .eq('input_hash', inputHash)
    .gte('created_at', cutoffTime)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  return decision
}

/**
 * Convert loan record to application data for scoring
 */
export function loanToApplicationData(loan: LoanRecord): LoanApplicationData {
  return {
    amount: loan.amount,
    tenure_months: loan.tenure_months,
    monthly_income: loan.monthly_income,
    existing_debts: loan.existing_debts,
    credit_score: loan.credit_score,
    employment_years: loan.employment_years,
    purpose: loan.purpose,
  }
}

/**
 * Determine the new loan status based on decision
 */
export function getNewLoanStatus(decision: string): string {
  switch (decision) {
    case 'approve':
      return 'approved'
    case 'reject':
      return 'rejected'
    case 'needs_review':
      return 'under_review'
    default:
      return 'submitted'
  }
}

/**
 * Create decision record and update loan status in a transaction
 */
export async function persistDecision(
  loanId: string,
  decision: string,
  score: number,
  reasons: string[],
  inputHash: string,
  userId: string
) {
  const supabase = await createServerSupabaseClient()
  const newStatus = getNewLoanStatus(decision)

  // Start transaction by inserting decision
  const { data: decisionRecord, error: decisionError } = await supabase
    .from('decisions')
    .insert({
      loan_id: loanId,
      decision,
      score,
      reasons,
      input_hash: inputHash,
      created_at: new Date().toISOString()
    })
    .select()
    .single()

  if (decisionError) {
    throw new Error(`Failed to create decision: ${decisionError.message}`)
  }

  // Update loan status
  const { error: loanError } = await supabase
    .from('loan_applications')
    .update({
      status: newStatus,
      updated_at: new Date().toISOString()
    })
    .eq('id', loanId)

  if (loanError) {
    // Try to clean up the decision record (best effort)
    await supabase.from('decisions').delete().eq('id', decisionRecord.id)
    throw new Error(`Failed to update loan status: ${loanError.message}`)
  }

  return decisionRecord
}
