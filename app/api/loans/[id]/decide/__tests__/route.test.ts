// Integration tests for decision API endpoint
// Phase 4: AI Scoring & Decisions

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { NextRequest } from 'next/server'
import { POST } from '../route'

// Mock dependencies
vi.mock('@/app/lib/auth', () => ({
  getUser: vi.fn()
}))

vi.mock('@/lib/decision', () => ({
  canMakeDecision: vi.fn(),
  getRecentDecision: vi.fn(),
  loanToApplicationData: vi.fn(),
  persistDecision: vi.fn(),
  getNewLoanStatus: vi.fn()
}))

vi.mock('@/lib/features', () => ({
  extractFeatures: vi.fn(),
  generateInputHash: vi.fn(),
  validateFeaturesForScoring: vi.fn()
}))

vi.mock('@/ai', () => ({
  scoreApplication: vi.fn()
}))

vi.mock('@/app/lib/audit', () => ({
  insertAuditLog: vi.fn()
}))

import { getUser } from '@/app/lib/auth'
import { canMakeDecision, getRecentDecision, loanToApplicationData, persistDecision } from '@/lib/decision'
import { extractFeatures, generateInputHash, validateFeaturesForScoring } from '@/lib/features'
import { scoreApplication } from '@/ai'
import { insertAuditLog } from '@/app/lib/audit'

