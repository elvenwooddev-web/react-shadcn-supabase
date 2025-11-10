import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { useProjects } from '@/contexts/ProjectContext'
import { useApprovals } from '@/contexts/ApprovalContext'
import { useUser } from '@/contexts/UserContext'
import { useTeam } from '@/contexts/TeamContext'
import type { ApprovalRule, ApprovalRuleContextType, ApprovalEntityType, Task, StageDocument } from '@/types'
import { saveToLocalStorage, loadFromLocalStorage, generateId } from '@/lib/helpers'
import { getMatchingRules } from '@/lib/ruleEvaluator'

const ApprovalRuleContext = createContext<ApprovalRuleContextType | undefined>(undefined)

export function ApprovalRuleProvider({ children }: { children: ReactNode }) {
  const { currentProject } = useProjects()
  const { createApprovalRequest } = useApprovals()
  const { currentUser } = useUser()
  const { teamMembers } = useTeam()

  // Load approval rules
  const [approvalRules, setApprovalRules] = useState<ApprovalRule[]>(() => {
    const globalRules = loadFromLocalStorage<ApprovalRule[]>('approvalRules', [])
    const projectRules: Record<string, ApprovalRule[]> = loadFromLocalStorage('projectApprovalRules', {})

    // Merge global and current project rules
    const currentProjectRules = currentProject ? (projectRules[currentProject.id] || []) : []
    return [...globalRules, ...currentProjectRules]
  })

  // Persist to localStorage on changes
  useEffect(() => {
    const globalRules = approvalRules.filter((r) => r.scope === 'global')
    const projectRulesMap: Record<string, ApprovalRule[]> = {}

    approvalRules.filter((r) => r.scope === 'project').forEach((rule) => {
      if (rule.projectId) {
        if (!projectRulesMap[rule.projectId]) {
          projectRulesMap[rule.projectId] = []
        }
        projectRulesMap[rule.projectId].push(rule)
      }
    })

    saveToLocalStorage('approvalRules', globalRules)
    saveToLocalStorage('projectApprovalRules', projectRulesMap)
  }, [approvalRules])

  // Create new approval rule
  const createRule = (rule: Omit<ApprovalRule, 'id' | 'createdAt' | 'updatedAt'>): void => {
    const newRule: ApprovalRule = {
      ...rule,
      id: `rule-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    setApprovalRules((prev) => [...prev, newRule])
  }

  // Update existing rule
  const updateRule = (id: string, data: Partial<ApprovalRule>): void => {
    setApprovalRules((prev) =>
      prev.map((rule) =>
        rule.id === id ? { ...rule, ...data, updatedAt: new Date() } : rule
      )
    )
  }

  // Delete rule
  const deleteRule = (id: string): void => {
    setApprovalRules((prev) => prev.filter((rule) => rule.id !== id))
  }

  // Toggle rule enabled/disabled
  const toggleRule = (id: string): void => {
    setApprovalRules((prev) =>
      prev.map((rule) =>
        rule.id === id ? { ...rule, enabled: !rule.enabled, updatedAt: new Date() } : rule
      )
    )
  }

  // Get global rules
  const getGlobalRules = (): ApprovalRule[] => {
    return approvalRules.filter((rule) => rule.scope === 'global')
  }

  // Get project-specific rules
  const getProjectRules = (projectId: string): ApprovalRule[] => {
    return approvalRules.filter((rule) => rule.scope === 'project' && rule.projectId === projectId)
  }

  // Get active rules (enabled only)
  const getActiveRules = (scope?: 'global' | 'project', projectId?: string): ApprovalRule[] => {
    let rules = approvalRules.filter((rule) => rule.enabled)

    if (scope) {
      rules = rules.filter((rule) => rule.scope === scope)
    }

    if (projectId) {
      rules = rules.filter((rule) =>
        rule.scope === 'global' || (rule.scope === 'project' && rule.projectId === projectId)
      )
    }

    return rules
  }

  // Get rules by entity type
  const getRulesByEntityType = (entityType: ApprovalEntityType): ApprovalRule[] => {
    return approvalRules.filter((rule) => rule.entityType === entityType)
  }

  // Get matching rules for an entity
  const getMatchingRulesForEntity = (
    entity: Task | StageDocument | { stage: any; title?: string }
  ): ApprovalRule[] => {
    const entityType: ApprovalEntityType =
      'priority' in entity ? 'task' :
      'category' in entity ? 'document' :
      'stage'

    const activeRules = getActiveRules(undefined, currentProject?.id)
    return getMatchingRules(entity as any, activeRules, entityType)
  }

  // Apply rules to an entity and create approval requests
  const applyRulesToEntity = (entity: any, projectId: string): void => {
    if (!currentUser) return

    const matchingRules = getMatchingRulesForEntity(entity)

    for (const rule of matchingRules) {
      if (!rule.autoApply) continue

      // Assign first approver
      const firstConfig = rule.approvalConfigs[0]
      const approver = assignApprover(firstConfig)

      // Create approval request
      createApprovalRequest({
        projectId,
        source: rule.scope === 'global' ? 'global-rule' : 'project-rule',
        ruleId: rule.id,
        entityType: rule.entityType,
        entityId: entity.id,
        entityName: entity.title || entity.name || entity.stage,
        stage: entity.stage,
        status: 'pending',
        currentApprovalLevel: 0,
        approvalConfigs: rule.approvalConfigs,
        requestedBy: currentUser,
        requestedAt: new Date(),
        assignedTo: approver,
      })
    }
  }

  // Helper: Assign approver based on config
  const assignApprover = (config: any): any => {
    let approver = teamMembers[0]

    switch (config.approverType) {
      case 'department-head':
        approver = teamMembers.find((tm) =>
          tm.role.toLowerCase().includes(config.approverRole?.toLowerCase() || '')
        ) || teamMembers[0]
        break
      case 'project-manager':
        approver = teamMembers.find((tm) => tm.role.toLowerCase().includes('manager')) || teamMembers[0]
        break
      case 'admin':
        approver = teamMembers.find((tm) => tm.role.toLowerCase().includes('admin')) || teamMembers[0]
        break
      case 'specific-user':
        approver = teamMembers.find((tm) => tm.id === config.approverUserId) || teamMembers[0]
        break
      case 'client':
      case 'external':
        approver = {
          id: `${config.approverType}-${Date.now()}`,
          name: config.approverType === 'client' ? 'Client' : 'External Consultant',
          role: config.approverType === 'client' ? 'Client' : 'External Consultant',
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${config.approverType}`,
        }
        break
    }

    return approver
  }

  // Sync all rules to a project (apply to all existing entities)
  const syncRulesToProject = (projectId: string): number => {
    // This would need access to all tasks, documents, stages for the project
    // For now, return 0 as a placeholder
    // Full implementation would require injecting TaskContext, DocumentContext, StageContext
    return 0
  }

  const value: ApprovalRuleContextType = {
    approvalRules,
    createRule,
    updateRule,
    deleteRule,
    toggleRule,
    getGlobalRules,
    getProjectRules,
    getActiveRules,
    getRulesByEntityType,
    getMatchingRules: getMatchingRulesForEntity,
    applyRulesToEntity,
    syncRulesToProject,
  }

  return (
    <ApprovalRuleContext.Provider value={value}>
      {children}
    </ApprovalRuleContext.Provider>
  )
}

export function useApprovalRules() {
  const context = useContext(ApprovalRuleContext)
  if (context === undefined) {
    throw new Error('useApprovalRules must be used within an ApprovalRuleProvider')
  }
  return context
}
