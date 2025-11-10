import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { StatusConfig, StatusConfigContextType, StatusEntityType } from '@/types'
import { saveToLocalStorage, loadFromLocalStorage } from '@/lib/helpers'

const StatusConfigContext = createContext<StatusConfigContextType | undefined>(undefined)

// Default status configurations for all entity types
const DEFAULT_STATUS_CONFIGS: StatusConfig[] = [
  // Task Statuses
  {
    id: 'task-todo',
    entityType: 'task',
    value: 'todo',
    label: 'To Do',
    color: '#9CA3AF',
    icon: 'Circle',
    order: 0,
    isDefault: true,
    isActive: true,
    allowedTransitions: ['in-progress', 'blocked'],
    autoActions: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'task-in-progress',
    entityType: 'task',
    value: 'in-progress',
    label: 'In Progress',
    color: '#3B82F6',
    icon: 'Loader',
    order: 1,
    isDefault: false,
    isActive: true,
    allowedTransitions: ['completed', 'blocked', 'todo'],
    autoActions: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'task-completed',
    entityType: 'task',
    value: 'completed',
    label: 'Completed',
    color: '#10B981',
    icon: 'CheckCircle',
    order: 2,
    isDefault: false,
    isActive: true,
    allowedTransitions: ['todo'], // Can reopen
    autoActions: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'task-blocked',
    entityType: 'task',
    value: 'blocked',
    label: 'Blocked',
    color: '#EF4444',
    icon: 'AlertTriangle',
    order: 3,
    isDefault: false,
    isActive: true,
    allowedTransitions: ['todo', 'in-progress'],
    autoActions: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  // Subtask Statuses (same as task)
  {
    id: 'subtask-todo',
    entityType: 'subtask',
    value: 'todo',
    label: 'To Do',
    color: '#9CA3AF',
    icon: 'Circle',
    order: 0,
    isDefault: true,
    isActive: true,
    allowedTransitions: ['in-progress', 'blocked'],
    autoActions: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'subtask-in-progress',
    entityType: 'subtask',
    value: 'in-progress',
    label: 'In Progress',
    color: '#3B82F6',
    icon: 'Loader',
    order: 1,
    isDefault: false,
    isActive: true,
    allowedTransitions: ['completed', 'blocked', 'todo'],
    autoActions: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'subtask-completed',
    entityType: 'subtask',
    value: 'completed',
    label: 'Completed',
    color: '#10B981',
    icon: 'CheckCircle',
    order: 2,
    isDefault: false,
    isActive: true,
    allowedTransitions: ['todo'],
    autoActions: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'subtask-blocked',
    entityType: 'subtask',
    value: 'blocked',
    label: 'Blocked',
    color: '#EF4444',
    icon: 'AlertTriangle',
    order: 3,
    isDefault: false,
    isActive: true,
    allowedTransitions: ['todo', 'in-progress'],
    autoActions: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  // Issue Statuses
  {
    id: 'issue-open',
    entityType: 'issue',
    value: 'open',
    label: 'Open',
    color: '#F59E0B',
    icon: 'AlertCircle',
    order: 0,
    isDefault: true,
    isActive: true,
    allowedTransitions: ['in-progress', 'closed'],
    autoActions: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'issue-in-progress',
    entityType: 'issue',
    value: 'in-progress',
    label: 'In Progress',
    color: '#3B82F6',
    icon: 'Loader',
    order: 1,
    isDefault: false,
    isActive: true,
    allowedTransitions: ['resolved', 'open'],
    autoActions: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'issue-resolved',
    entityType: 'issue',
    value: 'resolved',
    label: 'Resolved',
    color: '#10B981',
    icon: 'CheckCircle',
    order: 2,
    isDefault: false,
    isActive: true,
    allowedTransitions: ['closed', 'open'],
    autoActions: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'issue-closed',
    entityType: 'issue',
    value: 'closed',
    label: 'Closed',
    color: '#6B7280',
    icon: 'XCircle',
    order: 3,
    isDefault: false,
    isActive: true,
    allowedTransitions: ['open'], // Can reopen
    autoActions: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  // Stage Statuses
  {
    id: 'stage-pending',
    entityType: 'stage',
    value: 'pending',
    label: 'Pending',
    color: '#9CA3AF',
    icon: 'Circle',
    order: 0,
    isDefault: true,
    isActive: true,
    allowedTransitions: ['active'],
    autoActions: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'stage-active',
    entityType: 'stage',
    value: 'active',
    label: 'Active',
    color: '#3B82F6',
    icon: 'PlayCircle',
    order: 1,
    isDefault: false,
    isActive: true,
    allowedTransitions: ['completed', 'blocked'],
    autoActions: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'stage-completed',
    entityType: 'stage',
    value: 'completed',
    label: 'Completed',
    color: '#10B981',
    icon: 'CheckCircle',
    order: 2,
    isDefault: false,
    isActive: true,
    allowedTransitions: ['active'], // Can revert if needed
    autoActions: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'stage-blocked',
    entityType: 'stage',
    value: 'blocked',
    label: 'Blocked',
    color: '#EF4444',
    icon: 'AlertTriangle',
    order: 3,
    isDefault: false,
    isActive: true,
    allowedTransitions: ['active', 'pending'],
    autoActions: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  // Document Statuses
  {
    id: 'doc-pending',
    entityType: 'document',
    value: 'pending',
    label: 'Pending',
    color: '#F59E0B',
    icon: 'Clock',
    order: 0,
    isDefault: true,
    isActive: true,
    allowedTransitions: ['uploaded'],
    autoActions: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'doc-uploaded',
    entityType: 'document',
    value: 'uploaded',
    label: 'Uploaded',
    color: '#3B82F6',
    icon: 'Upload',
    order: 1,
    isDefault: false,
    isActive: true,
    allowedTransitions: ['approved', 'rejected'],
    autoActions: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'doc-approved',
    entityType: 'document',
    value: 'approved',
    label: 'Approved',
    color: '#10B981',
    icon: 'FileCheck',
    order: 2,
    isDefault: false,
    isActive: true,
    allowedTransitions: ['rejected'], // Can reject after approval
    autoActions: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'doc-rejected',
    entityType: 'document',
    value: 'rejected',
    label: 'Rejected',
    color: '#EF4444',
    icon: 'XCircle',
    order: 3,
    isDefault: false,
    isActive: true,
    allowedTransitions: ['uploaded', 'pending'],
    autoActions: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  // File Statuses
  {
    id: 'file-pending',
    entityType: 'file',
    value: 'pending',
    label: 'Pending',
    color: '#F59E0B',
    icon: 'Clock',
    order: 0,
    isDefault: true,
    isActive: true,
    allowedTransitions: ['received', 'missing'],
    autoActions: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'file-received',
    entityType: 'file',
    value: 'received',
    label: 'Received',
    color: '#10B981',
    icon: 'CheckCircle',
    order: 1,
    isDefault: false,
    isActive: true,
    allowedTransitions: ['missing'], // Mark as missing if lost
    autoActions: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'file-missing',
    entityType: 'file',
    value: 'missing',
    label: 'Missing',
    color: '#EF4444',
    icon: 'FileX',
    order: 2,
    isDefault: false,
    isActive: true,
    allowedTransitions: ['pending', 'received'],
    autoActions: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  // Project Statuses
  {
    id: 'project-active',
    entityType: 'project',
    value: 'active',
    label: 'Active',
    color: '#10B981',
    icon: 'PlayCircle',
    order: 0,
    isDefault: true,
    isActive: true,
    allowedTransitions: ['on-hold', 'completed'],
    autoActions: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'project-on-hold',
    entityType: 'project',
    value: 'on-hold',
    label: 'On Hold',
    color: '#F59E0B',
    icon: 'Pause',
    order: 1,
    isDefault: false,
    isActive: true,
    allowedTransitions: ['active', 'archived'],
    autoActions: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'project-completed',
    entityType: 'project',
    value: 'completed',
    label: 'Completed',
    color: '#3B82F6',
    icon: 'CheckCircle2',
    order: 2,
    isDefault: false,
    isActive: true,
    allowedTransitions: ['archived'],
    autoActions: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'project-archived',
    entityType: 'project',
    value: 'archived',
    label: 'Archived',
    color: '#6B7280',
    icon: 'Archive',
    order: 3,
    isDefault: false,
    isActive: true,
    allowedTransitions: ['active'], // Can restore
    autoActions: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

export function StatusConfigProvider({ children }: { children: ReactNode }) {
  const [statusConfigs, setStatusConfigs] = useState<StatusConfig[]>(() =>
    loadFromLocalStorage('statusConfigurations', DEFAULT_STATUS_CONFIGS)
  )

  // Persist to localStorage on changes
  useEffect(() => {
    saveToLocalStorage('statusConfigurations', statusConfigs)
  }, [statusConfigs])

  // Get all status configs for an entity type
  const getStatusConfigs = (entityType: StatusEntityType): StatusConfig[] => {
    return statusConfigs
      .filter((config) => config.entityType === entityType)
      .sort((a, b) => a.order - b.order)
  }

  // Get specific status config
  const getStatusConfig = (
    entityType: StatusEntityType,
    value: string
  ): StatusConfig | undefined => {
    return statusConfigs.find(
      (config) => config.entityType === entityType && config.value === value
    )
  }

  // Get only active statuses
  const getActiveStatuses = (entityType: StatusEntityType): StatusConfig[] => {
    return getStatusConfigs(entityType).filter((config) => config.isActive)
  }

  // Get default status for entity type
  const getDefaultStatus = (entityType: StatusEntityType): StatusConfig | undefined => {
    return statusConfigs.find(
      (config) => config.entityType === entityType && config.isDefault
    )
  }

  // Create new status
  const createStatus = (
    config: Omit<StatusConfig, 'id' | 'createdAt' | 'updatedAt'>
  ): void => {
    const newStatus: StatusConfig = {
      ...config,
      id: `${config.entityType}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    setStatusConfigs((prev) => [...prev, newStatus])
  }

  // Update existing status
  const updateStatus = (id: string, data: Partial<StatusConfig>): void => {
    setStatusConfigs((prev) =>
      prev.map((config) =>
        config.id === id
          ? { ...config, ...data, updatedAt: new Date() }
          : config
      )
    )
  }

  // Delete status
  const deleteStatus = (id: string): void => {
    setStatusConfigs((prev) => prev.filter((config) => config.id !== id))
  }

  // Reorder statuses for an entity type
  const reorderStatuses = (entityType: StatusEntityType, statusIds: string[]): void => {
    setStatusConfigs((prev) => {
      const otherStatuses = prev.filter((config) => config.entityType !== entityType)
      const reorderedStatuses = statusIds
        .map((id, index) => {
          const config = prev.find((c) => c.id === id)
          return config ? { ...config, order: index, updatedAt: new Date() } : null
        })
        .filter(Boolean) as StatusConfig[]

      return [...otherStatuses, ...reorderedStatuses]
    })
  }

  // Check if transition is allowed
  const canTransition = (
    entityType: StatusEntityType,
    fromStatus: string,
    toStatus: string
  ): boolean => {
    const toConfig = getStatusConfig(entityType, toStatus)
    if (!toConfig) return false

    // If no allowedTransitions defined, allow all
    if (!toConfig.allowedTransitions || toConfig.allowedTransitions.length === 0) {
      return true
    }

    // Check if fromStatus is in allowedTransitions
    return toConfig.allowedTransitions.includes(fromStatus)
  }

  // Get all statuses that can be transitioned to from current status
  const getAllowedTransitions = (
    entityType: StatusEntityType,
    fromStatus: string
  ): StatusConfig[] => {
    return getActiveStatuses(entityType).filter((config) =>
      canTransition(entityType, fromStatus, config.value)
    )
  }

  // Reset to default configurations
  const resetToDefaults = (entityType: StatusEntityType): void => {
    const defaultConfigs = DEFAULT_STATUS_CONFIGS.filter(
      (config) => config.entityType === entityType
    )
    setStatusConfigs((prev) => [
      ...prev.filter((config) => config.entityType !== entityType),
      ...defaultConfigs,
    ])
  }

  // Get usage count for a status (placeholder - would need to scan all data)
  const getStatusUsageCount = (statusId: string): number => {
    // TODO: Implement by scanning tasks, issues, stages, etc.
    // For now, return 0 as placeholder
    return 0
  }

  const value: StatusConfigContextType = {
    statusConfigs,
    getStatusConfigs,
    getStatusConfig,
    getActiveStatuses,
    getDefaultStatus,
    createStatus,
    updateStatus,
    deleteStatus,
    reorderStatuses,
    canTransition,
    getAllowedTransitions,
    resetToDefaults,
    getStatusUsageCount,
  }

  return (
    <StatusConfigContext.Provider value={value}>
      {children}
    </StatusConfigContext.Provider>
  )
}

export function useStatusConfig() {
  const context = useContext(StatusConfigContext)
  if (context === undefined) {
    throw new Error('useStatusConfig must be used within a StatusConfigProvider')
  }
  return context
}
