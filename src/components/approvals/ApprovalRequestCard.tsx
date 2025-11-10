import { useState } from 'react'
import { Shield, CheckCircle, XCircle, Clock, Users, MessageSquare, History, ChevronDown, ChevronUp } from 'lucide-react'
import { useApprovals } from '@/contexts/ApprovalContext'
import { useUser } from '@/contexts/UserContext'
import type { ApprovalRequest } from '@/types'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { ApprovalActionDialog } from './ApprovalActionDialog'
import { formatRelativeTime } from '@/lib/helpers'
import { cn } from '@/lib/utils'

interface ApprovalRequestCardProps {
  request: ApprovalRequest
  showActions?: boolean
}

export function ApprovalRequestCard({ request, showActions = true }: ApprovalRequestCardProps) {
  const { canApprove } = useApprovals()
  const { currentUser } = useUser()
  const [showHistory, setShowHistory] = useState(false)
  const [actionDialogOpen, setActionDialogOpen] = useState(false)
  const [selectedAction, setSelectedAction] = useState<'approve' | 'reject' | 'delegate'>('approve')

  const currentConfig = request.approvalConfigs[request.currentApprovalLevel]
  const canUserApprove = currentUser ? canApprove(request.id, currentUser.id) : false

  const statusColors = {
    pending: 'bg-warning/20 text-warning border-warning',
    approved: 'bg-success/20 text-success border-success',
    rejected: 'bg-danger/20 text-danger border-danger',
    expired: 'bg-muted text-muted-foreground border-border',
    delegated: 'bg-primary/20 text-primary border-primary',
  }

  const handleAction = (action: 'approve' | 'reject' | 'delegate') => {
    setSelectedAction(action)
    setActionDialogOpen(true)
  }

  return (
    <>
      <Card className={cn("border-2", request.status === 'pending' && canUserApprove && "border-primary/50")}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Shield className="h-4 w-4 text-primary shrink-0" />
                <h3 className="font-semibold text-sm truncate">{request.entityName}</h3>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className="text-xs capitalize">
                  {request.entityType}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {request.stage}
                </Badge>
                <Badge className={cn("text-xs border-2", statusColors[request.status])}>
                  {request.status}
                </Badge>
                {currentConfig?.required && (
                  <Badge variant="destructive" className="text-xs">
                    Required
                  </Badge>
                )}
                {/* Source Badge */}
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs",
                    request.source === 'template' && "bg-blue-500/10 text-blue-500 border-blue-500",
                    request.source === 'global-rule' && "bg-purple-500/10 text-purple-500 border-purple-500",
                    request.source === 'project-rule' && "bg-green-500/10 text-green-500 border-green-500",
                    request.source === 'manual' && "bg-orange-500/10 text-orange-500 border-orange-500"
                  )}
                >
                  {request.source === 'template' && '📋 Template'}
                  {request.source === 'global-rule' && '🌐 Global Rule'}
                  {request.source === 'project-rule' && '📁 Project Rule'}
                  {request.source === 'manual' && '✋ Manual'}
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Current Approval Level */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Current Approver</span>
              <Badge variant="outline">
                Level {request.currentApprovalLevel + 1} of {request.approvalConfigs.length}
              </Badge>
            </div>
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              <Avatar src={request.assignedTo.avatar} className="size-8" />
              <div className="flex-1">
                <p className="font-medium text-sm">{request.assignedTo.name}</p>
                <p className="text-xs text-muted-foreground">{currentConfig?.name || 'Approval'}</p>
              </div>
              {canUserApprove && (
                <Badge className="bg-primary/20 text-primary text-xs">You</Badge>
              )}
            </div>
          </div>

          {/* Approval Chain Progress */}
          {request.approvalConfigs.length > 1 && (
            <div className="space-y-2">
              <span className="text-sm text-muted-foreground">Approval Chain</span>
              <div className="flex items-center gap-1">
                {request.approvalConfigs.map((config, index) => (
                  <div key={config.id} className="flex items-center flex-1">
                    <div
                      className={cn(
                        "flex-1 h-2 rounded-full transition-colors",
                        index < request.currentApprovalLevel
                          ? "bg-success"
                          : index === request.currentApprovalLevel
                          ? "bg-primary"
                          : "bg-muted"
                      )}
                      title={`${config.name}${index < request.currentApprovalLevel ? ' (Approved)' : index === request.currentApprovalLevel ? ' (Current)' : ' (Pending)'}`}
                    />
                    {index < request.approvalConfigs.length - 1 && (
                      <div className="w-1 h-2 bg-border" />
                    )}
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{request.approvalConfigs[0].name}</span>
                <span>{request.approvalConfigs[request.approvalConfigs.length - 1].name}</span>
              </div>
            </div>
          )}

          {/* Comments */}
          {request.comments.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MessageSquare className="h-4 w-4" />
                <span>{request.comments.length} Comment{request.comments.length !== 1 ? 's' : ''}</span>
              </div>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {request.comments.slice(-3).map((comment) => (
                  <div key={comment.id} className="flex gap-2 p-2 bg-muted rounded text-xs">
                    <Avatar src={comment.author.avatar} className="size-5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{comment.author.name}</p>
                      <p className="text-muted-foreground">{comment.text}</p>
                      <p className="text-muted-foreground text-[10px] mt-1">
                        {formatRelativeTime(comment.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* History Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowHistory(!showHistory)}
            className="w-full gap-2"
          >
            <History className="h-3.5 w-3.5" />
            {showHistory ? 'Hide' : 'Show'} History ({request.history.length})
            {showHistory ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </Button>

          {/* History Timeline */}
          {showHistory && (
            <div className="space-y-2 max-h-48 overflow-y-auto border-t border-border pt-3">
              {request.history.map((entry, index) => (
                <div key={entry.id} className="flex gap-3 relative">
                  {index < request.history.length - 1 && (
                    <div className="absolute left-2 top-6 bottom-0 w-px bg-border" />
                  )}
                  <div className="size-4 rounded-full bg-primary flex items-center justify-center shrink-0 z-10">
                    <div className="size-1.5 rounded-full bg-background" />
                  </div>
                  <div className="flex-1 pb-3">
                    <p className="text-xs font-medium capitalize">{entry.action.replace('-', ' ')}</p>
                    <p className="text-xs text-muted-foreground">
                      {entry.actor.name} • {formatRelativeTime(entry.timestamp)}
                    </p>
                    {entry.note && (
                      <p className="text-xs text-muted-foreground mt-1 italic">"{entry.note}"</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          {showActions && canUserApprove && request.status === 'pending' && (
            <div className="flex items-center gap-2 pt-3 border-t border-border">
              <Button
                onClick={() => handleAction('approve')}
                className="flex-1 bg-success hover:bg-success/90 gap-2"
              >
                <CheckCircle className="h-4 w-4" />
                Approve
              </Button>
              <Button
                onClick={() => handleAction('reject')}
                variant="destructive"
                className="flex-1 gap-2"
              >
                <XCircle className="h-4 w-4" />
                Reject
              </Button>
              {currentConfig?.allowDelegation && (
                <Button
                  onClick={() => handleAction('delegate')}
                  variant="outline"
                  size="icon"
                  title="Delegate"
                >
                  <Users className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Dialog */}
      <ApprovalActionDialog
        request={request}
        open={actionDialogOpen}
        onOpenChange={setActionDialogOpen}
        action={selectedAction}
      />
    </>
  )
}
