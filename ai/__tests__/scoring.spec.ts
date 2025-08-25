// Unit tests for rule-based scoring
// Phase 4: AI Scoring & Decisions

import { scoreRuleBased, LoanFeatures } from '../scoring'

describe('Rule-based Scoring', () => {
  const baseFeatures: LoanFeatures = {
    credit_score: 750,
    monthly_income: 100000,
    existing_debts: 20000,
    amount: 1000000,
    tenure_months: 24,
    employment_years: 5,
    purpose: 'home',
  }

  test('should approve high credit score with low DTI', () => {
    const features: LoanFeatures = {
      ...baseFeatures,
      credit_score: 800,
      existing_debts: 10000, // Low DTI
    }

    const result = scoreRuleBased(features)
    
    expect(result.decision).toBe('approve')
    expect(result.score).toBeGreaterThanOrEqual(0.70)
    expect(result.reasons).toContain(expect.stringMatching(/strong credit score/i))
  })

  test('should reject when credit score below floor', () => {
    const features: LoanFeatures = {
      ...baseFeatures,
      credit_score: 450, // Below 500 floor
    }

    const result = scoreRuleBased(features)
    
    expect(result.decision).toBe('reject')
    expect(result.score).toBe(0)
    expect(result.reasons).toContain(expect.stringMatching(/low credit score.*below minimum/i))
  })

  test('should reject when DTI above ceiling', () => {
    const features: LoanFeatures = {
      ...baseFeatures,
      existing_debts: 70000, // DTI > 60%
    }

    const result = scoreRuleBased(features)
    
    expect(result.decision).toBe('reject')
    expect(result.score).toBe(0)
    expect(result.reasons).toContain(expect.stringMatching(/high debt-to-income ratio/i))
  })

  test('should cap score when EMI ratio too high', () => {
    const features: LoanFeatures = {
      ...baseFeatures,
      amount: 5000000, // Very high EMI relative to income
      tenure_months: 12, // Short tenure makes EMI even higher
    }

    const result = scoreRuleBased(features)
    
    expect(result.score).toBeLessThanOrEqual(0.65)
    expect(result.decision).toBe('needs_review')
    expect(result.reasons).toContain(expect.stringMatching(/high EMI-to-income ratio/i))
  })

  test('should return needs_review for borderline cases', () => {
    const features: LoanFeatures = {
      ...baseFeatures,
      credit_score: 650, // Moderate credit
      existing_debts: 30000, // Moderate DTI
      employment_years: 2, // Short but acceptable employment
    }

    const result = scoreRuleBased(features)
    
    expect(result.decision).toBe('needs_review')
    expect(result.score).toBeGreaterThanOrEqual(0.55)
    expect(result.score).toBeLessThan(0.70)
  })

  test('should include expected positive reasons for approval', () => {
    const features: LoanFeatures = {
      ...baseFeatures,
      credit_score: 800,
      existing_debts: 5000,
      employment_years: 8,
    }

    const result = scoreRuleBased(features)
    
    expect(result.decision).toBe('approve')
    expect(result.reasons.length).toBeGreaterThanOrEqual(3)
    expect(result.reasons.length).toBeLessThanOrEqual(6)
    
    // Should have positive signals
    const reasonText = result.reasons.join(' ').toLowerCase()
    expect(reasonText).toMatch(/strong|good|excellent|healthy|stable/)
  })

  test('should include expected negative reasons for rejection', () => {
    const features: LoanFeatures = {
      ...baseFeatures,
      credit_score: 550,
      existing_debts: 45000,
      employment_years: 0.5,
    }

    const result = scoreRuleBased(features)
    
    expect(result.decision).toBe('reject')
    expect(result.reasons.length).toBeGreaterThanOrEqual(3)
    expect(result.reasons.length).toBeLessThanOrEqual(6)
    
    // Should have negative signals
    const reasonText = result.reasons.join(' ').toLowerCase()
    expect(reasonText).toMatch(/low|high|limited|exceeds/)
  })

  test('should return deterministic results for same input', () => {
    const features: LoanFeatures = { ...baseFeatures }

    const result1 = scoreRuleBased(features)
    const result2 = scoreRuleBased(features)
    
    expect(result1.score).toBe(result2.score)
    expect(result1.decision).toBe(result2.decision)
    expect(result1.reasons).toEqual(result2.reasons)
  })
})