describe('/api/loans/[id]/decide', () => {
  const mockUser = { id: 'user-123', email: 'test@example.com' }
  const mockLoan = {
    id: 'loan-123',
    user_id: 'user-123',
    amount: 1000000,
    tenure_months: 24,
    monthly_income: 100000,
    existing_debts: 20000,
    credit_score: 750,
    employment_years: 5,
    purpose: 'home',
    status: 'submitted'
  }
  const mockFeatures = {
    credit_score: 750,
    monthly_income: 100000,
    existing_debts: 20000,
    amount: 1000000,
    tenure_months: 24,
    employment_years: 5,
    purpose: 'home'
  }
  const mockScoringResult = {
    decision: 'approve' as const,
    score: 0.85,
    reasons: ['Strong credit score of 750', 'Low debt-to-income ratio'],
    features: {
      credit_score_normalized: 0.85,
      dti_ratio: 0.2,
      dti_ratio_inverted: 0.8,
      emi_to_income: 0.4,
      employment_length_normalized: 0.8,
      amount_vs_income: 10.0
    }
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  it('should require authentication', async () => {
    vi.mocked(getUser).mockResolvedValue(null)

    const request = new NextRequest('http://localhost/api/loans/loan-123/decide', {
      method: 'POST'
    })
    const response = await POST(request, { params: Promise.resolve({ id: 'loan-123' }) })
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Authentication required')
  })

  it('should deny access for non-owner/non-admin', async () => {
    vi.mocked(getUser).mockResolvedValue(mockUser)
    vi.mocked(canMakeDecision).mockResolvedValue({
      canDecide: false,
      reason: 'Access denied'
    })

    const request = new NextRequest('http://localhost/api/loans/loan-123/decide', {
      method: 'POST'
    })
    const response = await POST(request, { params: Promise.resolve({ id: 'loan-123' }) })
    const data = await response.json()

    expect(response.status).toBe(403)
    expect(data.error).toBe('Access denied')
  })

  it('should return recent decision if exists (idempotency)', async () => {
    const recentDecision = {
      decision: 'approve',
      score: 0.85,
      reasons: ['Strong credit score', 'Low DTI'],
      created_at: '2024-01-15T10:00:00Z'
    }

    vi.mocked(getUser).mockResolvedValue(mockUser)
    vi.mocked(canMakeDecision).mockResolvedValue({
      canDecide: true,
      loan: mockLoan
    })
    vi.mocked(loanToApplicationData).mockReturnValue(mockFeatures)
    vi.mocked(extractFeatures).mockReturnValue(mockFeatures)
    vi.mocked(generateInputHash).mockReturnValue('hash-123')
    vi.mocked(getRecentDecision).mockResolvedValue(recentDecision)

    const request = new NextRequest('http://localhost/api/loans/loan-123/decide', {
      method: 'POST'
    })
    const response = await POST(request, { params: Promise.resolve({ id: 'loan-123' }) })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.cached).toBe(true)
    expect(data.decision).toBe('approve')
    expect(data.score).toBe(0.85)
    expect(data.timestamp).toBe('2024-01-15T10:00:00Z')
  })

  it('should create new decision when no recent decision exists', async () => {
    const mockDecisionRecord = {
      id: 'decision-123',
      loan_id: 'loan-123',
      decision: 'approve',
      score: 0.85,
      reasons: ['Strong credit score', 'Low DTI'],
      created_at: '2024-01-15T10:00:00Z'
    }

    vi.mocked(getUser).mockResolvedValue(mockUser)
    vi.mocked(canMakeDecision).mockResolvedValue({
      canDecide: true,
      loan: mockLoan
    })
    vi.mocked(loanToApplicationData).mockReturnValue(mockFeatures)
    vi.mocked(extractFeatures).mockReturnValue(mockFeatures)
    vi.mocked(generateInputHash).mockReturnValue('hash-123')
    vi.mocked(getRecentDecision).mockResolvedValue(null)
    vi.mocked(validateFeaturesForScoring).mockImplementation(() => {})
    vi.mocked(scoreApplication).mockReturnValue(mockScoringResult)
    vi.mocked(persistDecision).mockResolvedValue(mockDecisionRecord)
    vi.mocked(insertAuditLog).mockResolvedValue()

    const request = new NextRequest('http://localhost/api/loans/loan-123/decide', {
      method: 'POST'
    })
    const response = await POST(request, { params: Promise.resolve({ id: 'loan-123' }) })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.cached).toBe(false)
    expect(data.decision).toBe('approve')
    expect(data.score).toBe(0.85)
    expect(data.reasons).toEqual(['Strong credit score', 'Low DTI'])

    // Verify decision was persisted
    expect(persistDecision).toHaveBeenCalledWith(
      'loan-123',
      'approve',
      0.85,
      ['Strong credit score', 'Low DTI'],
      'hash-123',
      'user-123'
    )

    // Verify audit log was created
    expect(insertAuditLog).toHaveBeenCalledWith({
      table_name: 'decisions',
      record_id: 'decision-123',
      action: 'INSERT',
      old_values: null,
      new_values: expect.objectContaining({
        decision: 'approve',
        score: 0.85
      }),
      user_id: 'user-123'
    })
  })

  it('should handle validation errors', async () => {
    vi.mocked(getUser).mockResolvedValue(mockUser)
    vi.mocked(canMakeDecision).mockResolvedValue({
      canDecide: true,
      loan: mockLoan
    })
    vi.mocked(loanToApplicationData).mockReturnValue(mockFeatures)
    vi.mocked(extractFeatures).mockReturnValue(mockFeatures)
    vi.mocked(generateInputHash).mockReturnValue('hash-123')
    vi.mocked(getRecentDecision).mockResolvedValue(null)
    vi.mocked(validateFeaturesForScoring).mockImplementation(() => {
      throw new Error('Invalid credit score')
    })

    const request = new NextRequest('http://localhost/api/loans/loan-123/decide', {
      method: 'POST'
    })
    const response = await POST(request, { params: Promise.resolve({ id: 'loan-123' }) })
    const data = await response.json()

    expect(response.status).toBe(422)
    expect(data.error).toBe('Invalid loan data: Invalid credit score')
  })

  it('should handle loan not found', async () => {
    vi.mocked(getUser).mockResolvedValue(mockUser)
    vi.mocked(canMakeDecision).mockResolvedValue({
      canDecide: false,
      reason: 'Loan not found'
    })

    const request = new NextRequest('http://localhost/api/loans/unknown/decide', {
      method: 'POST'
    })
    const response = await POST(request, { params: { id: 'unknown' } })
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.error).toBe('Loan not found')
  })

  it('should handle loan already decided', async () => {
    vi.mocked(getUser).mockResolvedValue(mockUser)
    vi.mocked(canMakeDecision).mockResolvedValue({
      canDecide: false,
      reason: 'Loan already has final decision'
    })

    const request = new NextRequest('http://localhost/api/loans/loan-123/decide', {
      method: 'POST'
    })
    const response = await POST(request, { params: Promise.resolve({ id: 'loan-123' }) })
    const data = await response.json()

    expect(response.status).toBe(409)
    expect(data.error).toBe('Loan already has final decision')
  })

  it('should handle scoring errors gracefully', async () => {
    vi.mocked(getUser).mockResolvedValue(mockUser)
    vi.mocked(canMakeDecision).mockResolvedValue({
      canDecide: true,
      loan: mockLoan
    })
    vi.mocked(loanToApplicationData).mockReturnValue(mockFeatures)
    vi.mocked(extractFeatures).mockReturnValue(mockFeatures)
    vi.mocked(generateInputHash).mockReturnValue('hash-123')
    vi.mocked(getRecentDecision).mockResolvedValue(null)
    vi.mocked(validateFeaturesForScoring).mockImplementation(() => {})
    vi.mocked(scoreApplication).mockImplementation(() => {
      throw new Error('Scoring service unavailable')
    })

    const request = new NextRequest('http://localhost/api/loans/loan-123/decide', {
      method: 'POST'
    })
    const response = await POST(request, { params: Promise.resolve({ id: 'loan-123' }) })
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Failed to process decision')
  })
})
