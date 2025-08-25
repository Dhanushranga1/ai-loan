// AI Scoring Engine - Main Entry Point
// Phase 4: AI Scoring & Decisions

import { scoreRuleBased, LoanFeatures } from './scoring'
import { scoreLogistic } from './logistic'
import { extractFeatures, LoanApplicationData } from '../lib/features'

/**
 * Main scoring function that dispatches to the appropriate model
 */
export function scoreApplication(data: LoanApplicationData) {
  // Extract and validate features
  const extractedFeatures = extractFeatures(data)
  
  // Convert to scoring format
  const loanFeatures: LoanFeatures = {
    credit_score: extractedFeatures.credit_score,
    monthly_income: extractedFeatures.monthly_income,
    existing_debts: extractedFeatures.existing_debts,
    amount: extractedFeatures.amount,
    tenure_months: extractedFeatures.tenure_months,
    employment_years: extractedFeatures.employment_years,
    purpose: extractedFeatures.purpose,
  }
  
  // Choose model based on environment
  const model = process.env.AI_MODEL || 'rules'
  
  switch (model) {
    case 'logistic':
      return scoreLogistic(loanFeatures)
    case 'rules':
    default:
      return scoreRuleBased(loanFeatures)
  }
}

// Re-export for convenience
export { scoreRuleBased, scoreLogistic }
export type { LoanFeatures } from './scoring'
export type { ScoringResult } from './scoring'
export { getDecisionFromScore, getDecisionThresholds } from './thresholds'
