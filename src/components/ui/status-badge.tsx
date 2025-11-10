import * as LucideIcons from 'lucide-react'
import { useStatusConfig } from '@/contexts/StatusConfigContext'
import { Badge } from '@/components/ui/badge'
import type { StatusEntityType } from '@/types'
import { cn } from '@/lib/utils'

interface StatusBadgeProps {
  entityType: StatusEntityType
  status: string
  size?: 'sm' | 'md' | 'lg'
  showIcon?: boolean
  className?: string
}

export function StatusBadge({
  entityType,
  status,
  size = 'md',
  showIcon = true,
  className,
}: StatusBadgeProps) {
  const { getStatusConfig } = useStatusConfig()
  const config = getStatusConfig(entityType, status)

  // If no config found, show fallback
  if (!config) {
    return (
      <Badge variant="outline" className={cn("capitalize", className)}>
        {status}
      </Badge>
    )
  }

  // Get icon component if icon name is provided
  const IconComponent = config.icon ? (LucideIcons as any)[config.icon] : null

  // Convert hex color to OKLCH/RGB for bg and text
  const getBgColor = (hex: string) => {
    // Add opacity to background
    return `${hex}20` // 20% opacity
  }

  const sizeClasses = {
    sm: 'text-[10px] h-5 px-1.5 gap-1',
    md: 'text-xs h-6 px-2 gap-1.5',
    lg: 'text-sm h-7 px-3 gap-2',
  }

  const iconSizes = {
    sm: 'h-2.5 w-2.5',
    md: 'h-3 w-3',
    lg: 'h-3.5 w-3.5',
  }

  return (
    <Badge
      variant="outline"
      className={cn(
        "font-medium border-2",
        sizeClasses[size],
        className
      )}
      style={{
        backgroundColor: getBgColor(config.color),
        borderColor: config.color,
        color: config.color,
      }}
    >
      {showIcon && IconComponent && (
        <IconComponent className={iconSizes[size]} />
      )}
      {config.label}
    </Badge>
  )
}
