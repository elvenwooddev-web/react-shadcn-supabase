import { useState } from 'react'
import { useWorkflowRules } from '@/contexts/WorkflowRulesContext'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import type { RuleType, WorkflowStage, Department, StageTransitionRule, AutoAssignmentRule, ApprovalRule } from '@/types'

const WORKFLOW_STAGES: WorkflowStage[] = [
  'Sales',
  'Design',
  'Technical Design',
  'Procurement',
  'Production',
  'Execution',
  'Post Installation',
]

interface AddRuleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  scope: 'global' | 'project'
  projectId?: string
}

export function AddRuleDialog({ open, onOpenChange, scope, projectId }: AddRuleDialogProps) {
  const { createRule } = useWorkflowRules()

  const [step, setStep] = useState<'type' | 'configure'>(
    'type')
  const [ruleType, setRuleType] = useState<RuleType>('stage-transition')
  const [ruleName, setRuleName] = useState('')
  const [ruleDescription, setRuleDescription] = useState('')
  const [selectedStages, setSelectedStages] = useState<WorkflowStage[]>([])

  // Stage Transition Rule State
  const [requireAllTasksComplete, setRequireAllTasksComplete] = useState(true)
  const [requireAllFilesUploaded, setRequireAllFilesUploaded] = useState(false)
  const [requireAllDocsApproved, setRequireAllDocsApproved] = useState(false)
  const [minimumChecklistCompletion, setMinimumChecklistCompletion] = useState(0)
  const [requireDepartmentHeadApproval, setRequireDepartmentHeadApproval] = useState(false)
  const [blockStageSkipping, setBlockStageSkipping] = useState(true)
  const [autoActivateNextStage, setAutoActivateNextStage] = useState(true)
  const [notifyNextDepartment, setNotifyNextDepartment] = useState(true)

  // Auto-Assignment Rule State
  const [assignmentStrategy, setAssignmentStrategy] = useState<'department-head' | 'round-robin' | 'specific-role'>('department-head')
  const [targetRole, setTargetRole] = useState('')

  // Approval Rule State
  const [approverRole, setApproverRole] = useState<Department | 'project-manager' | 'admin'>('Admin')

  const handleCreate = () => {
    if (!ruleName.trim() || selectedStages.length === 0) return

    const baseRule = {
      name: ruleName,
      description: ruleDescription,
      enabled: true,
      scope,
      projectId: scope === 'project' ? projectId : undefined,
      applicableStages: selectedStages,
    }

    if (ruleType === 'stage-transition') {
      createRule({
        ...baseRule,
        ruleType: 'stage-transition',
        conditions: {
          requireAllTasksComplete,
          requireAllFilesUploaded,
          requireAllDocsApproved,
          minimumChecklistCompletion,
          requireDepartmentHeadApproval,
          blockStageSkipping,
        },
        actions: {
          autoActivateNextStage,
          notifyNextDepartment,
        },
      } as Omit<StageTransitionRule, 'id' | 'createdAt' | 'updatedAt'>)
    } else if (ruleType === 'auto-assignment') {
      createRule({
        ...baseRule,
        ruleType: 'auto-assignment',
        assignmentStrategy,
        targetRole: targetRole || undefined,
      } as Omit<AutoAssignmentRule, 'id' | 'createdAt' | 'updatedAt'>)
    } else if (ruleType === 'approval') {
      createRule({
        ...baseRule,
        ruleType: 'approval',
        approverRole,
        required: true,
      } as Omit<ApprovalRule, 'id' | 'createdAt' | 'updatedAt'>)
    }

    // Reset form
    setRuleName('')
    setRuleDescription('')
    setSelectedStages([])
    setStep('type')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Workflow Rule</DialogTitle>
          <DialogDescription>
            Create a new {scope === 'global' ? 'global' : 'project-specific'} workflow automation rule
          </DialogDescription>
        </DialogHeader>

        {step === 'type' ? (
          <div className="space-y-4">
            <Label>Select Rule Type</Label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { type: 'stage-transition', label: 'Stage Transition', desc: 'Control when stages can be completed' },
                { type: 'auto-assignment', label: 'Auto-Assignment', desc: 'Automatically assign tasks to team members' },
                { type: 'approval', label: 'Approval Required', desc: 'Require approvals before stage completion' },
                { type: 'validation', label: 'Validation', desc: 'Validate required items before progression' },
              ].map((option) => (
                <button
                  key={option.type}
                  onClick={() => setRuleType(option.type as RuleType)}
                  className={`p-4 rounded-lg border-2 transition-colors text-left ${
                    ruleType === option.type
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <p className="font-medium text-sm">{option.label}</p>
                  <p className="text-xs text-muted-foreground mt-1">{option.desc}</p>
                </button>
              ))}
            </div>
            <div className="flex justify-end">
              <Button onClick={() => setStep('configure')}>Next</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Basic Info */}
            <div className="space-y-2">
              <Label htmlFor="rule-name">Rule Name*</Label>
              <Input
                id="rule-name"
                value={ruleName}
                onChange={(e) => setRuleName(e.target.value)}
                placeholder="e.g., Require all tasks complete"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rule-description">Description</Label>
              <textarea
                id="rule-description"
                value={ruleDescription}
                onChange={(e) => setRuleDescription(e.target.value)}
                placeholder="Describe what this rule does..."
                className="flex min-h-16 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>

            {/* Applicable Stages */}
            <div className="space-y-2">
              <Label>Applicable Stages*</Label>
              <div className="grid grid-cols-2 gap-2">
                {WORKFLOW_STAGES.map((stage) => (
                  <label key={stage} className="flex items-center gap-2 p-2 rounded hover:bg-muted cursor-pointer">
                    <Checkbox
                      checked={selectedStages.includes(stage)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedStages([...selectedStages, stage])
                        } else {
                          setSelectedStages(selectedStages.filter(s => s !== stage))
                        }
                      }}
                    />
                    <span className="text-sm">{stage}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Type-Specific Configuration */}
            {ruleType === 'stage-transition' && (
              <div className="space-y-3 pt-4 border-t">
                <Label className="text-base">Conditions</Label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={requireAllTasksComplete}
                      onCheckedChange={(checked) => setRequireAllTasksComplete(!!checked)}
                    />
                    <span className="text-sm">Require all tasks completed</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={requireAllFilesUploaded}
                      onCheckedChange={(checked) => setRequireAllFilesUploaded(!!checked)}
                    />
                    <span className="text-sm">Require all files uploaded</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={requireAllDocsApproved}
                      onCheckedChange={(checked) => setRequireAllDocsApproved(!!checked)}
                    />
                    <span className="text-sm">Require all documents approved</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={requireDepartmentHeadApproval}
                      onCheckedChange={(checked) => setRequireDepartmentHeadApproval(!!checked)}
                    />
                    <span className="text-sm">Require department head approval</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={blockStageSkipping}
                      onCheckedChange={(checked) => setBlockStageSkipping(!!checked)}
                    />
                    <span className="text-sm">Block stage skipping</span>
                  </label>
                </div>

                <Label className="text-base mt-4">Actions</Label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={autoActivateNextStage}
                      onCheckedChange={(checked) => setAutoActivateNextStage(!!checked)}
                    />
                    <span className="text-sm">Auto-activate next stage on completion</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={notifyNextDepartment}
                      onCheckedChange={(checked) => setNotifyNextDepartment(!!checked)}
                    />
                    <span className="text-sm">Notify next department on handoff</span>
                  </label>
                </div>
              </div>
            )}

            {ruleType === 'auto-assignment' && (
              <div className="space-y-3 pt-4 border-t">
                <Label>Assignment Strategy</Label>
                <select
                  value={assignmentStrategy}
                  onChange={(e) => setAssignmentStrategy(e.target.value as any)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="department-head">Assign to Department Head</option>
                  <option value="round-robin">Round-robin among team</option>
                  <option value="specific-role">Assign to specific role</option>
                </select>
              </div>
            )}

            {ruleType === 'approval' && (
              <div className="space-y-3 pt-4 border-t">
                <Label>Approver Role</Label>
                <select
                  value={approverRole}
                  onChange={(e) => setApproverRole(e.target.value as any)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="Admin">Admin</option>
                  <option value="project-manager">Project Manager</option>
                  <option value="Sales">Sales Department</option>
                  <option value="Design">Design Department</option>
                  <option value="Technical">Technical Department</option>
                  <option value="Procurement">Procurement Department</option>
                  <option value="Production">Production Department</option>
                  <option value="Execution">Execution Department</option>
                </select>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="ghost" onClick={() => setStep('type')}>
                Back
              </Button>
              <Button onClick={handleCreate} disabled={!ruleName.trim() || selectedStages.length === 0}>
                Create Rule
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
