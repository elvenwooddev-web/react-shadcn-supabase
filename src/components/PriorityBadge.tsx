import { Badge } from '@/components/ui/badge'
import type { TaskPriority } from '@/types'
import { AlertCircle, ArrowUp, Minus, Zap } from 'lucide-react'

const priorityConfig = {
  low: { label: 'Low', color: 'bg-muted text-muted-foreground', Icon: Minus },
  medium: { label: 'Medium', color: 'bg-primary/20 text-primary', Icon: ArrowUp },
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
