import { useState, type FormEvent } from 'react'
import { Plus } from 'lucide-react'
import { useTasks } from '@/contexts/TaskContext'
import { useTeam } from '@/contexts/TeamContext'
import { useUser } from '@/contexts/UserContext'
import { useStatusConfig } from '@/contexts/StatusConfigContext'
import type { WorkflowStage, TaskStatus, TaskPriority } from '@/types'
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
import { StatusSelect } from '@/components/ui/status-selector'

const priorityOptions: { value: TaskPriority; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
]

export function AddTaskDialog() {
  const [open, setOpen] = useState(false)
  const { createTask } = useTasks()
  const { teamMembers } = useTeam()
  const { visibleStages } = useUser()
  const { getDefaultStatus } = useStatusConfig()

  const defaultTaskStatus = getDefaultStatus('task')?.value || 'todo'

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    assigneeId: '',
    stage: (visibleStages[0] || 'Sales') as WorkflowStage,
    status: defaultTaskStatus as TaskStatus,
    priority: 'medium' as TaskPriority,
  })

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    createTask(formData)
    setFormData({
      title: '',
      description: '',
      dueDate: '',
      assigneeId: '',
      stage: visibleStages[0] || 'Sales',
      status: defaultTaskStatus,
      priority: 'medium',
    })
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" />
          Add Task
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
          <DialogDescription>
            Add a new task to your project workflow
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Task Title*</Label>
            <Input
              id="title"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Create GFC drawings"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Optional task description"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date*</Label>
              <Input
                id="dueDate"
                type="date"
                required
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="assignee">Assignee (Optional)</Label>
              <select
                id="assignee"
                value={formData.assigneeId}
                onChange={(e) => setFormData({ ...formData, assigneeId: e.target.value })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="">None (Unassigned)</option>
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
              <Label htmlFor="stage">Stage*</Label>
              <select
                id="stage"
                required
                value={formData.stage}
                onChange={(e) => setFormData({ ...formData, stage: e.target.value as WorkflowStage })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {visibleStages.map((stage) => (
                  <option key={stage} value={stage}>
                    {stage}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status*</Label>
              <StatusSelect
                entityType="task"
                value={formData.status}
                onChange={(value) => setFormData({ ...formData, status: value as TaskStatus })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority*</Label>
              <select
                id="priority"
                required
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as TaskPriority })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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
              Create Task
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
