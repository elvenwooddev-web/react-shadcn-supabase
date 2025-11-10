import { Shield, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react'
import { useApprovals } from '@/contexts/ApprovalContext'
import { Badge } from '@/components/ui/badge'
import type { ApprovalEntityType, ApprovalStatus } from '@/types'
import { cn } from '@/lib/utils'

interface ApprovalBadgeProps {
  entityType: ApprovalEntityType
  entityId: string
  showLabel?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const STATUS_CONFIG: Record<ApprovalStatus, { icon: any; label: string; color: string; bgColor: string }> = {
  pending: {
    icon: Clock,
    label: 'Pending Approval',
    color: 'text-warning',
    bgColor: 'bg-warning/20 border-warning',
  },
  approved: {
    icon: CheckCircle,
    label: 'Approved',
    color: 'text-success',
    bgColor: 'bg-success/20 border-success',
  },
  rejected: {
    icon: XCircle,
    label: 'Rejected',
    color: 'text-danger',
    bgColor: 'bg-danger/20 border-danger',
  },
  expired: {
    icon: AlertCircle,
    label: 'Expired',
    color: 'text-muted-foreground',
    bgColor: 'bg-muted border-border',
  },
  delegated: {
    icon: Clock,
    label: 'Delegated',
    color: 'text-primary',
    bgColor: 'bg-primary/20 border-primary',
  },
}

export function ApprovalBadge({
  entityType,
  entityId,
  showLabel = true,
  size = 'md',
  className,
}: ApprovalBadgeProps) {
  const { getApprovalStatus, getApprovalsByEntity } = useApprovals()

  const approvalStatus = getApprovalStatus(entityType, entityId)
  const entityApprovals = getApprovalsByEntity(entityType, entityId)

  // Don't show if no approvals configured
  if (!approvalStatus || entityApprovals.length === 0) {
    return null
  }

  const config = STATUS_CONFIG[approvalStatus]
  const Icon = config.icon

  // Count approved vs total for multi-level approvals
  const totalLevels = entityApprovals.reduce(
    (sum, req) => sum + req.approvalConfigs.length,
    0
  )
  const approvedLevels = entityApprovals.reduce((sum, req) => {
    if (req.status === 'approved') return sum + req.approvalConfigs.length
    return sum + req.currentApprovalLevel
  }, 0)

  const sizeClasses = {
    sm: 'text-[10px] h-5 px-1.5 gap-1',
    md: 'text-xs h-6 px-2 gap-1.5',
    lg: 'text-sm h-7 px-3 gap-2',
  }

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-3.5 w-3.5',
    lg: 'h-4 w-4',
  }

  return (
    <Badge
      variant="outline"
      className={cn(
        'font-medium border-2',
        config.bgColor,
        config.color,
        sizeClasses[size],
        className
      )}
    >
      <Icon className={iconSizes[size]} />
      {showLabel && (
        <span>
          {config.label}
          {totalLevels > 1 && approvalStatus === 'pending' && (
            <span className="ml-1 opacity-70">
              ({approvedLevels}/{totalLevels})
            </span>
          )}
        </span>
      )}
    </Badge>
  )
}

// Simplified version for icon-only display
export function ApprovalIcon({
  entityType,
  entityId,
  className,
}: {
  entityType: ApprovalEntityType
  entityId: string
  className?: string
}) {
  const { getApprovalStatus } = useApprovals()

  const approvalStatus = getApprovalStatus(entityType, entityId)
  if (!approvalStatus) return null

  const config = STATUS_CONFIG[approvalStatus]
  const Icon = config.icon

  return (
    <div
      className={cn('flex items-center justify-center', config.color, className)}
      title={config.label}
    >
      <Icon className="h-4 w-4" />
    </div>
  )
}
