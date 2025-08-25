import { cn } from "@/app/lib/utils"

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'approved' | 'rejected' | 'pending' | 'review'
  className?: string
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        {
          'bg-gray-100 text-gray-800': variant === 'default',
          'bg-green-100 text-green-800': variant === 'approved',
          'bg-red-100 text-red-800': variant === 'rejected',
          'bg-yellow-100 text-yellow-800': variant === 'pending',
          'bg-blue-100 text-blue-800': variant === 'review',
        },
        className
      )}
    >
      {children}
    </span>
  )
}
