// POST /api/loans/[id]/decide - AI Decision Endpoint
// Phase 4: AI Scoring & Decisions

import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/app/lib/auth'
import { scoreApplication } from '@/ai'
import {
  canMakeDecision,
  getRecentDecision,
  loanToApplicationData,
  persistDecision
} from '@/lib/decision'
import { generateInputHash, extractFeatures } from '@/lib/features'
import { insertAuditLog } from '@/app/lib/audit'
import { rateLimit, getRateLimitIdentifier, RATE_LIMITS } from '@/lib/rate-limit'

interface DecideParams {
  id: string
}

async function decideHandler(
  request: NextRequest,
  { params }: { params: DecideParams }
) {
  try {
    // Authentication
    const user = await getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const loanId = params.id

    // Check if user can make decision on this loan
    const { canDecide, reason, loan } = await canMakeDecision(loanId, user.id)

    if (!canDecide) {
      const status = reason === 'Loan not found' ? 404 :
                    reason === 'Access denied' ? 403 : 409
      return NextResponse.json({ error: reason }, { status })
    }

    if (!loan) {
      return NextResponse.json(
        { error: 'Loan data not available' },
        { status: 500 }
      )
    }

    // Extract features and generate input hash for idempotency
    const applicationData = loanToApplicationData(loan)
    const features = extractFeatures(applicationData)
    const inputHash = generateInputHash(features)

    // Check for recent identical decision (idempotency)
    const recentDecision = await getRecentDecision(loanId, inputHash)
    if (recentDecision) {
      // Return the recent decision without creating a new one
      return NextResponse.json({
        decision: recentDecision.decision,
        score: recentDecision.score,
        reasons: recentDecision.reasons,
        loan: {
          id: loan.id,
          status: loan.status
        },
        cached: true,
        timestamp: recentDecision.created_at
      })
    }

    // Validate features for scoring
    try {
      const { validateFeaturesForScoring } = await import('@/lib/features')
      validateFeaturesForScoring(features)
    } catch (validationError: any) {
      return NextResponse.json(
        { error: `Invalid loan data: ${validationError?.message || 'Unknown validation error'}` },
        { status: 422 }
      )
    }

    // Run AI scoring
    const scoringResult = scoreApplication(applicationData)

    // Persist decision and update loan status
    try {
      const decisionRecord = await persistDecision(
        loanId,
        scoringResult.decision,
        scoringResult.score,
        scoringResult.reasons,
        inputHash,
        user.id
      )

      // Log audit event
      await insertAuditLog({
        action: 'decision.create',
        entity: 'loan',
        entity_id: loanId,
        meta: {
          decision: scoringResult.decision,
          score: scoringResult.score,
          reasons: scoringResult.reasons.slice(0, 2), // Top 2 reasons for audit
          input_hash: inputHash
        }
      })

      // Return successful response
      return NextResponse.json({
        decision: scoringResult.decision,
        score: scoringResult.score,
        reasons: scoringResult.reasons,
        loan: {
          id: loan.id,
          status: getNewLoanStatus(scoringResult.decision)
        },
        timestamp: decisionRecord.created_at
      }, { status: 201 })

    } catch (persistError) {
      console.error('Failed to persist decision:', persistError)
      return NextResponse.json(
        { error: 'Failed to save decision' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Decision endpoint error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Apply rate limiting to the decision endpoint
export async function POST(request: NextRequest, context: { params: DecideParams }) {
  // Apply rate limiting
  const user = await getUser() // Get user for rate limiting identifier
  const identifier = getRateLimitIdentifier(request, user?.id)
  const rateLimitResult = rateLimit(identifier, RATE_LIMITS.LOAN_DECISION)
  
  if (!rateLimitResult.success) {
    return new Response(
      JSON.stringify({
        error: rateLimitResult.message,
        limit: rateLimitResult.limit,
        remaining: rateLimitResult.remaining,
        resetTime: rateLimitResult.resetTime
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'X-RateLimit-Limit': rateLimitResult.limit.toString(),
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
          'X-RateLimit-Reset': rateLimitResult.resetTime.toString(),
          'Retry-After': Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString()
        }
      }
    )
  }
  
  // Call the actual handler
  const response = await decideHandler(request, context)
  
  // Add rate limit headers to successful responses
  response.headers.set('X-RateLimit-Limit', rateLimitResult.limit.toString())
  response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString())
  response.headers.set('X-RateLimit-Reset', rateLimitResult.resetTime.toString())
  
  return response
}

// Helper function to get new loan status (duplicated from decision.ts to avoid circular import)
function getNewLoanStatus(decision: string): string {
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
