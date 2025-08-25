// Unit tests for logistic scoring
// Phase 4: AI Scoring & Decisions

import { scoreLogistic } from '../logistic'
import { LoanFeatures } from '../scoring'

describe('Logistic Scoring', () => {
  const baseFeatures: LoanFeatures = {
    credit_score: 750,
    monthly_income: 100000,
    existing_debts: 20000,
    amount: 1000000,
    tenure_months: 24,
    employment_years: 5,
    purpose: 'home',
  }

  test('should return score between 0 and 1', () => {
    const result = scoreLogistic(baseFeatures)

    expect(result.score).toBeGreaterThanOrEqual(0)
    expect(result.score).toBeLessThanOrEqual(1)
  })

  test('should apply same guardrails as rule-based model', () => {
    const features: LoanFeatures = {
      ...baseFeatures,
      credit_score: 450, // Below 500 floor
    }

    const result = scoreLogistic(features)

    expect(result.decision).toBe('reject')
    expect(result.score).toBe(0)
  })

  test('should be deterministic for same input', () => {
    const result1 = scoreLogistic(baseFeatures)
    const result2 = scoreLogistic(baseFeatures)

    expect(result1.score).toBe(result2.score)
    expect(result1.decision).toBe(result2.decision)
  })
})
