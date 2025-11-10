import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { WorkflowRulesContextType, AnyWorkflowRule, WorkflowStage, StageTransitionRule } from '@/types'
import { generateId, saveToLocalStorage, loadFromLocalStorage } from '@/lib/helpers'
import { useProjects } from './ProjectContext'
import { useTasks } from './TaskContext'
import { useFiles } from './FileContext'
import { useDocuments } from './DocumentContext'
import { useApprovals } from './ApprovalContext'

// Default global rules
const defaultGlobalRules: AnyWorkflowRule[] = [
  {
    id: 'rule-default-1',
    name: 'Require All Tasks Complete',
    description: 'All tasks must be completed before moving to next stage',
    enabled: true,
    ruleType: 'stage-transition',
    scope: 'global',
    applicableStages: ['Sales', 'Design', 'Technical Design', 'Procurement', 'Production', 'Execution', 'Post Installation'],
    conditions: {
      requireAllTasksComplete: true,
      requireAllFilesUploaded: false,
      requireAllDocsApproved: false,
      minimumChecklistCompletion: 0,
      requireDepartmentHeadApproval: false,
      blockStageSkipping: true,
    },
    actions: {
      autoActivateNextStage: true,
      notifyNextDepartment: true,
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  } as StageTransitionRule,
]

const WorkflowRulesContext = createContext<WorkflowRulesContextType | undefined>(undefined)

export function WorkflowRulesProvider({ children }: { children: ReactNode }) {
  const { currentProject } = useProjects()
  const { tasks } = useTasks()
  const { files } = useFiles()
  const { documents } = useDocuments()
  const { getApprovalsByStage, getPendingApprovals } = useApprovals()

  const [globalRules, setGlobalRules] = useState<AnyWorkflowRule[]>(() =>
    loadFromLocalStorage('workflowRules', defaultGlobalRules)
  )

  const [projectRulesMap, setProjectRulesMap] = useState<Record<string, AnyWorkflowRule[]>>(() =>
    loadFromLocalStorage('projectWorkflowRules', {})
  )

  const projectRules = currentProject ? (projectRulesMap[currentProject.id] || []) : []
  const rules = [...globalRules, ...projectRules]

  useEffect(() => {
    saveToLocalStorage('workflowRules', globalRules)
  }, [globalRules])

  useEffect(() => {
    saveToLocalStorage('projectWorkflowRules', projectRulesMap)
  }, [projectRulesMap])

  const createRule = (ruleData: Omit<AnyWorkflowRule, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newRule: AnyWorkflowRule = {
      ...ruleData,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    } as AnyWorkflowRule

    if (newRule.scope === 'global') {
      setGlobalRules(prev => [...prev, newRule])
    } else if (newRule.scope === 'project' && currentProject) {
      setProjectRulesMap(prev => ({
        ...prev,
        [currentProject.id]: [...(prev[currentProject.id] || []), newRule]
      }))
    }
  }

  const updateRule = (id: string, data: Partial<AnyWorkflowRule>) => {
    const rule = rules.find(r => r.id === id)
    if (!rule) return

    if (rule.scope === 'global') {
      setGlobalRules(prev => prev.map(r =>
        r.id === id ? { ...r, ...data, updatedAt: new Date() } as AnyWorkflowRule : r
      ))
    } else if (rule.scope === 'project' && currentProject) {
      setProjectRulesMap(prev => ({
        ...prev,
        [currentProject.id]: (prev[currentProject.id] || []).map(r =>
          r.id === id ? { ...r, ...data, updatedAt: new Date() } as AnyWorkflowRule : r
        )
      }))
    }
  }

  const deleteRule = (id: string) => {
    const rule = rules.find(r => r.id === id)
    if (!rule) return

    if (rule.scope === 'global') {
      setGlobalRules(prev => prev.filter(r => r.id !== id))
    } else if (rule.scope === 'project' && currentProject) {
      setProjectRulesMap(prev => ({
        ...prev,
        [currentProject.id]: (prev[currentProject.id] || []).filter(r => r.id !== id)
      }))
    }
  }

  const toggleRuleEnabled = (id: string) => {
    const rule = rules.find(r => r.id === id)
    if (!rule) return

    updateRule(id, { enabled: !rule.enabled })
  }

  const getActiveRulesForStage = (stage: WorkflowStage): AnyWorkflowRule[] => {
    return rules.filter(rule =>
      rule.enabled &&
      ('applicableStages' in rule && rule.applicableStages.includes(stage))
    )
  }

  const canCompleteStage = (stage: WorkflowStage): { allowed: boolean; reasons: string[] } => {
    const activeRules = getActiveRulesForStage(stage)
    const reasons: string[] = []

    for (const rule of activeRules) {
      if (rule.ruleType === 'stage-transition') {
        const transitionRule = rule as StageTransitionRule

        if (transitionRule.conditions.requireAllTasksComplete) {
          const stageTasks = tasks.filter(t => t.stage === stage)
          const incompleteTasks = stageTasks.filter(t => t.status !== 'completed')
          if (incompleteTasks.length > 0) {
            reasons.push(`${incompleteTasks.length} task(s) not completed`)
          }
        }

        if (transitionRule.conditions.requireAllFilesUploaded) {
          const stageFiles = files.filter(f => f.requiredFrom === stage)
          const missingFiles = stageFiles.filter(f => f.status !== 'received')
          if (missingFiles.length > 0) {
            reasons.push(`${missingFiles.length} required file(s) not uploaded`)
          }
        }

        if (transitionRule.conditions.requireAllDocsApproved) {
          const stageDocs = documents.filter(d => d.stage === stage)
          const unapprovedDocs = stageDocs.filter(d => d.status !== 'approved')
          if (unapprovedDocs.length > 0) {
            reasons.push(`${unapprovedDocs.length} document(s) not approved`)
          }
        }
      }
    }

    // Always check required documents (regardless of workflow rules)
    const requiredDocs = documents.filter(d => d.stage === stage && d.requiredForProgression === true)
    const unapprovedRequiredDocs = requiredDocs.filter(d => d.status !== 'approved')
    if (unapprovedRequiredDocs.length > 0) {
      reasons.push(`${unapprovedRequiredDocs.length} required document(s) not approved`)
    }

    // Check for pending approvals for this stage
    const stageApprovals = getApprovalsByStage(stage)
    const pendingApprovals = stageApprovals.filter(
      (approval) => approval.status === 'pending' || approval.status === 'delegated'
    )
    if (pendingApprovals.length > 0) {
      reasons.push(`${pendingApprovals.length} approval(s) pending for this stage`)
    }

    for (const rule of activeRules) {

      if (rule.ruleType === 'approval') {
        // Approval logic would check approval status (can be extended)
        reasons.push(`Requires approval from ${rule.approverRole}`)
      }
    }

    return {
      allowed: reasons.length === 0,
      reasons
    }
  }

  const getMissingRequirements = (stage: WorkflowStage): string[] => {
    const { reasons } = canCompleteStage(stage)
    return reasons
  }

  return (
    <WorkflowRulesContext.Provider
      value={{
        rules,
        globalRules,
        projectRules,
        createRule,
        updateRule,
        deleteRule,
        toggleRuleEnabled,
        canCompleteStage,
        getMissingRequirements,
        getActiveRulesForStage,
      }}
    >
      {children}
    </WorkflowRulesContext.Provider>
  )
}

export function useWorkflowRules() {
  const context = useContext(WorkflowRulesContext)
  if (context === undefined) {
    throw new Error('useWorkflowRules must be used within a WorkflowRulesProvider')
  }
  return context
}
