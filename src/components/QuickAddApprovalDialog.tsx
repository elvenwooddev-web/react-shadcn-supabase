import { useState, type FormEvent } from 'react'
import { Shield, Plus } from 'lucide-react'
import { useApprovals } from '@/contexts/ApprovalContext'
import { useUser } from '@/contexts/UserContext'
import { useTeam } from '@/contexts/TeamContext'
import { useProjects } from '@/contexts/ProjectContext'
import type { ApprovalEntityType, ApproverType, WorkflowStage, Department } from '@/types'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'

interface QuickAddApprovalDialogProps {
  entityType: ApprovalEntityType
  entityId: string
  entityName: string
  stage: WorkflowStage
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function QuickAddApprovalDialog({
  entityType,
  entityId,
  entityName,
  stage,
  open,
  onOpenChange,
}: QuickAddApprovalDialogProps) {
  const { createApprovalRequest } = useApprovals()
  const { currentUser } = useUser()
  const { teamMembers } = useTeam()
  const { currentProject } = useProjects()

  const [formData, setFormData] = useState({
    approverType: 'department-head' as ApproverType,
    approverRole: 'Design' as Department | 'project-manager' | 'admin' | 'client',
    approverUserId: '',
    required: true,
    allowDelegation: false,
    requireComment: false,
    name: '',
  })

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()

    if (!currentUser || !currentProject) return

    // Find approver based on type
    let approver = teamMembers[0]

    switch (formData.approverType) {
      case 'department-head':
        approver = teamMembers.find((tm) =>
          tm.role.toLowerCase().includes(formData.approverRole.toLowerCase())
        ) || teamMembers[0]
        break
      case 'project-manager':
        approver = teamMembers.find((tm) => tm.role.toLowerCase().includes('manager')) || teamMembers[0]
        break
      case 'admin':
        approver = teamMembers.find((tm) => tm.role.toLowerCase().includes('admin')) || teamMembers[0]
        break
      case 'specific-user':
        approver = teamMembers.find((tm) => tm.id === formData.approverUserId) || teamMembers[0]
        break
      case 'client':
        approver = {
          id: 'client-' + Date.now(),
          name: 'Client',
          role: 'Client',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Client',
        }
        break
      case 'external':
        approver = {
          id: 'external-' + Date.now(),
          name: 'External Consultant',
          role: 'External Consultant',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=External',
        }
        break
    }

    // Create approval config
    const approvalConfig = {
      id: `ac-${Date.now()}`,
      type: entityType,
      name: formData.name || `${formData.approverType} approval`,
      approverType: formData.approverType,
      approverRole: formData.approverRole,
      approverUserId: formData.approverUserId,
      required: formData.required,
      allowDelegation: formData.allowDelegation,
      requireComment: formData.requireComment,
      notifyApprover: true,
      autoReminder: false,
      order: 0,
    }

    // Create approval request
    createApprovalRequest({
      projectId: currentProject.id,
      source: 'manual',
      entityType,
      entityId,
      entityName,
      stage,
      status: 'pending',
      currentApprovalLevel: 0,
      approvalConfigs: [approvalConfig],
      requestedBy: currentUser,
      requestedAt: new Date(),
      assignedTo: approver,
    })

    // Reset and close
    setFormData({
      approverType: 'department-head',
      approverRole: 'Design',
      approverUserId: '',
      required: true,
      allowDelegation: false,
      requireComment: false,
      name: '',
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Require Approval
          </DialogTitle>
          <DialogDescription>
            Add approval requirement for: <span className="font-semibold">{entityName}</span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Approval Name */}
          <div className="space-y-2">
            <Label htmlFor="approval-name">Approval Name (Optional)</Label>
            <Input
              id="approval-name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Design Review, Budget Approval"
            />
          </div>

          {/* Approver Type */}
          <div className="space-y-2">
            <Label htmlFor="approver-type">Who should approve?*</Label>
            <select
              id="approver-type"
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

          {/* Department/Role Selector (for department-head) */}
          {formData.approverType === 'department-head' && (
            <div className="space-y-2">
              <Label htmlFor="approver-role">Department*</Label>
              <select
                id="approver-role"
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

          {/* Specific User Selector */}
          {formData.approverType === 'specific-user' && (
            <div className="space-y-2">
              <Label htmlFor="approver-user">Team Member*</Label>
              <select
                id="approver-user"
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
            <div className="flex items-center space-x-2">
              <Checkbox
                id="required"
                checked={formData.required}
                onCheckedChange={(checked) => setFormData({ ...formData, required: checked as boolean })}
              />
              <label htmlFor="required" className="text-sm font-medium leading-none cursor-pointer">
                Required (blocks progression if not approved)
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="allow-delegation"
                checked={formData.allowDelegation}
                onCheckedChange={(checked) => setFormData({ ...formData, allowDelegation: checked as boolean })}
              />
              <label htmlFor="allow-delegation" className="text-sm font-medium leading-none cursor-pointer">
                Allow approver to delegate
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="require-comment"
                checked={formData.requireComment}
                onCheckedChange={(checked) => setFormData({ ...formData, requireComment: checked as boolean })}
              />
              <label htmlFor="require-comment" className="text-sm font-medium leading-none cursor-pointer">
                Require comment when approving
              </label>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Approval
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
