import { Badge } from '@/components/ui/badge'
import type { TaskPriority } from '@/types'
import { AlertCircle, ArrowUp, Minus, Zap } from 'lucide-react'

const priorityConfig = {
  low: { label: 'Low', color: 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300', Icon: Minus },
  medium: { label: 'Medium', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400', Icon: ArrowUp },
  high: { label: 'High', color: 'bg-warning/20 text-warning', Icon: AlertCircle },
  urgent: { label: 'Urgent', color: 'bg-danger/20 text-danger', Icon: Zap },
}

interface PriorityBadgeProps {
  priority: TaskPriority
  showIcon?: boolean
}

export function PriorityBadge({ priority, showIcon = true }: PriorityBadgeProps) {
  const config = priorityConfig[priority]
  const Icon = config.Icon

  return (
    <Badge className={`${config.color} border-0 flex items-center gap-1`}>
      {showIcon && <Icon className="h-3 w-3" />}
      <span>{config.label}</span>
    </Badge>
  )
}
