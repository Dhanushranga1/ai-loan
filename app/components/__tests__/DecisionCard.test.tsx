// Unit tests for DecisionCard component
// Phase 4: AI Scoring & Decisions

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DecisionCard } from '../DecisionCard'

// Mock Next.js components
vi.mock('next/link', () => ({
  default: ({ children, ...props }: any) => <a {...props}>{children}</a>
}))

describe('DecisionCard', () => {
  const mockDecision = {
    decision: 'approve' as const,
    score: 0.85,
    reasons: ['Strong credit score of 750', 'Low debt-to-income ratio of 20%'],
    timestamp: '2024-01-15T10:00:00Z'
  }

  it('renders approval decision correctly', () => {
    render(
      <DecisionCard 
        decision={mockDecision}
        loanStatus="approved"
      />
    )

    expect(screen.getByText('AI Decision')).toBeInTheDocument()
    expect(screen.getByText('APPROVED')).toBeInTheDocument()
    expect(screen.getByText('Score: 85%')).toBeInTheDocument()
    expect(screen.getByText('Strong credit score of 750')).toBeInTheDocument()
    expect(screen.getByText('Low debt-to-income ratio of 20%')).toBeInTheDocument()
  })

  it('renders rejection decision correctly', () => {
    const rejectDecision = {
      ...mockDecision,
      decision: 'reject' as const,
      score: 0.35,
      reasons: ['Low credit score below minimum', 'High debt-to-income ratio']
    }

    render(
      <DecisionCard 
        decision={rejectDecision}
        loanStatus="rejected"
      />
    )

    expect(screen.getByText('REJECTED')).toBeInTheDocument()
    expect(screen.getByText('Score: 35%')).toBeInTheDocument()
    expect(screen.getByText('Low credit score below minimum')).toBeInTheDocument()
  })

  it('renders needs review decision correctly', () => {
    const reviewDecision = {
      ...mockDecision,
      decision: 'needs_review' as const,
      score: 0.60,
      reasons: ['Moderate risk factors require review', 'Employment history needs verification']
    }

    render(
      <DecisionCard 
        decision={reviewDecision}
        loanStatus="under_review"
      />
    )

    expect(screen.getByText('NEEDS REVIEW')).toBeInTheDocument()
    expect(screen.getByText('Score: 60%')).toBeInTheDocument()
    expect(screen.getByText('Moderate risk factors require review')).toBeInTheDocument()
  })

  it('formats timestamp correctly', () => {
    render(
      <DecisionCard 
        decision={mockDecision}
        loanStatus="approved"
      />
    )

    // Check that timestamp is formatted (exact format may vary by locale)
    expect(screen.getByText(/January 15, 2024/)).toBeInTheDocument()
  })

  it('handles empty reasons array', () => {
    const decisionWithoutReasons = {
      ...mockDecision,
      reasons: []
    }

    render(
      <DecisionCard 
        decision={decisionWithoutReasons}
        loanStatus="approved"
      />
    )

    expect(screen.getByText('AI Decision')).toBeInTheDocument()
    expect(screen.getByText('APPROVED')).toBeInTheDocument()
    // Should not crash with empty reasons
  })

  it('applies correct styling for different decision types', () => {
    const { rerender } = render(
      <DecisionCard 
        decision={mockDecision}
        loanStatus="approved"
      />
    )

    // Check approve styling
    const approveElement = screen.getByText('APPROVED')
    expect(approveElement).toHaveClass('bg-green-100', 'text-green-800')

    // Test reject styling
    const rejectDecision = { ...mockDecision, decision: 'reject' as const }
    rerender(
      <DecisionCard 
        decision={rejectDecision}
        loanStatus="rejected"
      />
    )

    const rejectElement = screen.getByText('REJECTED')
    expect(rejectElement).toHaveClass('bg-red-100', 'text-red-800')

    // Test review styling
    const reviewDecision = { ...mockDecision, decision: 'needs_review' as const }
    rerender(
      <DecisionCard 
        decision={reviewDecision}
        loanStatus="under_review"
      />
    )

    const reviewElement = screen.getByText('NEEDS REVIEW')
    expect(reviewElement).toHaveClass('bg-yellow-100', 'text-yellow-800')
  })
})
