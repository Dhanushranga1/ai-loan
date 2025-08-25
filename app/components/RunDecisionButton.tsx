'use client'

import { useState } from 'react'
import { Button } from '@/app/components/ui/button'

interface RunDecisionButtonProps {
  loanId: string
  currentStatus: string
  onDecisionMade: (decision: any) => void
  disabled?: boolean
}

interface DecisionResponse {
  decision: string
  score: number
  reasons: string[]
  loan: {
    id: string
    status: string
  }
  timestamp: string
  cached?: boolean
}

export function RunDecisionButton({ 
  loanId, 
  currentStatus, 
  onDecisionMade, 
  disabled 
}: RunDecisionButtonProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const canRunDecision = ['submitted', 'needs_review'].includes(currentStatus)
  const isDisabled = disabled || !canRunDecision || loading

  const handleRunDecision = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch(`/api/loans/${loanId}/decide`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to run decision')
      }

      const decisionResult: DecisionResponse = await response.json()
      onDecisionMade(decisionResult)

    } catch (err: any) {
      console.error('Decision error:', err)
      setError(err.message || 'Failed to run decision')
    } finally {
      setLoading(false)
    }
  }

  const getButtonText = () => {
    if (loading) return 'Processing...'
    if (!canRunDecision) {
      if (currentStatus === 'approved') return 'Already Approved'
      if (currentStatus === 'rejected') return 'Already Rejected'
      if (currentStatus === 'draft') return 'Submit Application First'
      return 'Cannot Run Decision'
    }
    return 'Run AI Decision'
  }

  const getButtonVariant = () => {
    if (!canRunDecision) return 'outline'
    return 'default'
  }

  return (
    <div className="space-y-2">
      <Button
        onClick={handleRunDecision}
        disabled={isDisabled}
        variant={getButtonVariant()}
        className="w-full"
      >
        {loading && (
          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-white"></div>
        )}
        {getButtonText()}
      </Button>
      
      {error && (
        <div className="text-sm text-red-600 bg-red-50 p-2 rounded border border-red-200">
          {error}
        </div>
      )}
      
      {!canRunDecision && currentStatus !== 'draft' && (
        <p className="text-xs text-gray-500 text-center">
          {currentStatus === 'approved' || currentStatus === 'rejected' 
            ? 'This loan already has a final decision' 
            : 'Decision cannot be run for this status'}
        </p>
      )}
    </div>
  )
}
