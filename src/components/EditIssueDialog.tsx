import { useState } from 'react'
import type { Issue, IssueSeverity, IssueStatus } from '@/types'
import { useIssues } from '@/contexts/IssueContext'
import { useTeam } from '@/contexts/TeamContext'
import { useUser } from '@/contexts/UserContext'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { AlertTriangle, Trash2, MessageSquare, Send, CheckCircle, XCircle } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'

interface EditIssueDialogProps {
  issue: Issue
  isOpen: boolean
  onClose: () => void
}

export function EditIssueDialog({ issue, isOpen, onClose }: EditIssueDialogProps) {
  const { updateIssue, deleteIssue, resolveIssue, reopenIssue, addComment, deleteComment } = useIssues()
  const { teamMembers } = useTeam()
  const { currentUser } = useUser()
  const [title, setTitle] = useState(issue.title)
  const [description, setDescription] = useState(issue.description)
  const [severity, setSeverity] = useState<IssueSeverity>(issue.severity)
  const [status, setStatus] = useState<IssueStatus>(issue.status)
  const [assignedToId, setAssignedToId] = useState(issue.assignedTo?.id || '')
  const [commentText, setCommentText] = useState('')
  const [resolutionNote, setResolutionNote] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleSave = () => {
    const assignedTo = teamMembers.find((tm) => tm.id === assignedToId)

    updateIssue(issue.id, {
      title,
      description,
      severity,
      status,
      assignedTo,
    })
    onClose()
  }

  const handleDelete = () => {
    deleteIssue(issue.id)
    onClose()
  }

  const handleAddComment = () => {
    if (commentText.trim()) {
      addComment(issue.id, commentText.trim())
      setCommentText('')
    }
  }

  const handleResolve = () => {
    resolveIssue(issue.id, resolutionNote.trim() || undefined)
    setResolutionNote('')
    setStatus('resolved')
  }

  const handleReopen = () => {
    reopenIssue(issue.id)
    setStatus('open')
  }

  const severityColors = {
    low: 'bg-muted/50 text-foreground border-border',
    medium: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/50',
    high: 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/50',
    critical: 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/50',
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Issue Details
            <Badge variant="outline" className="font-mono text-xs ml-2">
              {issue.trackingId}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Source Info */}
          <div className="bg-muted/50 rounded-lg p-3 space-y-1 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Source:</span>
              <span className="font-medium text-foreground">
                {issue.sourceType === 'task' ? 'Task' : 'Subtask'} - {issue.sourceTrackingId}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Project:</span>
              <span className="font-medium text-foreground">{issue.projectCode}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Stage:</span>
              <span className="font-medium text-foreground">{issue.stage}</span>
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Issue title"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the issue..."
              rows={4}
            />
          </div>

          {/* Severity and Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="severity">Severity</Label>
              <Select value={severity} onValueChange={(value) => setSeverity(value as IssueSeverity)}>
                <SelectTrigger id="severity">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">
                    <Badge variant="outline" className={severityColors.low}>
                      Low
                    </Badge>
                  </SelectItem>
                  <SelectItem value="medium">
                    <Badge variant="outline" className={severityColors.medium}>
                      Medium
                    </Badge>
                  </SelectItem>
                  <SelectItem value="high">
                    <Badge variant="outline" className={severityColors.high}>
                      High
                    </Badge>
                  </SelectItem>
                  <SelectItem value="critical">
                    <Badge variant="outline" className={severityColors.critical}>
                      Critical
                    </Badge>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={(value) => setStatus(value as IssueStatus)}>
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Assigned To */}
          <div className="space-y-2">
            <Label htmlFor="assignedTo">Assigned To</Label>
            <Select value={assignedToId || 'unassigned'} onValueChange={(value) => setAssignedToId(value === 'unassigned' ? '' : value)}>
              <SelectTrigger id="assignedTo">
                <SelectValue placeholder="Select team member" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                {teamMembers.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    <div className="flex items-center gap-2">
                      {member.name} - {member.role}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Reported By */}
          <div className="space-y-2">
            <Label>Reported By</Label>
            <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
              <Avatar className="h-8 w-8" src={issue.reportedBy.avatar} fallback={issue.reportedBy.name[0]} />
              <div>
                <p className="text-sm font-medium text-foreground">{issue.reportedBy.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(issue.createdAt), { addSuffix: true })}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            {issue.status !== 'resolved' && issue.status !== 'closed' ? (
              <div className="flex-1 space-y-2">
                <Label htmlFor="resolutionNote">Resolution Note (optional)</Label>
                <div className="flex gap-2">
                  <Input
                    id="resolutionNote"
                    value={resolutionNote}
                    onChange={(e) => setResolutionNote(e.target.value)}
                    placeholder="Add resolution note..."
                  />
                  <Button onClick={handleResolve} variant="outline" className="gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Resolve
                  </Button>
                </div>
              </div>
            ) : (
              <Button onClick={handleReopen} variant="outline" className="gap-2">
                <XCircle className="h-4 w-4" />
                Reopen Issue
              </Button>
            )}
          </div>

          <Separator />

          {/* Comments Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              <Label>Comments ({issue.comments?.length || 0})</Label>
            </div>

            {/* Add Comment */}
            <div className="flex gap-2">
              <Input
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a comment..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleAddComment()
                  }
                }}
              />
              <Button onClick={handleAddComment} size="icon" disabled={!commentText.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>

            {/* Comments List */}
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {issue.comments?.map((comment) => (
                <div key={comment.id} className="bg-muted rounded-lg p-3 group relative">
                  <div className="flex items-start gap-2">
                    <Avatar className="h-6 w-6" src={comment.author.avatar} fallback={comment.author.name[0]} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-foreground">{comment.author.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-sm text-foreground">{comment.text}</p>
                    </div>
                    {currentUser && comment.author.id === currentUser.id && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 h-6 w-6"
                        onClick={() => deleteComment(issue.id, comment.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="flex items-center justify-between">
          <div>
            {showDeleteConfirm ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Delete this issue?</span>
                <Button variant="destructive" size="sm" onClick={handleDelete}>
                  Confirm Delete
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setShowDeleteConfirm(false)}>
                  Cancel
                </Button>
              </div>
            ) : (
              <Button variant="ghost" size="sm" onClick={() => setShowDeleteConfirm(true)} className="text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Issue
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save Changes</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
