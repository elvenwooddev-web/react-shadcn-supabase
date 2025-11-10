import { useState, type FormEvent } from 'react'
import { CheckCircle, XCircle, MessageSquare, AlertTriangle, Users } from 'lucide-react'
import { useApprovals } from '@/contexts/ApprovalContext'
import { useTeam } from '@/contexts/TeamContext'
import type { ApprovalRequest } from '@/types'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'

interface ApprovalActionDialogProps {
  request: ApprovalRequest
  open: boolean
  onOpenChange: (open: boolean) => void
  action: 'approve' | 'reject' | 'delegate'
}

export function ApprovalActionDialog({
  request,
  open,
  onOpenChange,
  action,
}: ApprovalActionDialogProps) {
  const { approveRequest, rejectRequest, delegateRequest } = useApprovals()
  const { teamMembers } = useTeam()

  const [comment, setComment] = useState('')
  const [rejectionReason, setRejectionReason] = useState('')
  const [delegateUserId, setDelegateUserId] = useState('')

  const currentConfig = request.approvalConfigs[request.currentApprovalLevel]
  const requireComment = currentConfig?.requireComment || false

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()

    if (action === 'approve') {
      if (requireComment && !comment.trim()) {
        alert('Comment is required for this approval')
        return
      }
      approveRequest(request.id, comment || undefined)
    } else if (action === 'reject') {
      if (!rejectionReason.trim()) {
        alert('Please provide a reason for rejection')
        return
      }
      rejectRequest(request.id, rejectionReason, comment || undefined)
    } else if (action === 'delegate') {
      if (!delegateUserId) {
        alert('Please select a user to delegate to')
        return
      }
      delegateRequest(request.id, delegateUserId)
    }

    // Reset and close
    setComment('')
    setRejectionReason('')
    setDelegateUserId('')
    onOpenChange(false)
  }

  const isLastInChain = request.currentApprovalLevel === request.approvalConfigs.length - 1
  const nextApprover = !isLastInChain
    ? request.approvalConfigs[request.currentApprovalLevel + 1]
    : null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {action === 'approve' && (
              <>
                <CheckCircle className="h-5 w-5 text-success" />
                Approve Request
              </>
            )}
            {action === 'reject' && (
              <>
                <XCircle className="h-5 w-5 text-danger" />
                Reject Request
              </>
            )}
            {action === 'delegate' && (
              <>
                <Users className="h-5 w-5 text-primary" />
                Delegate Approval
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {action === 'approve' && 'Approve this request and move forward in the workflow'}
            {action === 'reject' && 'Reject this request and provide feedback'}
            {action === 'delegate' && 'Assign this approval to another team member'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Request Info */}
          <div className="p-4 bg-muted rounded-lg space-y-2">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <p className="font-semibold text-sm">{request.entityName}</p>
                <p className="text-xs text-muted-foreground capitalize">
                  {request.entityType} • {request.stage}
                </p>
              </div>
              <Badge variant="outline" className="shrink-0">
                Level {request.currentApprovalLevel + 1} of {request.approvalConfigs.length}
              </Badge>
            </div>
            <div className="flex items-center gap-2 pt-2 border-t border-border">
              <Avatar src={request.requestedBy.avatar} className="size-5" />
              <span className="text-xs text-muted-foreground">
                Requested by <span className="font-medium">{request.requestedBy.name}</span>
              </span>
            </div>
          </div>

          {/* Approval Action Forms */}
          {action === 'approve' && (
            <div className="space-y-4">
              {!isLastInChain && nextApprover && (
                <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-lg text-sm">
                  <AlertTriangle className="h-4 w-4 text-primary shrink-0" />
                  <p className="text-muted-foreground">
                    After your approval, this will be sent to: <span className="font-medium text-foreground">{nextApprover.name}</span>
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="approve-comment">
                  Comment {requireComment && <span className="text-danger">*</span>}
                </Label>
                <Textarea
                  id="approve-comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder={requireComment ? 'Comment is required...' : 'Add a comment (optional)...'}
                  rows={3}
                  required={requireComment}
                />
              </div>
            </div>
          )}

          {action === 'reject' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="rejection-reason">Reason for Rejection*</Label>
                <Textarea
                  id="rejection-reason"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Explain why this is being rejected..."
                  rows={3}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reject-comment">Additional Comments</Label>
                <Textarea
                  id="reject-comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Provide guidance for resubmission..."
                  rows={2}
                />
              </div>

              <div className="flex items-center gap-2 p-3 bg-warning/10 rounded-lg text-sm">
                <AlertTriangle className="h-4 w-4 text-warning shrink-0" />
                <p className="text-muted-foreground">
                  Rejecting will stop the approval chain. The submitter will need to address the issues and resubmit.
                </p>
              </div>
            </div>
          )}

          {action === 'delegate' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="delegate-user">Delegate To*</Label>
                <select
                  id="delegate-user"
                  value={delegateUserId}
                  onChange={(e) => setDelegateUserId(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  required
                >
                  <option value="">Select team member...</option>
                  {teamMembers
                    .filter((tm) => tm.id !== request.assignedTo.id)
                    .map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.name} - {member.role}
                      </option>
                    ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="delegate-comment">Delegation Note</Label>
                <Textarea
                  id="delegate-comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Why are you delegating this approval?..."
                  rows={2}
                />
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            {action === 'approve' && (
              <Button type="submit" className="bg-success hover:bg-success/90 gap-2">
                <CheckCircle className="h-4 w-4" />
                Approve
              </Button>
            )}
            {action === 'reject' && (
              <Button type="submit" variant="destructive" className="gap-2">
                <XCircle className="h-4 w-4" />
                Reject
              </Button>
            )}
            {action === 'delegate' && (
              <Button type="submit" className="gap-2">
                <Users className="h-4 w-4" />
                Delegate
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
