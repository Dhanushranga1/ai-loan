// AI Explanation Generator
// Phase 4: AI Scoring & Decisions

import { LoanFeatures, ScoringResult } from './scoring'

export interface ExplanationContext {
  features: LoanFeatures
  normalizedFeatures: ScoringResult['features']
  score: number
  decision: 'approve' | 'needs_review' | 'reject'
  guardrailReasons: string[]
}

/**
 * Generate 3-6 concrete reasons that align with the decision
 */
export function generateExplanations(context: ExplanationContext): string[] {
  const { features, normalizedFeatures, decision, guardrailReasons } = context
  const reasons: string[] = []

  // Start with guardrail reasons (highest priority)
  reasons.push(...guardrailReasons)

  // Calculate EMI for explanation
  const emi = calculateEMI(features.amount, features.tenure_months)
  const emiRatio = (emi / features.monthly_income) * 100
  const dtiRatio = normalizedFeatures.dti_ratio * 100

  // Generate positive signals (for approve/review decisions)
  if (decision === 'approve' || (decision === 'needs_review' && context.score > 0.6)) {
    // Strong credit score
    if (features.credit_score >= 750) {
      reasons.push(`Strong credit score (${features.credit_score})`)
    } else if (features.credit_score >= 650) {
      reasons.push(`Good credit score (${features.credit_score})`)
    }

    // Healthy EMI ratio
    if (emiRatio <= 25) {
      reasons.push(`Excellent EMI-to-income ratio (${emiRatio.toFixed(1)}%)`)
    } else if (emiRatio <= 35) {
      reasons.push(`Healthy EMI-to-income ratio (${emiRatio.toFixed(1)}%)`)
    }

    // Low DTI
    if (dtiRatio <= 20) {
      reasons.push(`Excellent debt-to-income ratio (${dtiRatio.toFixed(1)}%)`)
    } else if (dtiRatio <= 35) {
      reasons.push(`Healthy debt-to-income ratio (${dtiRatio.toFixed(1)}%)`)
    }

    // Stable employment
    if (features.employment_years >= 5) {
      reasons.push(`Stable employment history (${features.employment_years} years)`)
    } else if (features.employment_years >= 2) {
      reasons.push(`Good employment stability (${features.employment_years} years)`)
    }
  }

  // Generate negative signals (for reject/review decisions)
  if (decision === 'reject' || decision === 'needs_review') {
    // Poor credit score
    if (features.credit_score < 600) {
      reasons.push(`Low credit score (${features.credit_score}) indicates higher risk`)
    }

    // High EMI ratio
    if (emiRatio > 40) {
      reasons.push(`High EMI (${emiRatio.toFixed(1)}% of income) exceeds comfort zone`)
    } else if (emiRatio > 35) {
      reasons.push(`EMI (${emiRatio.toFixed(1)}% of income) above ideal 35% threshold`)
    }

    // High DTI
    if (dtiRatio > 50) {
      reasons.push(`Very high debt-to-income ratio (${dtiRatio.toFixed(1)}%)`)
    } else if (dtiRatio > 35) {
      reasons.push(`High debt-to-income ratio (${dtiRatio.toFixed(1)}%) exceeds ideal 35%`)
    }

    // Short employment
    if (features.employment_years < 1) {
      reasons.push(`Limited employment history (${features.employment_years} years)`)
    }

    // Large amount relative to income
    const amountToIncomeRatio = features.amount / (features.monthly_income * 12)
    if (amountToIncomeRatio > 5) {
      reasons.push(`Large loan amount relative to annual income (${amountToIncomeRatio.toFixed(1)}x)`)
    }
  }

  // Add decision-specific context
  if (decision === 'needs_review') {
    reasons.push('Application requires manual review due to mixed risk factors')
  }

  // Ensure we have 3-6 reasons by adding generic ones if needed
  if (reasons.length < 3) {
    if (decision === 'approve') {
      reasons.push('Overall financial profile meets approval criteria')
    } else if (decision === 'needs_review') {
      reasons.push('Risk factors require careful evaluation')
    } else {
      reasons.push('Risk profile exceeds acceptable limits')
    }
  }

  // Limit to 6 reasons maximum
  return reasons.slice(0, 6)
}

/**
 * Calculate EMI helper (duplicated from scoring.ts to avoid circular import)
 */
function calculateEMI(amount: number, tenure: number, rate: number = 0.12): number {
  const monthlyRate = rate / 12
  const emi = (amount * monthlyRate * Math.pow(1 + monthlyRate, tenure)) /
              (Math.pow(1 + monthlyRate, tenure) - 1)
  return emi
}
