import { useState } from 'react'
import type { IssueSeverity, CreateIssueForm } from '@/types'
import { useIssues } from '@/contexts/IssueContext'
import { useTeam } from '@/contexts/TeamContext'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle } from 'lucide-react'

interface CreateIssueDialogProps {
  isOpen: boolean
  onClose: () => void
  sourceType: 'task' | 'subtask'
  sourceId: string
  sourceTrackingId: string
  subtaskId?: string
  subtaskTrackingId?: string
}

export function CreateIssueDialog({
  isOpen,
  onClose,
  sourceType,
  sourceId,
  sourceTrackingId,
  subtaskId,
  subtaskTrackingId,
}: CreateIssueDialogProps) {
  const { createIssue } = useIssues()
  const { teamMembers } = useTeam()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [severity, setSeverity] = useState<IssueSeverity>('medium')
  const [assignedToId, setAssignedToId] = useState('')

  const handleCreate = () => {
    if (!title.trim() || !description.trim()) return

    const issueData: CreateIssueForm = {
      title: title.trim(),
      description: description.trim(),
      severity,
      sourceType,
      sourceId,
      sourceTrackingId,
      subtaskId,
      subtaskTrackingId,
      assignedToId: assignedToId || undefined,
    }

    createIssue(issueData)

    // Reset form
    setTitle('')
    setDescription('')
    setSeverity('medium')
    setAssignedToId('')
    onClose()
  }

  const severityColors = {
    low: 'bg-muted/50 text-foreground border-border',
    medium: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/50',
    high: 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/50',
    critical: 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/50',
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Report Issue
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Source Info */}
          <div className="bg-muted/50 rounded-lg p-3 space-y-1 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Reporting issue for:</span>
              <span className="font-medium text-foreground">
                {sourceType === 'task' ? 'Task' : 'Subtask'} - {sourceType === 'task' ? sourceTrackingId : subtaskTrackingId}
              </span>
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Brief description of the issue"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">
              Description <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed description of what's blocking progress..."
              rows={4}
            />
          </div>

          {/* Severity */}
          <div className="space-y-2">
            <Label htmlFor="severity">
              Severity <span className="text-destructive">*</span>
            </Label>
            <Select value={severity} onValueChange={(value) => setSeverity(value as IssueSeverity)}>
              <SelectTrigger id="severity">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">
                  <Badge variant="outline" className={severityColors.low}>
                    Low - Minor issue, doesn't block progress
                  </Badge>
                </SelectItem>
                <SelectItem value="medium">
                  <Badge variant="outline" className={severityColors.medium}>
                    Medium - Moderate issue, some impact
                  </Badge>
                </SelectItem>
                <SelectItem value="high">
                  <Badge variant="outline" className={severityColors.high}>
                    High - Significant issue, major impact
                  </Badge>
                </SelectItem>
                <SelectItem value="critical">
                  <Badge variant="outline" className={severityColors.critical}>
                    Critical - Blocking issue, immediate attention needed
                  </Badge>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Assign To */}
          <div className="space-y-2">
            <Label htmlFor="assignedTo">Assign To (optional)</Label>
            <Select value={assignedToId} onValueChange={setAssignedToId}>
              <SelectTrigger id="assignedTo">
                <SelectValue placeholder="Select team member" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Unassigned</SelectItem>
                {teamMembers.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.name} - {member.role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={!title.trim() || !description.trim()}>
            Create Issue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
