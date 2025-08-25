// Score chip component for decision scores
interface ScoreChipProps {
  score?: number
}

export function ScoreChip({ score }: ScoreChipProps) {
  // TODO: Implement score chip with color coding
  if (!score) return null

  return (
    <div className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100">
      Score: {score.toFixed(2)}
    </div>
  )
}
