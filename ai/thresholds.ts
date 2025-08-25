// AI Decision Thresholds Configuration
// Phase 4: AI Scoring & Decisions

export interface DecisionThresholds {
  approve: number
  review: number
  // reject is implicitly < review
}

export interface ScoringWeights {
  credit_score: number
  dti_ratio: number
  emi_to_income: number
  employment_length_years: number
  amount_vs_income: number
}

export interface GuardrailLimits {
  min_credit_score: number
  max_dti_ratio: number
  max_emi_to_income_ratio: number
}

// Default thresholds (can be overridden by env)
export const DEFAULT_THRESHOLDS: DecisionThresholds = {
  approve: 0.70,
  review: 0.55,
}

// Rule-based scoring weights (must sum to 100%)
export const SCORING_WEIGHTS: ScoringWeights = {
  credit_score: 0.35,          // 35%
  dti_ratio: 0.25,             // 25% (inverted)
  emi_to_income: 0.25,         // 25%
  employment_length_years: 0.10, // 10%
  amount_vs_income: 0.05,      // 5%
}

// Guardrail limits for automatic rejection/capping
export const GUARDRAIL_LIMITS: GuardrailLimits = {
  min_credit_score: 500,       // Below this = auto reject
  max_dti_ratio: 0.60,         // Above this = auto reject
  max_emi_to_income_ratio: 0.40, // Above this = cap score to 0.65
}

/**
 * Get decision thresholds from environment or defaults
 */
export function getDecisionThresholds(): DecisionThresholds {
  const envThresholds = process.env.DECISION_THRESHOLDS_JSON
  
  if (envThresholds) {
    try {
      const parsed = JSON.parse(envThresholds)
      return {
        approve: parsed.approve ?? DEFAULT_THRESHOLDS.approve,
        review: parsed.review ?? DEFAULT_THRESHOLDS.review,
      }
    } catch (error) {
      console.warn('Invalid DECISION_THRESHOLDS_JSON, using defaults:', error)
    }
  }
  
  return DEFAULT_THRESHOLDS
}

/**
 * Get minimum decision interval in seconds
 */
export function getMinDecisionInterval(): number {
  return parseInt(process.env.DECISION_MIN_DECISION_INTERVAL_SEC || '60', 10)
}

/**
 * Determine decision based on score and thresholds
 */
export function getDecisionFromScore(score: number): 'approve' | 'needs_review' | 'reject' {
  const thresholds = getDecisionThresholds()
  
  if (score >= thresholds.approve) {
    return 'approve'
  } else if (score >= thresholds.review) {
    return 'needs_review'
  } else {
    return 'reject'
  }
}
