// AI Scoring Engine - Logistic Model (Optional)
// Phase 4: AI Scoring & Decisions

import { LoanFeatures, ScoringResult } from './scoring'
import { getDecisionFromScore } from './thresholds'
import { generateExplanations } from './explain'

/**
 * Logistic regression coefficients (hard-coded for Phase 4)
 * These would typically come from model training
 */
const LOGISTIC_COEFFICIENTS = {
  intercept: -2.5,
  credit_score_normalized: 3.2,
  dti_ratio_inverted: 2.1,
  emi_to_income: 1.8,
  employment_length_normalized: 0.9,
  amount_vs_income: 0.5,
}

/**
 * Sigmoid function for logistic regression
 */
function sigmoid(z: number): number {
  return 1 / (1 + Math.exp(-z))
}

/**
 * Normalize features for logistic model (same as rule-based)
 */
function normalizeFeatures(features: LoanFeatures): ScoringResult['features'] {
  const emi = calculateEMI(features.amount, features.tenure_months)
  const dti_ratio = features.existing_debts / Math.max(features.monthly_income, 1)

  return {
    credit_score_normalized: Math.max(0, Math.min(1, (features.credit_score - 300) / 600)),
    dti_ratio,
    dti_ratio_inverted: Math.max(0, 1 - (dti_ratio / 0.35)),
    emi_to_income: 1 - Math.min(1, emi / Math.max(features.monthly_income, 1)),
    employment_length_normalized: Math.min(features.employment_years, 10) / 10,
    amount_vs_income: 1 - Math.min(1, features.amount / (12 * Math.max(features.monthly_income, 1))),
  }
}

/**
 * Calculate EMI helper
 */
function calculateEMI(amount: number, tenure: number, rate: number = 0.12): number {
  const monthlyRate = rate / 12
  const emi = (amount * monthlyRate * Math.pow(1 + monthlyRate, tenure)) /
              (Math.pow(1 + monthlyRate, tenure) - 1)
  return emi
}

/**
 * Logistic regression scoring function
 */
export function scoreLogistic(features: LoanFeatures): ScoringResult {
  // Normalize features
  const normalizedFeatures = normalizeFeatures(features)

  // Calculate logistic score
  const z = LOGISTIC_COEFFICIENTS.intercept +
            LOGISTIC_COEFFICIENTS.credit_score_normalized * normalizedFeatures.credit_score_normalized +
            LOGISTIC_COEFFICIENTS.dti_ratio_inverted * normalizedFeatures.dti_ratio_inverted +
            LOGISTIC_COEFFICIENTS.emi_to_income * normalizedFeatures.emi_to_income +
            LOGISTIC_COEFFICIENTS.employment_length_normalized * normalizedFeatures.employment_length_normalized +
            LOGISTIC_COEFFICIENTS.amount_vs_income * normalizedFeatures.amount_vs_income

  // Apply sigmoid to get probability score
  let score = sigmoid(z)

  // Apply same guardrails as rule-based model
  const guardrailReasons: string[] = []

  // Credit score floor
  if (features.credit_score < 500) {
    score = 0
    guardrailReasons.push(`Low credit score (${features.credit_score}) below minimum requirement`)
  }

  // DTI ceiling
  if (normalizedFeatures.dti_ratio > 0.60) {
    score = 0
    guardrailReasons.push(`High debt-to-income ratio (${(normalizedFeatures.dti_ratio * 100).toFixed(1)}%) exceeds maximum limit`)
  }

  // EMI to income ceiling (cap score)
  const emiRatio = 1 - normalizedFeatures.emi_to_income
  if (emiRatio > 0.40) {
    score = Math.min(score, 0.65)
    guardrailReasons.push(`High EMI-to-income ratio (${(emiRatio * 100).toFixed(1)}%) requires review`)
  }

  // Determine decision
  const decision = getDecisionFromScore(score)

  // Generate explanations
  const reasons = generateExplanations({
    features,
    normalizedFeatures,
    score,
    decision,
    guardrailReasons,
  })

  return {
    score,
    decision,
    reasons,
    features: normalizedFeatures,
  }
}
