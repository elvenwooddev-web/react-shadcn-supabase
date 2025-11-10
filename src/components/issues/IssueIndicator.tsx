import type { IssueSeverity } from '@/types'
import { AlertTriangle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface IssueIndicatorProps {
  count: number
  severity?: IssueSeverity
  size?: 'sm' | 'md' | 'lg'
}

export function IssueIndicator({ count, severity = 'medium', size = 'md' }: IssueIndicatorProps) {
  if (count === 0) return null

  // Severity-based styling
  const severityStyles = {
    low: 'bg-muted/50 text-foreground border-border',
    medium: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/50',
    high: 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/50',
    critical: 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/50',
  }

  const sizeStyles = {
    sm: 'h-4 w-4 text-xs',
    md: 'h-5 w-5 text-sm',
    lg: 'h-6 w-6 text-base',
  }

  const iconSize = {
    sm: 10,
    md: 12,
    lg: 14,
  }

  return (
    <Badge
      variant="outline"
      className={`flex items-center gap-1 border ${severityStyles[severity]}`}
    >
      <AlertTriangle className={sizeStyles[size]} size={iconSize[size]} />
      <span>{count}</span>
    </Badge>
  )
}
