'use client'

interface ReasonChipsProps {
  reasons: string[]
  maxDisplay?: number
}

export function ReasonChips({ reasons, maxDisplay = 6 }: ReasonChipsProps) {
  const displayReasons = reasons.slice(0, maxDisplay)
  const hasMore = reasons.length > maxDisplay

  return (
    <div className="flex flex-wrap gap-2">
      {displayReasons.map((reason, index) => (
        <span
          key={index}
          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
        >
          {reason}
        </span>
      ))}
      {hasMore && (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
          +{reasons.length - maxDisplay} more
        </span>
      )}
    </div>
  )
}
