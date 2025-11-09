import { useState, useRef } from 'react'
import { PlusCircle, Download, X, FileText, Image, Paperclip, Upload, UserPlus, Calendar, AlertTriangle } from 'lucide-react'
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
import { useIssues } from '@/contexts/IssueContext'
import { EditTaskDialog } from '@/components/EditTaskDialog'
import { EditSubtaskDialog } from '@/components/EditSubtaskDialog'
import { DeleteConfirmDialog } from '@/components/DeleteConfirmDialog'
import { PriorityBadge } from '@/components/PriorityBadge'
import { CreateIssueDialog } from '@/components/CreateIssueDialog'
import { IssueIndicator } from '@/components/IssueIndicator'
import type { Task, TaskStatus, TaskPriority, TeamMember } from '@/types'

interface TaskCardProps {
  task: Task
}

export function TaskCard({ task }: TaskCardProps) {
  const { updateTask, toggleTaskStatus, toggleSubtask, toggleChecklistItem, deleteSubtask, deleteChecklistItem, removeFile, addSubtask, addChecklistItem, attachFile, updateSubtask, updateSubtaskStatus, updateSubtaskPriority, updateSubtaskAssignee, attachFileToSubtask, removeFileFromSubtask } = useTasks()
  const { teamMembers } = useTeam()
  const { getIssuesForTask, getIssuesForSubtask } = useIssues()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [addingSubtaskTo, setAddingSubtaskTo] = useState(false)
  const [addingChecklistTo, setAddingChecklistTo] = useState(false)
  const [isCreateIssueOpen, setIsCreateIssueOpen] = useState(false)
  const [issueSourceType, setIssueSourceType] = useState<'task' | 'subtask'>('task')
  const [issueSourceId, setIssueSourceId] = useState('')
  const [issueSubtaskId, setIssueSubtaskId] = useState<string | undefined>()

  // Get issues for this task and its subtasks
  const taskIssues = getIssuesForTask(task.id)
  const [newSubtaskLabel, setNewSubtaskLabel] = useState('')
  const [newSubtaskDescription, setNewSubtaskDescription] = useState('')
  const [newSubtaskPriority, setNewSubtaskPriority] = useState<TaskPriority>('medium')
  const [newSubtaskStatus, setNewSubtaskStatus] = useState<TaskStatus>('todo')
  const [newSubtaskDueDate, setNewSubtaskDueDate] = useState('')
  const [subtaskAssigneeIds, setSubtaskAssigneeIds] = useState<string[]>([teamMembers[0]?.id || ''])
  const [newChecklistLabel, setNewChecklistLabel] = useState('')
  const [subtaskAssignee, setSubtaskAssignee] = useState(teamMembers[0]?.id || '')

  const handleAddSubtask = () => {
    if (!newSubtaskLabel.trim()) return
    addSubtask(task.id, {
      label: newSubtaskLabel,
      description: newSubtaskDescription || undefined,
      assigneeId: subtaskAssigneeIds[0] || subtaskAssignee,
      assigneeIds: subtaskAssigneeIds.length > 0 ? subtaskAssigneeIds : undefined,
      priority: newSubtaskPriority,
      status: newSubtaskStatus,
      dueDate: newSubtaskDueDate || undefined,
    })
    setNewSubtaskLabel('')
    setNewSubtaskDescription('')
    setNewSubtaskPriority('medium')
    setNewSubtaskStatus('todo')
    setNewSubtaskDueDate('')
    setSubtaskAssigneeIds([teamMembers[0]?.id || ''])
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
          : 'bg-muted'
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
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="font-mono text-xs bg-primary/10 text-primary border-primary/50">
                  {task.trackingId}
                </Badge>
                {taskIssues.length > 0 && (
                  <IssueIndicator
                    count={taskIssues.length}
                    severity={taskIssues.some(i => i.severity === 'critical') ? 'critical' : taskIssues.some(i => i.severity === 'high') ? 'high' : 'medium'}
                    size="sm"
                  />
                )}
              </div>
              <p className="font-medium text-foreground">
                {task.title}
              </p>
              <p className={cn(
                'text-xs',
                task.status === 'blocked'
                  ? 'text-warning font-semibold'
                  : 'text-muted-foreground'
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
                          className="size-6 ring-2 ring-card"
                        />
                      ))}
                      {displayAssignees.length > 3 && (
                        <div className="size-6 rounded-full bg-muted ring-2 ring-card flex items-center justify-center text-xs font-medium">
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
                      <div key={assignee.id} className="flex items-center justify-between p-2 hover:bg-muted rounded-md">
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
                      <p className="text-xs font-semibold mb-2 text-muted-foreground">Add Assignee</p>
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
                    {task.status === 'todo' && <Badge className="bg-muted text-muted-foreground">To Do</Badge>}
                    {task.status === 'blocked' && <Badge variant="danger">Blocked</Badge>}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">
                    <Badge className="bg-muted text-muted-foreground">To Do</Badge>
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
            <div className="pl-4 border-l border-border space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-muted-foreground">
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

          {!task.checklistItems?.length && !addingChecklistTo && (
            <Button variant="ghost" size="sm" onClick={() => setAddingChecklistTo(true)} className="text-xs text-primary">
              <PlusCircle className="h-3 w-3 mr-1" />
              Add Checklist Item
            </Button>
          )}

          {!task.checklistItems?.length && addingChecklistTo && (
            <div className="pl-4 border-l border-border space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Checklist (0/0)</p>
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
            </div>
          )}

          {/* Subtasks */}
          {task.subtasks && task.subtasks.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-muted-foreground">
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
                  <div key={subtask.id} className="p-3 rounded-lg bg-card border border-border group space-y-2">
                    {/* Subtask Header Row */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <Checkbox
                          checked={subtask.completed}
                          onCheckedChange={() => toggleSubtask(task.id, subtask.id)}
                          className="h-4 w-4 mt-0.5"
                        />
                        <div className="flex-1 min-w-0">
                          <p className={cn('text-sm font-medium', subtask.completed && 'line-through text-muted-foreground')}>
                            {subtask.label}
                          </p>
                          {subtask.description && (
                            <p className="text-xs text-muted-foreground mt-1">{subtask.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <EditSubtaskDialog taskId={task.id} subtask={subtask} />
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

                    {/* Subtask Metadata Row */}
                    <div className="flex items-center gap-2 flex-wrap pl-7">
                      {/* Priority Dropdown */}
                      <Select value={subtask.priority} onValueChange={(value: TaskPriority) => updateSubtaskPriority(task.id, subtask.id, value)}>
                        <SelectTrigger className="h-6 w-24 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>

                      {/* Status Dropdown */}
                      <Select value={subtask.status} onValueChange={(value: TaskStatus) => updateSubtaskStatus(task.id, subtask.id, value)}>
                        <SelectTrigger className="h-6 w-28 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todo">To Do</SelectItem>
                          <SelectItem value="in-progress">In Progress</SelectItem>
                          <SelectItem value="blocked">Blocked</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>

                      {/* Due Date */}
                      {subtask.dueDate && (
                        <Badge variant="outline" className="text-xs">
                          <Calendar className="h-3 w-3 mr-1" />
                          {subtask.dueDate}
                        </Badge>
                      )}

                      {/* Assignees */}
                      <div className="flex items-center gap-1">
                        {subtask.assignees && subtask.assignees.length > 0 ? (
                          subtask.assignees.map((assignee, idx) => (
                            <Avatar key={assignee.id} src={assignee.avatar} className="size-5" style={{ marginLeft: idx > 0 ? '-0.5rem' : '0' }} />
                          ))
                        ) : (
                          <Avatar src={subtask.avatar} className="size-5" />
                        )}
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs hover:opacity-80">
                              <UserPlus className="h-3 w-3" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-48 p-2">
                            <div className="space-y-1">
                              <p className="text-xs font-semibold mb-2">Assignees</p>
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
                      </div>
                    </div>

                    {/* Subtask Attachments */}
                    {subtask.attachments && subtask.attachments.length > 0 && (
                      <div className="pl-7 space-y-1">
                        <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                          <Paperclip className="h-3 w-3" />
                          {subtask.attachments.length} attachment{subtask.attachments.length !== 1 ? 's' : ''}
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                          {subtask.attachments.map((file) => (
                            <div
                              key={file.id}
                              className="flex flex-col gap-2 p-2.5 rounded-lg bg-card border border-border group/file hover:border-primary/50 transition-colors"
                            >
                              <div className="flex items-center justify-center h-16 bg-primary/10 text-primary rounded-md">
                                {file.type === 'image' ? (
                                  <Image className="h-6 w-6" />
                                ) : (
                                  <FileText className="h-6 w-6" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium truncate">{file.name}</p>
                                {file.size && <p className="text-xs text-muted-foreground">{file.size}</p>}
                              </div>
                              <div className="flex items-center gap-1 justify-end">
                                <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-primary/10">
                                  <Download className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 opacity-0 group-hover/file:opacity-100 hover:bg-danger/10 hover:text-danger"
                                  onClick={() => removeFileFromSubtask(task.id, subtask.id, file.id)}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {addingSubtaskTo && (
            <div className="p-4 rounded-lg bg-muted border border-dashed space-y-3">
              <input
                type="text"
                value={newSubtaskLabel}
                onChange={(e) => setNewSubtaskLabel(e.target.value)}
                placeholder="Subtask title..."
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                autoFocus
              />
              <textarea
                value={newSubtaskDescription}
                onChange={(e) => setNewSubtaskDescription(e.target.value)}
                placeholder="Description (optional)..."
                className="flex min-h-16 w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none"
              />
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={newSubtaskPriority}
                  onChange={(e) => setNewSubtaskPriority(e.target.value as TaskPriority)}
                  className="flex h-8 rounded-md border border-input bg-background px-2 text-xs"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                  <option value="urgent">Urgent</option>
                </select>
                <select
                  value={newSubtaskStatus}
                  onChange={(e) => setNewSubtaskStatus(e.target.value as TaskStatus)}
                  className="flex h-8 rounded-md border border-input bg-background px-2 text-xs"
                >
                  <option value="todo">To Do</option>
                  <option value="in-progress">In Progress</option>
                  <option value="blocked">Blocked</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div className="space-y-2">
                <input
                  type="date"
                  value={newSubtaskDueDate}
                  onChange={(e) => setNewSubtaskDueDate(e.target.value)}
                  placeholder="Due date (optional)"
                  className="flex h-8 w-full rounded-md border border-input bg-background px-2 text-xs"
                />
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Assignees</label>
                  <div className="grid grid-cols-2 gap-1 max-h-32 overflow-y-auto p-2 border border-input rounded-md bg-background">
                    {teamMembers.map((member) => (
                      <label key={member.id} className="flex items-center gap-2 p-1.5 rounded hover:bg-muted cursor-pointer">
                        <input
                          type="checkbox"
                          checked={subtaskAssigneeIds.includes(member.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSubtaskAssigneeIds([...subtaskAssigneeIds, member.id])
                            } else {
                              setSubtaskAssigneeIds(subtaskAssigneeIds.filter(id => id !== member.id))
                            }
                          }}
                          className="h-3 w-3"
                        />
                        <Avatar src={member.avatar} className="size-4" />
                        <span className="text-xs truncate">{member.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleAddSubtask} className="h-8 flex-1">Add Subtask</Button>
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
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {task.attachments.map((file) => (
                  <div key={file.id} className="flex flex-col gap-2 p-3 rounded-lg bg-card border group hover:border-primary/50 transition-colors">
                    <div className="flex items-center justify-center h-20 bg-primary/10 text-primary rounded-md">
                      {file.type === 'pdf' && <FileText className="h-8 w-8" />}
                      {file.type === 'image' && <Image className="h-8 w-8" />}
                      {file.type === 'doc' && <FileText className="h-8 w-8" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{file.size}</p>
                    </div>
                    <div className="flex gap-1 justify-end">
                      <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10" title="Download">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFile(task.id, file.id)}
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 hover:bg-danger/10 hover:text-danger"
                      >
                        <X className="h-4 w-4" />
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

          {/* Issues Section */}
          {taskIssues.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                  <span>{taskIssues.filter(i => i.status === 'open' || i.status === 'in-progress').length} Open Issue{taskIssues.filter(i => i.status === 'open' || i.status === 'in-progress').length !== 1 ? 's' : ''}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIssueSourceType('task')
                    setIssueSourceId(task.id)
                    setIssueSubtaskId(undefined)
                    setIsCreateIssueOpen(true)
                  }}
                  className="h-auto p-0 text-xs text-primary"
                >
                  <PlusCircle className="h-3 w-3 mr-1" />
                  Report Issue
                </Button>
              </div>
              <div className="space-y-2">
                {taskIssues.slice(0, 3).map((issue) => (
                  <div key={issue.id} className="flex items-center justify-between p-2 rounded-md bg-card border border-border">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <Badge variant="outline" className={cn(
                        "text-xs",
                        issue.severity === 'critical' ? 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/50' :
                        issue.severity === 'high' ? 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/50' :
                        issue.severity === 'medium' ? 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/50' :
                        'bg-muted/50 text-foreground border-border'
                      )}>
                        {issue.severity}
                      </Badge>
                      <p className="text-sm truncate flex-1">{issue.title}</p>
                      <Badge variant="outline" className="font-mono text-xs">{issue.trackingId}</Badge>
                    </div>
                  </div>
                ))}
                {taskIssues.length > 3 && (
                  <p className="text-xs text-muted-foreground text-center">
                    +{taskIssues.length - 3} more issue{taskIssues.length - 3 !== 1 ? 's' : ''}
                  </p>
                )}
              </div>
            </div>
          )}

          {taskIssues.length === 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setIssueSourceType('task')
                setIssueSourceId(task.id)
                setIssueSubtaskId(undefined)
                setIsCreateIssueOpen(true)
              }}
              className="text-xs text-muted-foreground hover:text-primary"
            >
              <AlertTriangle className="h-3 w-3 mr-1" />
              Report Issue
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

      {/* Create Issue Dialog */}
      <CreateIssueDialog
        isOpen={isCreateIssueOpen}
        onClose={() => setIsCreateIssueOpen(false)}
        sourceType={issueSourceType}
        sourceId={issueSourceId}
        sourceTrackingId={issueSourceType === 'task' ? task.trackingId : task.subtasks?.find(s => s.id === issueSubtaskId)?.trackingId || ''}
        subtaskId={issueSubtaskId}
        subtaskTrackingId={issueSubtaskId ? task.subtasks?.find(s => s.id === issueSubtaskId)?.trackingId : undefined}
      />
    </div>
  )
}
