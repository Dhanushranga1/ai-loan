'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card'

interface DecisionCardProps {
  decision: 'approve' | 'reject' | 'needs_review'
  score: number
  reasons: string[]
  timestamp: string
  cached?: boolean
}

function getDecisionColor(decision: string) {
  switch (decision) {
    case 'approve':
      return 'text-green-600 bg-green-50 border-green-200'
    case 'reject':
      return 'text-red-600 bg-red-50 border-red-200'
    case 'needs_review':
      return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200'
  }
}

function getDecisionLabel(decision: string) {
  switch (decision) {
    case 'approve':
      return 'Approved'
    case 'reject':
      return 'Rejected'
    case 'needs_review':
      return 'Needs Review'
    default:
      return 'Unknown'
  }
}

function formatScore(score: number) {
  return `${(score * 100).toFixed(1)}%`
}

export function DecisionCard({ decision, score, reasons, timestamp, cached }: DecisionCardProps) {
  const decisionColor = getDecisionColor(decision)
  const decisionLabel = getDecisionLabel(decision)

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <span>AI Decision</span>
            <span className={`px-2 py-1 rounded-md text-sm font-medium border ${decisionColor}`}>
              {decisionLabel}
            </span>
          </CardTitle>
          {cached && (
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              Cached Result
            </span>
          )}
        </div>
        <CardDescription>
          Score: {formatScore(score)} • {new Date(timestamp).toLocaleString()}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Reasoning:</h4>
            <div className="space-y-1">
              {reasons.map((reason, index) => (
                <div
                  key={index}
                  className="text-sm text-gray-600 bg-gray-50 p-2 rounded border-l-2 border-blue-200"
                >
                  {reason}
                </div>
              ))}
            </div>
          </div>
          
          {decision === 'needs_review' && (
            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800">
                <strong>Manual Review Required:</strong> This application requires human evaluation 
                due to mixed risk factors. Please review the details carefully.
              </p>
            </div>
          )}
          
          {decision === 'approve' && (
            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-800">
                <strong>Loan Approved:</strong> The application meets all approval criteria.
              </p>
            </div>
          )}
          
          {decision === 'reject' && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800">
                <strong>Loan Rejected:</strong> The application does not meet the minimum requirements.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
