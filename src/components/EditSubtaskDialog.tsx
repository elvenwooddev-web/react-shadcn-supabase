import { useState, useEffect, type FormEvent } from 'react'
import { Edit, AlertTriangle } from 'lucide-react'
import { useTasks } from '@/contexts/TaskContext'
import { useTeam } from '@/contexts/TeamContext'
import { useIssues } from '@/contexts/IssueContext'
import type { Subtask, TaskStatus, TaskPriority } from '@/types'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { CreateIssueDialog } from '@/components/CreateIssueDialog'
import { IssueIndicator } from '@/components/IssueIndicator'

const statusOptions: { value: TaskStatus; label: string }[] = [
  { value: 'todo', label: 'To Do' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'blocked', label: 'Blocked' },
  { value: 'completed', label: 'Completed' },
]

const priorityOptions: { value: TaskPriority; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
]

interface EditSubtaskDialogProps {
  taskId: string
  subtask: Subtask
}

export function EditSubtaskDialog({ taskId, subtask }: EditSubtaskDialogProps) {
  const [open, setOpen] = useState(false)
  const [isCreateIssueOpen, setIsCreateIssueOpen] = useState(false)
  const { updateSubtask } = useTasks()
  const { teamMembers } = useTeam()
  const { getIssuesForSubtask } = useIssues()
  const [formData, setFormData] = useState({
    label: subtask.label,
    description: subtask.description || '',
    dueDate: subtask.dueDate || '',
    assigneeId: subtask.assigneeId,
    assigneeIds: subtask.assignees?.map(a => a.id) || [subtask.assigneeId],
    status: subtask.status,
    priority: subtask.priority,
  })

  // Get issues for this subtask
  const subtaskIssues = getIssuesForSubtask(taskId, subtask.id)

  useEffect(() => {
    if (open) {
      setFormData({
        label: subtask.label,
        description: subtask.description || '',
        dueDate: subtask.dueDate || '',
        assigneeId: subtask.assigneeId,
        assigneeIds: subtask.assignees?.map(a => a.id) || [subtask.assigneeId],
        status: subtask.status,
        priority: subtask.priority,
      })
    }
  }, [open, subtask])

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()

    const assignee = teamMembers.find((tm) => tm.id === formData.assigneeIds[0])
    if (!assignee) return

    const assignees = teamMembers.filter(tm => formData.assigneeIds.includes(tm.id))

    updateSubtask(taskId, subtask.id, {
      label: formData.label,
      description: formData.description || undefined,
      dueDate: formData.dueDate || undefined,
      assigneeId: formData.assigneeIds[0],
      avatar: assignee.avatar,
      assignees: assignees.length > 0 ? assignees : undefined,
      status: formData.status,
      priority: formData.priority,
      completed: formData.status === 'completed',
    })
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100">
          <Edit className="h-3 w-3" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Edit Subtask
            <Badge variant="outline" className="font-mono text-xs bg-primary/10 text-primary border-primary/50">
              {subtask.trackingId}
            </Badge>
            {subtaskIssues.length > 0 && (
              <IssueIndicator
                count={subtaskIssues.length}
                severity={subtaskIssues.some(i => i.severity === 'critical') ? 'critical' : subtaskIssues.some(i => i.severity === 'high') ? 'high' : 'medium'}
                size="sm"
              />
            )}
          </DialogTitle>
          <DialogDescription>
            Update subtask details and settings
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-subtask-label">Subtask Title*</Label>
            <Input
              id="edit-subtask-label"
              value={formData.label}
              onChange={(e) => setFormData({ ...formData, label: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-subtask-description">Description</Label>
            <textarea
              id="edit-subtask-description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="Add a description..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-subtask-status">Status*</Label>
              <select
                id="edit-subtask-status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as TaskStatus })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-subtask-priority">Priority*</Label>
              <select
                id="edit-subtask-priority"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as TaskPriority })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {priorityOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-subtask-dueDate">Due Date</Label>
            <Input
              id="edit-subtask-dueDate"
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Assignees*</Label>
            <div className="grid grid-cols-2 gap-1 max-h-48 overflow-y-auto p-2 border border-input rounded-md bg-background">
              {teamMembers.map((member) => (
                <label key={member.id} className="flex items-center gap-2 p-2 rounded hover:bg-muted cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.assigneeIds.includes(member.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData({ ...formData, assigneeIds: [...formData.assigneeIds, member.id] })
                      } else {
                        setFormData({ ...formData, assigneeIds: formData.assigneeIds.filter(id => id !== member.id) })
                      }
                    }}
                    className="h-3 w-3"
                  />
                  <Avatar src={member.avatar} className="size-5" />
                  <span className="text-xs truncate">{member.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCreateIssueOpen(true)}
              className="gap-2"
            >
              <AlertTriangle className="h-4 w-4" />
              Report Issue
            </Button>
            <div className="flex gap-2">
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </div>
          </div>
        </form>
      </DialogContent>

      {/* Create Issue Dialog */}
      <CreateIssueDialog
        isOpen={isCreateIssueOpen}
        onClose={() => setIsCreateIssueOpen(false)}
        sourceType="subtask"
        sourceId={taskId}
        sourceTrackingId=""
        subtaskId={subtask.id}
        subtaskTrackingId={subtask.trackingId}
      />
    </Dialog>
  )
}
