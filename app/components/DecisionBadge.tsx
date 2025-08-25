// Decision badge component for loan status
import { Badge } from '@/app/components/ui/badge'

interface DecisionBadgeProps {
  status: 'submitted' | 'approved' | 'rejected' | 'needs_review'
}

export function DecisionBadge({ status }: DecisionBadgeProps) {
  // TODO: Implement decision badge with proper colors
  const variant = status === 'approved' ? 'approved' : 
                 status === 'rejected' ? 'rejected' :
                 status === 'needs_review' ? 'review' : 'pending'
  
  return <Badge variant={variant}>{status}</Badge>
}
