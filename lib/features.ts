// Canonical Feature Extraction for AI Scoring
// Phase 4: AI Scoring & Decisions

import { calculateEMI, calculateDTI } from '../app/lib/emi'

export interface LoanApplicationData {
  amount: number
  tenure_months: number
  monthly_income: number
  existing_debts: number
  credit_score: number
  employment_years: number
  purpose: string
}

export interface ExtractedFeatures {
  credit_score: number
  monthly_income: number
  existing_debts: number
  amount: number
  tenure_months: number
  employment_years: number
  purpose: string
  // Computed features
  emi: number
  dti_ratio: number
}

/**
 * Extract and validate features from loan application data
 * This is the canonical source for feature computation
 */
export function extractFeatures(data: LoanApplicationData): ExtractedFeatures {
  // Validate required fields
  if (!data.amount || data.amount <= 0) {
    throw new Error('Invalid loan amount')
  }

  if (!data.tenure_months || data.tenure_months <= 0) {
    throw new Error('Invalid loan tenure')
  }

  if (!data.monthly_income || data.monthly_income <= 0) {
    throw new Error('Invalid monthly income')
  }

  if (data.existing_debts < 0) {
    throw new Error('Invalid existing debts')
  }

  if (!data.credit_score || data.credit_score < 300 || data.credit_score > 900) {
    throw new Error('Invalid credit score (must be 300-900)')
  }

  if (data.employment_years < 0) {
    throw new Error('Invalid employment years')
  }

  // Calculate derived features
  const emi = calculateEMI(data.amount, 0.12, data.tenure_months) // Default 12% annual rate
  const dti_ratio = calculateDTI(data.existing_debts, data.monthly_income)

  return {
    credit_score: data.credit_score,
    monthly_income: data.monthly_income,
    existing_debts: data.existing_debts,
    amount: data.amount,
    tenure_months: data.tenure_months,
    employment_years: data.employment_years,
    purpose: data.purpose || 'general',
    emi,
    dti_ratio,
  }
}

/**
 * Generate a stable hash of input features for idempotency checks
 */
export function generateInputHash(features: ExtractedFeatures): string {
  // Create a stable JSON representation for hashing
  const hashInput = {
    amount: features.amount,
    tenure_months: features.tenure_months,
    monthly_income: features.monthly_income,
    existing_debts: features.existing_debts,
    credit_score: features.credit_score,
    employment_years: features.employment_years,
    // Include computed DTI (EMI is derived from amount/tenure)
    dti_ratio: Math.round(features.dti_ratio * 10000) / 10000, // 4 decimal precision
  }

  // Create a simple hash (for Phase 4, we'll use a simple approach)
  const jsonString = JSON.stringify(hashInput, Object.keys(hashInput).sort())

  // Simple hash function (in production, use crypto.createHash)
  let hash = 0
  for (let i = 0; i < jsonString.length; i++) {
    const char = jsonString.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }

  return hash.toString(36) // Base36 for shorter string
}

/**
 * Validate that features are sufficient for scoring
 */
export function validateFeaturesForScoring(features: ExtractedFeatures): void {
  const requiredFields: (keyof ExtractedFeatures)[] = [
    'credit_score',
    'monthly_income',
    'existing_debts',
    'amount',
    'tenure_months',
    'employment_years'
  ]

  for (const field of requiredFields) {
    if (features[field] === undefined || features[field] === null) {
      throw new Error(`Missing required field for scoring: ${field}`)
    }
  }

  // Additional business rule validations
  if (features.emi > features.monthly_income) {
    throw new Error('EMI cannot exceed monthly income')
  }

  if (features.dti_ratio > 1) {
    throw new Error('Debt-to-income ratio cannot exceed 100%')
  }
}
