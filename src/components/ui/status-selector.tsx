import * as LucideIcons from 'lucide-react'
import { useStatusConfig } from '@/contexts/StatusConfigContext'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { StatusBadge } from '@/components/ui/status-badge'
import type { StatusEntityType } from '@/types'
import { cn } from '@/lib/utils'

interface StatusSelectorProps {
  entityType: StatusEntityType
  value: string
  onChange: (value: string) => void
  currentStatus?: string // For transition validation
  validateTransitions?: boolean
  disabled?: boolean
  placeholder?: string
  className?: string
}

export function StatusSelector({
  entityType,
  value,
  onChange,
  currentStatus,
  validateTransitions = false,
  disabled = false,
  placeholder = 'Select status...',
  className,
}: StatusSelectorProps) {
  const { getActiveStatuses, getAllowedTransitions, getStatusConfig } = useStatusConfig()

  // Get available statuses
  const availableStatuses = validateTransitions && currentStatus
    ? getAllowedTransitions(entityType, currentStatus)
    : getActiveStatuses(entityType)

  const selectedConfig = getStatusConfig(entityType, value)

  // Render icon
  const renderIcon = (iconName?: string) => {
    if (!iconName) return null
    const IconComponent = (LucideIcons as any)[iconName]
    if (!IconComponent) return null
    return <IconComponent className="h-3.5 w-3.5" />
  }

  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger className={cn("w-full", className)}>
        <SelectValue placeholder={placeholder}>
          {selectedConfig && (
            <div className="flex items-center gap-2">
              {renderIcon(selectedConfig.icon)}
              <span>{selectedConfig.label}</span>
            </div>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {availableStatuses.map((config) => {
          const IconComponent = config.icon ? (LucideIcons as any)[config.icon] : null

          return (
            <SelectItem key={config.id} value={config.value}>
              <div className="flex items-center gap-2">
                {IconComponent && (
                  <div className="flex items-center justify-center">
                    <IconComponent
                      className="h-3.5 w-3.5"
                      style={{ color: config.color }}
                    />
                  </div>
                )}
                <span>{config.label}</span>
                <div
                  className="ml-auto size-3 rounded-full border border-border"
                  style={{ backgroundColor: config.color }}
                />
              </div>
            </SelectItem>
          )
        })}
        {availableStatuses.length === 0 && (
          <div className="p-2 text-xs text-muted-foreground text-center">
            No statuses available
          </div>
        )}
      </SelectContent>
    </Select>
  )
}

// Alternative version for native <select> elements (used in some dialogs)
interface StatusSelectProps {
  entityType: StatusEntityType
  value: string
  onChange: (value: string) => void
  currentStatus?: string
  validateTransitions?: boolean
  disabled?: boolean
  required?: boolean
  className?: string
}

export function StatusSelect({
  entityType,
  value,
  onChange,
  currentStatus,
  validateTransitions = false,
  disabled = false,
  required = false,
  className,
}: StatusSelectProps) {
  const { getActiveStatuses, getAllowedTransitions } = useStatusConfig()

  const availableStatuses = validateTransitions && currentStatus
    ? getAllowedTransitions(entityType, currentStatus)
    : getActiveStatuses(entityType)

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      required={required}
      className={cn(
        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
    >
      {!required && <option value="">None</option>}
      {availableStatuses.map((config) => (
        <option key={config.id} value={config.value}>
          {config.label}
        </option>
      ))}
    </select>
  )
}
