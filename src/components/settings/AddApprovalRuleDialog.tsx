import { useState, type FormEvent } from 'react'
import { Plus, ArrowRight, ArrowLeft, Shield } from 'lucide-react'
import { useApprovalRules } from '@/contexts/ApprovalRuleContext'
import { useProjects } from '@/contexts/ProjectContext'
import { useTeam } from '@/contexts/TeamContext'
import type { ApprovalEntityType, ApproverType, WorkflowStage, TaskPriority, DocumentCategory, Department, ApprovalConfig } from '@/types'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'

interface AddApprovalRuleDialogProps {
  scope: 'global' | 'project'
  projectId?: string
}

export function AddApprovalRuleDialog({ scope, projectId }: AddApprovalRuleDialogProps) {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<1 | 2>(1)
  const { createRule } = useApprovalRules()
  const { teamMembers } = useTeam()

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    entityType: 'task' as ApprovalEntityType,
    enabled: true,
    autoApply: true,

    // Matching criteria
    stages: [] as WorkflowStage[],
    priority: [] as TaskPriority[],
    documentCategory: [] as DocumentCategory[],
    titlePattern: '',

    // Approval config
    approverType: 'department-head' as ApproverType,
    approverRole: 'Design' as Department | 'project-manager' | 'admin' | 'client',
    approverUserId: '',
    required: true,
    allowDelegation: false,
    requireComment: false,
    notifyApprover: true,
    autoReminder: true,
    reminderDays: 2,
  })

  const allStages: WorkflowStage[] = ['Sales', 'Design', 'Technical Design', 'Procurement', 'Production', 'Execution', 'Post Installation']
  const allPriorities: TaskPriority[] = ['low', 'medium', 'high', 'urgent']
  const allCategories: DocumentCategory[] = ['contract', 'report', 'specification', 'checklist']

  const toggleStage = (stage: WorkflowStage) => {
    setFormData(prev => ({
      ...prev,
      stages: prev.stages.includes(stage)
        ? prev.stages.filter(s => s !== stage)
        : [...prev.stages, stage]
    }))
  }

  const togglePriority = (priority: TaskPriority) => {
    setFormData(prev => ({
      ...prev,
      priority: prev.priority.includes(priority)
        ? prev.priority.filter(p => p !== priority)
        : [...prev.priority, priority]
    }))
  }

  const toggleCategory = (category: DocumentCategory) => {
    setFormData(prev => ({
      ...prev,
      documentCategory: prev.documentCategory.includes(category)
        ? prev.documentCategory.filter(c => c !== category)
        : [...prev.documentCategory, category]
    }))
  }

  const handleNext = () => {
    if (step === 1) {
      // Validate step 1
      const hasCriteria = formData.stages.length > 0 || formData.priority.length > 0 ||
                         formData.documentCategory.length > 0 || formData.titlePattern.length > 0
      if (!hasCriteria) {
        alert('Please select at least one matching criterion')
        return
      }
      setStep(2)
    }
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()

    // Create approval config
    const approvalConfig: ApprovalConfig = {
      id: `ac-${Date.now()}`,
      type: formData.entityType,
      name: formData.name || `${formData.approverType} approval`,
      description: formData.description,
      approverType: formData.approverType,
      approverRole: formData.approverRole,
      approverUserId: formData.approverUserId,
      required: formData.required,
      allowDelegation: formData.allowDelegation,
      requireComment: formData.requireComment,
      notifyApprover: formData.notifyApprover,
      autoReminder: formData.autoReminder,
      reminderDays: formData.reminderDays,
      order: 0,
    }

    createRule({
      name: formData.name,
      description: formData.description,
      enabled: formData.enabled,
      scope,
      projectId,
      entityType: formData.entityType,
      matchingCriteria: {
        stages: formData.stages.length > 0 ? formData.stages : undefined,
        priority: formData.priority.length > 0 ? formData.priority : undefined,
        documentCategory: formData.documentCategory.length > 0 ? formData.documentCategory : undefined,
        titlePattern: formData.titlePattern || undefined,
      },
      approvalConfigs: [approvalConfig],
      autoApply: formData.autoApply,
    })

    // Reset
    setFormData({
      name: '',
      description: '',
      entityType: 'task',
      enabled: true,
      autoApply: true,
      stages: [],
      priority: [],
      documentCategory: [],
      titlePattern: '',
      approverType: 'department-head',
      approverRole: 'Design',
      approverUserId: '',
      required: true,
      allowDelegation: false,
      requireComment: false,
      notifyApprover: true,
      autoReminder: true,
      reminderDays: 2,
    })
    setStep(1)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen)
      if (!isOpen) setStep(1)
    }}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Approval Rule
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Create Approval Rule - Step {step} of 2
          </DialogTitle>
          <DialogDescription>
            {step === 1 ? 'Define what items need approval' : 'Configure who must approve'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Matching Criteria */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rule-name">Rule Name*</Label>
                  <Input
                    id="rule-name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., High Priority Task Approval"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="entity-type">Apply To*</Label>
                  <select
                    id="entity-type"
                    value={formData.entityType}
                    onChange={(e) => setFormData({ ...formData, entityType: e.target.value as ApprovalEntityType })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    required
                  >
                    <option value="task">Tasks</option>
                    <option value="document">Documents</option>
                    <option value="stage">Stages</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe when this rule applies..."
                />
              </div>

              <div className="space-y-3 border-t pt-4">
                <Label className="text-sm font-semibold">Matching Criteria (select at least one)</Label>

                {/* Stages */}
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Workflow Stages</Label>
                  <div className="flex flex-wrap gap-2">
                    {allStages.map((stage) => (
                      <Badge
                        key={stage}
                        variant={formData.stages.includes(stage) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => toggleStage(stage)}
                      >
                        {stage}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Priority (for tasks) */}
                {formData.entityType === 'task' && (
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Task Priority</Label>
                    <div className="flex flex-wrap gap-2">
                      {allPriorities.map((priority) => (
                        <Badge
                          key={priority}
                          variant={formData.priority.includes(priority) ? "default" : "outline"}
                          className="cursor-pointer capitalize"
                          onClick={() => togglePriority(priority)}
                        >
                          {priority}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Document Category */}
                {formData.entityType === 'document' && (
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Document Category</Label>
                    <div className="flex flex-wrap gap-2">
                      {allCategories.map((category) => (
                        <Badge
                          key={category}
                          variant={formData.documentCategory.includes(category) ? "default" : "outline"}
                          className="cursor-pointer capitalize"
                          onClick={() => toggleCategory(category)}
                        >
                          {category}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Title Pattern */}
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Title Pattern (Optional)</Label>
                  <Input
                    value={formData.titlePattern}
                    onChange={(e) => setFormData({ ...formData, titlePattern: e.target.value })}
                    placeholder="e.g., Design|Review|Approval (regex supported)"
                  />
                  <p className="text-xs text-muted-foreground">
                    Leave empty to match all, or use regex pattern to match specific titles
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2 border-t pt-4">
                <Checkbox
                  id="auto-apply"
                  checked={formData.autoApply}
                  onCheckedChange={(checked) => setFormData({ ...formData, autoApply: checked as boolean })}
                />
                <label htmlFor="auto-apply" className="text-sm font-medium cursor-pointer">
                  Auto-apply to existing and new items
                </label>
              </div>
            </div>
          )}

          {/* Step 2: Approval Configuration */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <p className="text-sm font-medium mb-1">Rule Preview</p>
                <p className="text-xs text-muted-foreground">
                  This rule will apply to: {formData.entityType}s
                  {formData.stages.length > 0 && ` in ${formData.stages.join(', ')}`}
                  {formData.priority.length > 0 && ` with ${formData.priority.join(', ')} priority`}
                  {formData.documentCategory.length > 0 && ` (${formData.documentCategory.join(', ')})`}
                  {formData.titlePattern && ` matching "${formData.titlePattern}"`}
                </p>
              </div>

              {/* Approver Type */}
              <div className="space-y-2">
                <Label htmlFor="approver-type-rule">Who should approve?*</Label>
                <select
                  id="approver-type-rule"
                  value={formData.approverType}
                  onChange={(e) => setFormData({ ...formData, approverType: e.target.value as ApproverType })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  required
                >
                  <option value="department-head">Department Head</option>
                  <option value="project-manager">Project Manager</option>
                  <option value="admin">Admin</option>
                  <option value="specific-user">Specific Team Member</option>
                  <option value="client">Client</option>
                  <option value="external">External Consultant</option>
                </select>
              </div>

              {/* Department (for department-head) */}
              {formData.approverType === 'department-head' && (
                <div className="space-y-2">
                  <Label htmlFor="approver-role-rule">Department*</Label>
                  <select
                    id="approver-role-rule"
                    value={formData.approverRole}
                    onChange={(e) => setFormData({ ...formData, approverRole: e.target.value as any })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    required
                  >
                    <option value="Sales">Sales</option>
                    <option value="Design">Design</option>
                    <option value="Technical">Technical</option>
                    <option value="Procurement">Procurement</option>
                    <option value="Production">Production</option>
                    <option value="Execution">Execution</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
              )}

              {/* Specific User */}
              {formData.approverType === 'specific-user' && (
                <div className="space-y-2">
                  <Label htmlFor="approver-user-rule">Team Member*</Label>
                  <select
                    id="approver-user-rule"
                    value={formData.approverUserId}
                    onChange={(e) => setFormData({ ...formData, approverUserId: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    required
                  >
                    <option value="">Select team member...</option>
                    {teamMembers.map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.name} - {member.role}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Options */}
              <div className="space-y-3 border-t pt-3">
                <Label className="text-sm font-semibold">Approval Options</Label>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="rule-required"
                      checked={formData.required}
                      onCheckedChange={(checked) => setFormData({ ...formData, required: checked as boolean })}
                    />
                    <label htmlFor="rule-required" className="text-sm cursor-pointer">
                      Required (blocks progression)
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="rule-delegation"
                      checked={formData.allowDelegation}
                      onCheckedChange={(checked) => setFormData({ ...formData, allowDelegation: checked as boolean })}
                    />
                    <label htmlFor="rule-delegation" className="text-sm cursor-pointer">
                      Allow delegation
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="rule-comment"
                      checked={formData.requireComment}
                      onCheckedChange={(checked) => setFormData({ ...formData, requireComment: checked as boolean })}
                    />
                    <label htmlFor="rule-comment" className="text-sm cursor-pointer">
                      Require comment
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="rule-notify"
                      checked={formData.notifyApprover}
                      onCheckedChange={(checked) => setFormData({ ...formData, notifyApprover: checked as boolean })}
                    />
                    <label htmlFor="rule-notify" className="text-sm cursor-pointer">
                      Notify approver
                    </label>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="rule-reminder"
                      checked={formData.autoReminder}
                      onCheckedChange={(checked) => setFormData({ ...formData, autoReminder: checked as boolean })}
                    />
                    <label htmlFor="rule-reminder" className="text-sm cursor-pointer">
                      Auto-reminder after
                    </label>
                  </div>
                  {formData.autoReminder && (
                    <Input
                      type="number"
                      min="1"
                      value={formData.reminderDays}
                      onChange={(e) => setFormData({ ...formData, reminderDays: parseInt(e.target.value) || 2 })}
                      className="w-20 h-8"
                    />
                  )}
                  {formData.autoReminder && <span className="text-sm text-muted-foreground">days</span>}
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            {step === 2 && (
              <Button type="button" variant="outline" onClick={() => setStep(1)} className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            )}
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            {step === 1 ? (
              <Button type="button" onClick={handleNext} className="gap-2">
                Next
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button type="submit" className="gap-2">
                <Plus className="h-4 w-4" />
                Create Rule
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
