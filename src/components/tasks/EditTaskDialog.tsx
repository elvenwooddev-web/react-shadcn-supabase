import { useState, useEffect, type FormEvent } from 'react'
import { Edit } from 'lucide-react'
import { useTasks } from '@/contexts/TaskContext'
import { useTeam } from '@/contexts/TeamContext'
import { useUser } from '@/contexts/UserContext'
import type { Task, WorkflowStage, TaskStatus, TaskPriority } from '@/types'
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

interface EditTaskDialogProps {
  task: Task
}

export function EditTaskDialog({ task }: EditTaskDialogProps) {
  const [open, setOpen] = useState(false)
  const { updateTask } = useTasks()
  const { teamMembers } = useTeam()
  const { visibleStages } = useUser()
  const [formData, setFormData] = useState({
    title: task.title,
    description: task.description || '',
    dueDate: task.dueDate,
    assigneeId: task.assignee?.id || '',
    stage: task.stage,
    status: task.status,
    priority: task.priority,
  })

  useEffect(() => {
    if (open) {
      setFormData({
        title: task.title,
        description: task.description || '',
        dueDate: task.dueDate,
        assigneeId: task.assignee?.id || '',
        stage: task.stage,
        status: task.status,
        priority: task.priority,
      })
    }
  }, [open, task])

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()

    const assignee = teamMembers.find((tm) => tm.id === formData.assigneeId)
    if (!assignee) return

    updateTask(task.id, {
      title: formData.title,
      description: formData.description,
      dueDate: formData.dueDate,
      assignee,
      stage: formData.stage,
      status: formData.status,
      priority: formData.priority,
    })
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
          <DialogDescription>
            Update task details and settings
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-title">Task Title*</Label>
            <Input
              id="edit-title"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description">Description</Label>
            <Input
              id="edit-description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Optional task description"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-dueDate">Due Date*</Label>
              <Input
                id="edit-dueDate"
                type="date"
                required
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-assignee">Assignee*</Label>
              <select
                id="edit-assignee"
                required
                value={formData.assigneeId}
                onChange={(e) => setFormData({ ...formData, assigneeId: e.target.value })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {teamMembers.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-stage">Stage*</Label>
              <select
                id="edit-stage"
                required
                value={formData.stage}
                onChange={(e) => setFormData({ ...formData, stage: e.target.value as WorkflowStage })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {visibleStages.map((stage) => (
                  <option key={stage} value={stage}>
                    {stage}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-status">Status*</Label>
              <select
                id="edit-status"
                required
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
              <Label htmlFor="edit-priority">Priority*</Label>
              <select
                id="edit-priority"
                required
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

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90">
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
