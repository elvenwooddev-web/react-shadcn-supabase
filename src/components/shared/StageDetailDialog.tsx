import { useState, useEffect, type FormEvent } from 'react'
import { Calendar, User, AlertCircle, CheckCircle, XCircle, FileText, Shield } from 'lucide-react'
import { useStages } from '@/contexts/StageContext'
import { useTeam } from '@/contexts/TeamContext'
import { useWorkflowRules } from '@/contexts/WorkflowRulesContext'
import { useDocuments } from '@/contexts/DocumentContext'
import { useApprovals } from '@/contexts/ApprovalContext'
import type { ProjectStage, StageStatus, TaskPriority } from '@/types'
import { ApprovalsList } from '@/components/approvals'
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
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

interface StageDetailDialogProps {
  stage: ProjectStage
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function StageDetailDialog({ stage, open, onOpenChange }: StageDetailDialogProps) {
  const { updateStage, getStageProgress } = useStages()
  const { teamMembers } = useTeam()
  const { canCompleteStage, getMissingRequirements } = useWorkflowRules()
  const { getRequiredDocumentsForStage, getApprovedRequiredDocuments, getTotalRequiredDocuments } = useDocuments()
  const { getApprovalsByStage } = useApprovals()

  const [formData, setFormData] = useState({
    status: stage.status,
    priority: stage.priority,
    startDate: stage.startDate || '',
    dueDate: stage.dueDate || '',
    departmentHeadId: stage.departmentHead?.id || '',
    notes: stage.notes || '',
  })

  const progress = getStageProgress(stage.stage)
  const requiredDocs = getRequiredDocumentsForStage(stage.stage)
  const approvedRequiredDocs = getApprovedRequiredDocuments(stage.stage)
  const totalRequiredDocs = getTotalRequiredDocuments(stage.stage)

  const stageApprovals = getApprovalsByStage(stage.stage)
  const pendingApprovals = stageApprovals.filter(
    (approval) => approval.status === 'pending' || approval.status === 'delegated'
  )
  const approvedCount = stageApprovals.filter((approval) => approval.status === 'approved').length

  useEffect(() => {
    if (open) {
      setFormData({
        status: stage.status,
        priority: stage.priority,
        startDate: stage.startDate || '',
        dueDate: stage.dueDate || '',
        departmentHeadId: stage.departmentHead?.id || '',
        notes: stage.notes || '',
      })
    }
  }, [open, stage])

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()

    const departmentHead = teamMembers.find(tm => tm.id === formData.departmentHeadId)

    updateStage(stage.id, {
      status: formData.status,
      priority: formData.priority,
      startDate: formData.startDate || null,
      dueDate: formData.dueDate || null,
      departmentHead: departmentHead || null,
      notes: formData.notes || undefined,
    })
    onOpenChange(false)
  }

  const statusColors: Record<StageStatus, string> = {
    pending: 'bg-muted text-muted-foreground',
    active: 'bg-primary/20 text-primary',
    completed: 'bg-success/20 text-success',
    blocked: 'bg-danger/20 text-danger',
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {stage.stage}
            <Badge className={statusColors[stage.status]}>{stage.status}</Badge>
          </DialogTitle>
          <DialogDescription>
            Manage stage details, timeline, and ownership
          </DialogDescription>
        </DialogHeader>

        {/* Stage Progress */}
        <div className="py-4 border-y border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Stage Progress</span>
            <span className="text-sm font-bold">{progress.percentComplete}%</span>
          </div>
          <Progress value={progress.percentComplete} />
          <p className="text-xs text-muted-foreground mt-2">
            {progress.tasksComplete} of {progress.tasksTotal} tasks completed
          </p>
        </div>

        {/* Approvals Section */}
        {stageApprovals.length > 0 && (
          <div className="py-4 border-y border-border">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Stage Approvals</span>
              </div>
              <div className="flex items-center gap-2">
                {pendingApprovals.length > 0 ? (
                  <span className="text-xs px-2 py-1 rounded-md bg-warning/20 text-warning">
                    {pendingApprovals.length} Pending
                  </span>
                ) : (
                  <span className="text-xs px-2 py-1 rounded-md bg-success/20 text-success">
                    All Approved
                  </span>
                )}
                <span className="text-sm font-bold">
                  {approvedCount}/{stageApprovals.length}
                </span>
              </div>
            </div>
            <ApprovalsList filterByStage={stage.stage} compact={true} />
          </div>
        )}

        {/* Required Documents */}
        {totalRequiredDocs > 0 && (
          <div className="py-4 border-y border-border">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Required Documents</span>
              </div>
              <span className="text-sm font-bold">
                {approvedRequiredDocs}/{totalRequiredDocs} Approved
              </span>
            </div>
            <Progress value={(approvedRequiredDocs / totalRequiredDocs) * 100} className="mb-3" />
            <div className="space-y-2">
              {requiredDocs.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between text-sm p-2 rounded-md bg-muted/50">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {doc.status === 'approved' ? (
                      <CheckCircle className="h-4 w-4 text-success shrink-0" />
                    ) : (
                      <XCircle className="h-4 w-4 text-warning shrink-0" />
                    )}
                    <span className="truncate">{doc.title}</span>
                  </div>
                  <Badge
                    variant={doc.status === 'approved' ? 'success' : doc.status === 'rejected' ? 'danger' : 'outline'}
                    className="text-xs shrink-0"
                  >
                    {doc.status}
                  </Badge>
                </div>
              ))}
            </div>
            {approvedRequiredDocs < totalRequiredDocs && (
              <p className="text-xs text-warning mt-2">
                All required documents must be approved before completing this stage
              </p>
            )}
          </div>
        )}

        {/* Requirements Checklist */}
        {stage.status !== 'completed' && (() => {
          const validation = canCompleteStage(stage.stage)
          const requirements = getMissingRequirements(stage.stage)

          if (requirements.length > 0) {
            return (
              <div className="py-4 border-y border-border bg-warning/5 px-4 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <AlertCircle className="h-4 w-4 text-warning" />
                  <span className="text-sm font-medium">Stage Completion Requirements</span>
                </div>
                <div className="space-y-2">
                  {requirements.map((req, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                      <XCircle className="h-4 w-4 text-danger shrink-0" />
                      <span className="text-muted-foreground">{req}</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  Complete these requirements before marking this stage as completed
                </p>
              </div>
            )
          } else if (stage.status === 'active') {
            return (
              <div className="py-4 border-y border-border bg-success/5 px-4 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-success" />
                  <span className="text-sm font-medium text-success">All requirements met - Ready to complete</span>
                </div>
              </div>
            )
          }
          return null
        })()}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stage-status">Status*</Label>
              <select
                id="stage-status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as StageStatus })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="pending">Pending</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="blocked">Blocked</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="stage-priority">Priority*</Label>
              <select
                id="stage-priority"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as TaskPriority })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stage-start">Start Date</Label>
              <Input
                id="stage-start"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stage-due">Due Date</Label>
              <Input
                id="stage-due"
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="stage-head">Department Head</Label>
            <select
              id="stage-head"
              value={formData.departmentHeadId}
              onChange={(e) => setFormData({ ...formData, departmentHeadId: e.target.value })}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">No department head assigned</option>
              {teamMembers.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name} - {member.role}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="stage-notes">Notes</Label>
            <textarea
              id="stage-notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Add notes about this stage..."
              className="flex min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
