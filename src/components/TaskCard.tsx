import { useState, useRef } from 'react'
import { PlusCircle, Download, X, FileText, Image, Paperclip, Upload, UserPlus } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { useTasks } from '@/contexts/TaskContext'
import { useTeam } from '@/contexts/TeamContext'
import { EditTaskDialog } from '@/components/EditTaskDialog'
import { DeleteConfirmDialog } from '@/components/DeleteConfirmDialog'
import { PriorityBadge } from '@/components/PriorityBadge'
import type { Task, TaskStatus, TaskPriority, TeamMember } from '@/types'

interface TaskCardProps {
  task: Task
}

export function TaskCard({ task }: TaskCardProps) {
  const { updateTask, toggleTaskStatus, toggleSubtask, toggleChecklistItem, deleteSubtask, deleteChecklistItem, removeFile, addSubtask, addChecklistItem, attachFile, updateSubtaskAssignee } = useTasks()
  const { teamMembers } = useTeam()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [addingSubtaskTo, setAddingSubtaskTo] = useState(false)
  const [addingChecklistTo, setAddingChecklistTo] = useState(false)
  const [newSubtaskLabel, setNewSubtaskLabel] = useState('')
  const [newChecklistLabel, setNewChecklistLabel] = useState('')
  const [subtaskAssignee, setSubtaskAssignee] = useState(teamMembers[0]?.id || '')

  const handleAddSubtask = () => {
    if (!newSubtaskLabel.trim()) return
    addSubtask(task.id, { label: newSubtaskLabel, assigneeId: subtaskAssignee })
    setNewSubtaskLabel('')
    setAddingSubtaskTo(false)
  }

  const handleAddChecklist = () => {
    if (!newChecklistLabel.trim()) return
    addChecklistItem(task.id, newChecklistLabel)
    setNewChecklistLabel('')
    setAddingChecklistTo(false)
  }

  const handleStatusChange = (status: TaskStatus) => {
    updateTask(task.id, { status })
  }

  const handlePriorityChange = (priority: TaskPriority) => {
    updateTask(task.id, { priority })
  }

  const handleAddAssignee = (member: TeamMember) => {
    const currentAssignees = task.assignees || [task.assignee]
    const isAlreadyAssigned = currentAssignees.some(a => a.id === member.id)

    if (!isAlreadyAssigned) {
      updateTask(task.id, {
        assignees: [...currentAssignees, member]
      })
    }
  }

  const handleRemoveAssignee = (memberId: string) => {
    const currentAssignees = task.assignees || [task.assignee]
    const filtered = currentAssignees.filter(a => a.id !== memberId)

    if (filtered.length > 0) {
      updateTask(task.id, {
        assignee: filtered[0],
        assignees: filtered
      })
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    Array.from(files).forEach((file) => {
      // Create a mock file object (in a real app, you'd upload to a server)
      const reader = new FileReader()
      reader.onload = () => {
        const fileData = {
          id: `file-${Date.now()}-${Math.random()}`,
          name: file.name,
          size: `${(file.size / 1024).toFixed(1)} KB`,
          type: file.type.startsWith('image/') ? 'image' as const :
                file.type === 'application/pdf' ? 'pdf' as const :
                file.name.endsWith('.doc') || file.name.endsWith('.docx') ? 'doc' as const :
                'other' as const,
          url: reader.result as string,
          uploadedAt: new Date(),
          uploadedBy: 'You'
        }
        attachFile(task.id, fileData)
      }
      reader.readAsDataURL(file)
    })

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const displayAssignees = task.assignees || [task.assignee]

  return (
    <div
      className={cn(
        'p-4 rounded-lg',
        task.status === 'blocked'
          ? 'bg-warning/10 dark:bg-warning/20 border border-warning/50'
          : 'bg-slate-50 dark:bg-slate-800/50'
      )}
    >
      <div className="flex items-start gap-4">
        <Checkbox
          checked={task.status === 'completed'}
          onCheckedChange={() => toggleTaskStatus(task.id)}
          className="mt-1"
        />
        <div className="flex-1 space-y-3">
          {/* Task Header */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <p className="font-medium text-slate-800 dark:text-slate-200">
                {task.title}
              </p>
              <p className={cn(
                'text-xs',
                task.status === 'blocked'
                  ? 'text-warning font-semibold'
                  : 'text-slate-500 dark:text-slate-400'
              )}>
                Due: {task.dueDate}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {/* Assignees Popover */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-auto p-0 hover:opacity-80">
                    <div className="flex -space-x-2">
                      {displayAssignees.slice(0, 3).map((assignee, idx) => (
                        <Avatar
                          key={`${assignee.id}-${idx}`}
                          src={assignee.avatar}
                          className="size-6 ring-2 ring-white dark:ring-slate-900"
                        />
                      ))}
                      {displayAssignees.length > 3 && (
                        <div className="size-6 rounded-full bg-slate-200 dark:bg-slate-700 ring-2 ring-white dark:ring-slate-900 flex items-center justify-center text-xs font-medium">
                          +{displayAssignees.length - 3}
                        </div>
                      )}
                    </div>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-2">
                  <div className="space-y-2">
                    <p className="text-sm font-semibold mb-2">Assignees</p>
                    {displayAssignees.map((assignee) => (
                      <div key={assignee.id} className="flex items-center justify-between p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md">
                        <div className="flex items-center gap-2">
                          <Avatar src={assignee.avatar} className="size-6" />
                          <span className="text-sm">{assignee.name}</span>
                        </div>
                        {displayAssignees.length > 1 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => handleRemoveAssignee(assignee.id)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <div className="border-t pt-2 mt-2">
                      <p className="text-xs font-semibold mb-2 text-slate-600 dark:text-slate-400">Add Assignee</p>
                      {teamMembers
                        .filter(m => !displayAssignees.some(a => a.id === m.id))
                        .map((member) => (
                          <Button
                            key={member.id}
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start h-auto p-2"
                            onClick={() => handleAddAssignee(member)}
                          >
                            <Avatar src={member.avatar} className="size-5 mr-2" />
                            <span className="text-sm">{member.name}</span>
                          </Button>
                        ))}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              {/* Priority Selector */}
              <Select value={task.priority} onValueChange={handlePriorityChange}>
                <SelectTrigger className="h-auto w-auto border-none p-0 gap-0 hover:opacity-80">
                  <SelectValue>
                    <PriorityBadge priority={task.priority} />
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">
                    <div className="flex items-center gap-2">
                      <PriorityBadge priority="low" />
                      <span>Low</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="medium">
                    <div className="flex items-center gap-2">
                      <PriorityBadge priority="medium" />
                      <span>Medium</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="high">
                    <div className="flex items-center gap-2">
                      <PriorityBadge priority="high" />
                      <span>High</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="urgent">
                    <div className="flex items-center gap-2">
                      <PriorityBadge priority="urgent" />
                      <span>Urgent</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>

              {/* Status Selector */}
              <Select value={task.status} onValueChange={handleStatusChange}>
                <SelectTrigger className="h-auto w-auto border-none p-0 gap-0 hover:opacity-80">
                  <SelectValue>
                    {task.status === 'completed' && <Badge variant="success">Completed</Badge>}
                    {task.status === 'in-progress' && <Badge className="bg-primary/20 text-primary">In Progress</Badge>}
                    {task.status === 'todo' && <Badge className="bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">To Do</Badge>}
                    {task.status === 'blocked' && <Badge variant="danger">Blocked</Badge>}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">
                    <Badge className="bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">To Do</Badge>
                  </SelectItem>
                  <SelectItem value="in-progress">
                    <Badge className="bg-primary/20 text-primary">In Progress</Badge>
                  </SelectItem>
                  <SelectItem value="completed">
                    <Badge variant="success">Completed</Badge>
                  </SelectItem>
                  <SelectItem value="blocked">
                    <Badge variant="danger">Blocked</Badge>
                  </SelectItem>
                </SelectContent>
              </Select>

              <div className="flex gap-1 ml-2">
                <EditTaskDialog task={task} />
                <DeleteConfirmDialog
                  onConfirm={() => useTasks().deleteTask(task.id)}
                  title="Delete Task"
                  description={`Are you sure you want to delete "${task.title}"?`}
                />
              </div>
            </div>
          </div>

          {/* Checklist */}
          {task.checklistItems && task.checklistItems.length > 0 && (
            <div className="pl-4 border-l border-slate-200 dark:border-slate-700 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Checklist ({task.checklistItems.filter((i) => i.completed).length}/{task.checklistItems.length})
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setAddingChecklistTo(true)}
                  className="h-auto p-0 text-xs text-primary"
                >
                  <PlusCircle className="h-3 w-3 mr-1" />
                  Add Item
                </Button>
              </div>
              {task.checklistItems.map((item) => (
                <div key={item.id} className="flex items-center gap-2 group">
                  <Checkbox
                    checked={item.completed}
                    onCheckedChange={() => toggleChecklistItem(task.id, item.id)}
                    className="h-4 w-4"
                  />
                  <label className={cn('text-sm flex-1', item.completed && 'line-through text-slate-500')}>
                    {item.label}
                  </label>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteChecklistItem(task.id, item.id)}
                    className="h-6 w-6 opacity-0 group-hover:opacity-100"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
              {addingChecklistTo && (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newChecklistLabel}
                    onChange={(e) => setNewChecklistLabel(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddChecklist()}
                    placeholder="New item..."
                    className="flex h-8 w-full rounded-md border border-input bg-background px-2 text-sm"
                    autoFocus
                  />
                  <Button size="sm" onClick={handleAddChecklist} className="h-8">Add</Button>
                  <Button variant="ghost" size="sm" onClick={() => setAddingChecklistTo(false)} className="h-8">Cancel</Button>
                </div>
              )}
            </div>
          )}

          {/* Subtasks */}
          {task.subtasks && task.subtasks.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Subtasks ({task.subtasks.filter((s) => s.completed).length}/{task.subtasks.length})
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setAddingSubtaskTo(true)}
                  className="h-auto p-0 text-xs text-primary"
                >
                  <PlusCircle className="h-3 w-3 mr-1" />
                  Add Subtask
                </Button>
              </div>
              <Progress value={(task.subtasks.filter((s) => s.completed).length / task.subtasks.length) * 100} />
              <div className="space-y-2">
                {task.subtasks.map((subtask) => (
                  <div key={subtask.id} className="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 group">
                    <div className="flex items-center gap-3 flex-1">
                      <Checkbox
                        checked={subtask.completed}
                        onCheckedChange={() => toggleSubtask(task.id, subtask.id)}
                        className="h-4 w-4"
                      />
                      <p className={cn('text-sm flex-1', subtask.completed && 'line-through')}>
                        {subtask.label}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* Subtask Assignee Popover */}
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-auto p-0 hover:opacity-80">
                            <Avatar src={subtask.avatar} className="size-5" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-48 p-2">
                          <div className="space-y-1">
                            <p className="text-xs font-semibold mb-2">Change Assignee</p>
                            {teamMembers.map((member) => (
                              <Button
                                key={member.id}
                                variant={subtask.assigneeId === member.id ? "secondary" : "ghost"}
                                size="sm"
                                className="w-full justify-start h-auto p-2"
                                onClick={() => updateSubtaskAssignee(task.id, subtask.id, member.id, member.avatar)}
                              >
                                <Avatar src={member.avatar} className="size-5 mr-2" />
                                <span className="text-sm">{member.name}</span>
                              </Button>
                            ))}
                          </div>
                        </PopoverContent>
                      </Popover>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteSubtask(task.id, subtask.id)}
                        className="h-6 w-6 opacity-0 group-hover:opacity-100"
                      >
                        <X className="h-3 w-3 text-danger" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {addingSubtaskTo && (
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-dashed">
              <input
                type="text"
                value={newSubtaskLabel}
                onChange={(e) => setNewSubtaskLabel(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddSubtask()}
                placeholder="Subtask description..."
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm mb-2"
                autoFocus
              />
              <div className="flex gap-2">
                <select
                  value={subtaskAssignee}
                  onChange={(e) => setSubtaskAssignee(e.target.value)}
                  className="flex h-8 flex-1 rounded-md border border-input bg-background px-2 text-xs"
                >
                  {teamMembers.map((m) => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
                <Button size="sm" onClick={handleAddSubtask} className="h-8">Add</Button>
                <Button variant="ghost" size="sm" onClick={() => setAddingSubtaskTo(false)} className="h-8">Cancel</Button>
              </div>
            </div>
          )}

          {!task.subtasks?.length && !addingSubtaskTo && (
            <Button variant="ghost" size="sm" onClick={() => setAddingSubtaskTo(true)} className="text-xs text-primary">
              <PlusCircle className="h-3 w-3 mr-1" />
              Add Subtask
            </Button>
          )}

          {/* Attachments */}
          {task.attachments && task.attachments.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300">
                  <Paperclip className="h-4 w-4" />
                  <span>{task.attachments.length} Attachment{task.attachments.length !== 1 ? 's' : ''}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="h-auto p-0 text-xs text-primary"
                >
                  <Upload className="h-3 w-3 mr-1" />
                  Upload
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {task.attachments.map((file) => (
                  <div key={file.id} className="flex items-center gap-2 p-2 rounded-lg bg-white dark:bg-slate-800 border group hover:border-primary/50">
                    <div className="flex items-center justify-center size-9 bg-primary/10 text-primary rounded-md">
                      {file.type === 'pdf' && <FileText className="h-4 w-4" />}
                      {file.type === 'image' && <Image className="h-4 w-4" />}
                      {file.type === 'doc' && <FileText className="h-4 w-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{file.size}</p>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-primary/10" title="Download">
                        <Download className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFile(task.id, file.id)}
                        className="h-7 w-7 opacity-0 group-hover:opacity-100 hover:bg-danger/10 hover:text-danger"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload button when no attachments */}
          {(!task.attachments || task.attachments.length === 0) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="text-xs text-primary"
            >
              <Upload className="h-3 w-3 mr-1" />
              Upload Files
            </Button>
          )}

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,.pdf,.doc,.docx"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      </div>
    </div>
  )
}
