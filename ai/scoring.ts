// AI Scoring Engine - Rule-based Model
// Phase 4: AI Scoring & Decisions

import { SCORING_WEIGHTS, GUARDRAIL_LIMITS, getDecisionFromScore } from './thresholds'
import { generateExplanations } from './explain'

export interface LoanFeatures {
  credit_score: number
  monthly_income: number
  existing_debts: number
  amount: number
  tenure_months: number
  employment_years: number
  purpose: string
}

export interface ScoringResult {
  score: number // 0.0 to 1.0
  decision: 'approve' | 'needs_review' | 'reject'
  reasons: string[]
  features: {
    credit_score_normalized: number
    dti_ratio: number
    dti_ratio_inverted: number
    emi_to_income: number
    employment_length_normalized: number
    amount_vs_income: number
  }
}

/**
 * Calculate EMI for given loan amount and tenure
 */
function calculateEMI(amount: number, tenure: number, rate: number = 0.12): number {
  const monthlyRate = rate / 12
  const emi = (amount * monthlyRate * Math.pow(1 + monthlyRate, tenure)) / 
              (Math.pow(1 + monthlyRate, tenure) - 1)
  return emi
}

/**
 * Normalize features for scoring
 */
function normalizeFeatures(features: LoanFeatures): ScoringResult['features'] {
  const emi = calculateEMI(features.amount, features.tenure_months)
  const dti_ratio = features.existing_debts / Math.max(features.monthly_income, 1)
  
  return {
    // Credit score: normalize 300-900 to 0-1
    credit_score_normalized: Math.max(0, Math.min(1, (features.credit_score - 300) / 600)),
    
    // DTI ratio (raw and inverted preference)
    dti_ratio,
    dti_ratio_inverted: Math.max(0, 1 - (dti_ratio / 0.35)), // Prefer DTI ≤ 35%
    
    // EMI to income ratio (prefer ≤ 35%)
    emi_to_income: 1 - Math.min(1, emi / Math.max(features.monthly_income, 1)),
    
    // Employment length: normalize 0-10+ years to 0-1
    employment_length_normalized: Math.min(features.employment_years, 10) / 10,
    
    // Amount vs income: prefer smaller relative amounts
    amount_vs_income: 1 - Math.min(1, features.amount / (12 * Math.max(features.monthly_income, 1))),
  }
}

/**
 * Apply guardrails and return early rejection if triggered
 */
function applyGuardrails(features: LoanFeatures, normalizedFeatures: ScoringResult['features']): {
  shouldReject: boolean
  shouldCapScore: boolean
  maxScore?: number
  guardrailReasons: string[]
} {
  const guardrailReasons: string[] = []
  let shouldReject = false
  let shouldCapScore = false
  let maxScore: number | undefined

  // Credit score floor
  if (features.credit_score < GUARDRAIL_LIMITS.min_credit_score) {
    shouldReject = true
    guardrailReasons.push(`Low credit score (${features.credit_score}) below minimum requirement`)
  }

  // DTI ceiling
  if (normalizedFeatures.dti_ratio > GUARDRAIL_LIMITS.max_dti_ratio) {
    shouldReject = true
    guardrailReasons.push(`High debt-to-income ratio (${(normalizedFeatures.dti_ratio * 100).toFixed(1)}%) exceeds maximum limit`)
  }

  // EMI to income ceiling (cap score, don't auto-reject)
  const emiRatio = 1 - normalizedFeatures.emi_to_income
  if (emiRatio > GUARDRAIL_LIMITS.max_emi_to_income_ratio) {
    shouldCapScore = true
    maxScore = 0.65 // Push to review category
    guardrailReasons.push(`High EMI-to-income ratio (${(emiRatio * 100).toFixed(1)}%) requires review`)
  }

  return { shouldReject, shouldCapScore, maxScore, guardrailReasons }
}

/**
 * Calculate weighted score from normalized features
 */
function calculateWeightedScore(normalizedFeatures: ScoringResult['features']): number {
  const score = 
    normalizedFeatures.credit_score_normalized * SCORING_WEIGHTS.credit_score +
    normalizedFeatures.dti_ratio_inverted * SCORING_WEIGHTS.dti_ratio +
    normalizedFeatures.emi_to_income * SCORING_WEIGHTS.emi_to_income +
    normalizedFeatures.employment_length_normalized * SCORING_WEIGHTS.employment_length_years +
    normalizedFeatures.amount_vs_income * SCORING_WEIGHTS.amount_vs_income

  return Math.max(0, Math.min(1, score))
}

/**
 * Main rule-based scoring function
 */
export function scoreRuleBased(features: LoanFeatures): ScoringResult {
  // Normalize features
  const normalizedFeatures = normalizeFeatures(features)
  
  // Apply guardrails
  const guardrails = applyGuardrails(features, normalizedFeatures)
  
  // Calculate base score
  let score = calculateWeightedScore(normalizedFeatures)
  
  // Apply guardrail constraints
  if (guardrails.shouldReject) {
    score = 0 // Force rejection
  } else if (guardrails.shouldCapScore && guardrails.maxScore !== undefined) {
    score = Math.min(score, guardrails.maxScore)
  }
  
  // Determine decision
  const decision = getDecisionFromScore(score)
  
  // Generate explanations
  const reasons = generateExplanations({
    features,
    normalizedFeatures,
    score,
    decision,
    guardrailReasons: guardrails.guardrailReasons,
  })
  
  return {
    score,
    decision,
    reasons,
    features: normalizedFeatures,
  }
}
