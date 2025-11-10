import { useState } from 'react'
import { Plus, Edit, Trash2, ChevronDown, X, CheckSquare, ListChecks } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { PriorityBadge } from '@/components/shared'
import type { TemplateTask, WorkflowStage, TaskStatus, TaskPriority, ChecklistItem, Subtask } from '@/types'

const WORKFLOW_STAGES: WorkflowStage[] = [
  'Sales',
  'Design',
  'Technical Design',
  'Procurement',
  'Production',
  'Execution',
  'Post Installation',
]

interface TaskTemplateEditorProps {
  tasks: TemplateTask[]
  onAddTask: (task: TemplateTask) => void
  onUpdateTask: (index: number, data: Partial<TemplateTask>) => void
  onDeleteTask: (index: number) => void
  readOnly?: boolean
}

export function TaskTemplateEditor({ tasks, onAddTask, onUpdateTask, onDeleteTask, readOnly = false }: TaskTemplateEditorProps) {
  const [expandedStages, setExpandedStages] = useState<Set<WorkflowStage>>(new Set(WORKFLOW_STAGES))
  const [editingTask, setEditingTask] = useState<number | null>(null)
  const [addingToStage, setAddingToStage] = useState<WorkflowStage | null>(null)
  const [taskForm, setTaskForm] = useState<TemplateTask>({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    stage: 'Sales',
    checklistItems: [],
    subtasks: [],
  })
  const [newChecklistLabel, setNewChecklistLabel] = useState('')
  const [newSubtaskLabel, setNewSubtaskLabel] = useState('')
  const [newSubtaskPriority, setNewSubtaskPriority] = useState<TaskPriority>('medium')

  const toggleStage = (stage: WorkflowStage) => {
    const newExpanded = new Set(expandedStages)
    if (newExpanded.has(stage)) {
      newExpanded.delete(stage)
    } else {
      newExpanded.add(stage)
    }
    setExpandedStages(newExpanded)
  }

  const getTasksByStage = (stage: WorkflowStage) => {
    return tasks
      .map((task, index) => ({ task, index }))
      .filter(({ task }) => task.stage === stage)
  }

  const handleAddChecklist = () => {
    if (!newChecklistLabel.trim()) return
    setTaskForm({
      ...taskForm,
      checklistItems: [...(taskForm.checklistItems || []), { label: newChecklistLabel, completed: false }]
    })
    setNewChecklistLabel('')
  }

  const handleRemoveChecklist = (index: number) => {
    setTaskForm({
      ...taskForm,
      checklistItems: taskForm.checklistItems?.filter((_, i) => i !== index)
    })
  }

  const handleAddSubtask = () => {
    if (!newSubtaskLabel.trim()) return
    setTaskForm({
      ...taskForm,
      subtasks: [...(taskForm.subtasks || []), {
        label: newSubtaskLabel,
        completed: false,
        status: 'todo',
        priority: newSubtaskPriority,
      }]
    })
    setNewSubtaskLabel('')
    setNewSubtaskPriority('medium')
  }

  const handleRemoveSubtask = (index: number) => {
    setTaskForm({
      ...taskForm,
      subtasks: taskForm.subtasks?.filter((_, i) => i !== index)
    })
  }

  const handleAddTask = () => {
    if (!taskForm.title.trim() || !addingToStage) return

    onAddTask({ ...taskForm, stage: addingToStage })
    setTaskForm({
      title: '',
      description: '',
      status: 'todo',
      priority: 'medium',
      stage: addingToStage,
      checklistItems: [],
      subtasks: [],
    })
    setAddingToStage(null)
  }

  const handleUpdateTask = () => {
    if (editingTask === null || !taskForm.title.trim()) return

    onUpdateTask(editingTask, taskForm)
    setEditingTask(null)
    setTaskForm({
      title: '',
      description: '',
      status: 'todo',
      priority: 'medium',
      stage: 'Sales',
      checklistItems: [],
      subtasks: [],
    })
  }

  const startEdit = (index: number, task: TemplateTask) => {
    setEditingTask(index)
    setTaskForm(task)
  }

  return (
    <div className="space-y-4">
      {WORKFLOW_STAGES.map((stage) => {
        const stageTasks = getTasksByStage(stage)
        const isExpanded = expandedStages.has(stage)

        return (
          <div key={stage} className="bg-card border border-border rounded-lg">
            <button
              onClick={() => toggleStage(stage)}
              className="w-full flex items-center justify-between p-4 hover:bg-muted transition-colors rounded-t-lg"
            >
              <div className="flex items-center gap-3">
                <h3 className="font-semibold text-foreground">{stage}</h3>
                <Badge variant="outline">{stageTasks.length} tasks</Badge>
              </div>
              <ChevronDown
                className={`h-5 w-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              />
            </button>

            {isExpanded && (
              <div className="p-4 border-t border-border space-y-2">
                {stageTasks.map(({ task, index }) => (
                  <div key={index}>
                    {editingTask === index ? (
                      <div className="p-3 bg-muted rounded-lg space-y-3">
                        <Input
                          value={taskForm.title}
                          onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                          placeholder="Task title*"
                        />
                        <textarea
                          value={taskForm.description || ''}
                          onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                          placeholder="Description"
                          className="flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <select
                            value={taskForm.priority}
                            onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value as TaskPriority })}
                            className="flex h-9 rounded-md border border-input bg-background px-3 text-sm"
                          >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                            <option value="urgent">Urgent</option>
                          </select>
                          <select
                            value={taskForm.status}
                            onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value as TaskStatus })}
                            className="flex h-9 rounded-md border border-input bg-background px-3 text-sm"
                          >
                            <option value="todo">To Do</option>
                            <option value="in-progress">In Progress</option>
                            <option value="blocked">Blocked</option>
                            <option value="completed">Completed</option>
                          </select>
                        </div>

                        {/* Checklists */}
                        <div className="space-y-2">
                          <Label className="text-xs flex items-center gap-2">
                            <CheckSquare className="h-3 w-3" />
                            Checklist Items
                          </Label>
                          {taskForm.checklistItems && taskForm.checklistItems.length > 0 && (
                            <div className="space-y-1">
                              {taskForm.checklistItems.map((item, idx) => (
                                <div key={idx} className="flex items-center gap-2 p-2 bg-background rounded">
                                  <Checkbox checked={item.completed} disabled />
                                  <span className="text-xs flex-1">{item.label}</span>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-5 w-5"
                                    onClick={() => handleRemoveChecklist(idx)}
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          )}
                          <div className="flex gap-2">
                            <Input
                              value={newChecklistLabel}
                              onChange={(e) => setNewChecklistLabel(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && handleAddChecklist()}
                              placeholder="Add checklist item..."
                              className="h-8 text-xs"
                            />
                            <Button size="sm" onClick={handleAddChecklist} className="h-8">
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>

                        {/* Subtasks */}
                        <div className="space-y-2">
                          <Label className="text-xs flex items-center gap-2">
                            <ListChecks className="h-3 w-3" />
                            Subtasks
                          </Label>
                          {taskForm.subtasks && taskForm.subtasks.length > 0 && (
                            <div className="space-y-1">
                              {taskForm.subtasks.map((subtask, idx) => (
                                <div key={idx} className="flex items-center gap-2 p-2 bg-background rounded">
                                  <Checkbox checked={subtask.completed} disabled />
                                  <div className="flex-1 min-w-0">
                                    <span className="text-xs">{subtask.label}</span>
                                    <div className="flex gap-1 mt-1">
                                      <Badge className="text-xs h-4">{subtask.priority}</Badge>
                                      <Badge variant="outline" className="text-xs h-4">{subtask.status}</Badge>
                                    </div>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-5 w-5"
                                    onClick={() => handleRemoveSubtask(idx)}
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          )}
                          <div className="space-y-2">
                            <div className="flex gap-2">
                              <Input
                                value={newSubtaskLabel}
                                onChange={(e) => setNewSubtaskLabel(e.target.value)}
                                placeholder="Add subtask..."
                                className="h-8 text-xs flex-1"
                              />
                              <select
                                value={newSubtaskPriority}
                                onChange={(e) => setNewSubtaskPriority(e.target.value as TaskPriority)}
                                className="h-8 rounded-md border border-input bg-background px-2 text-xs"
                              >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                                <option value="urgent">Urgent</option>
                              </select>
                              <Button size="sm" onClick={handleAddSubtask} className="h-8">
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button size="sm" onClick={handleUpdateTask}>Save</Button>
                          <Button variant="ghost" size="sm" onClick={() => setEditingTask(null)}>Cancel</Button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 rounded-lg hover:bg-muted group space-y-2">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm">{task.title}</p>
                            {task.description && (
                              <p className="text-xs text-muted-foreground mt-1">{task.description}</p>
                            )}
                            <div className="flex gap-2 mt-2">
                              <PriorityBadge priority={task.priority} showIcon={false} />
                              <Badge variant="outline" className="text-xs">{task.status}</Badge>
                              {task.checklistItems && task.checklistItems.length > 0 && (
                                <Badge variant="outline" className="text-xs">
                                  <CheckSquare className="h-3 w-3 mr-1" />
                                  {task.checklistItems.length} items
                                </Badge>
                              )}
                              {task.subtasks && task.subtasks.length > 0 && (
                                <Badge variant="outline" className="text-xs">
                                  <ListChecks className="h-3 w-3 mr-1" />
                                  {task.subtasks.length} subtasks
                                </Badge>
                              )}
                            </div>
                          </div>
                          {!readOnly && (
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => startEdit(index, task)}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 hover:bg-danger/10 hover:text-danger"
                                onClick={() => onDeleteTask(index)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                        </div>

                        {/* Display Checklists */}
                        {task.checklistItems && task.checklistItems.length > 0 && (
                          <div className="pl-4 border-l-2 border-muted space-y-1">
                            {task.checklistItems.map((item, idx) => (
                              <div key={idx} className="flex items-center gap-2">
                                <Checkbox checked={item.completed} disabled className="h-3 w-3" />
                                <span className="text-xs text-muted-foreground">{item.label}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Display Subtasks */}
                        {task.subtasks && task.subtasks.length > 0 && (
                          <div className="pl-4 border-l-2 border-primary/30 space-y-1">
                            {task.subtasks.map((subtask, idx) => (
                              <div key={idx} className="flex items-center gap-2">
                                <Checkbox checked={subtask.completed} disabled className="h-3 w-3" />
                                <span className="text-xs flex-1">{subtask.label}</span>
                                <Badge className="text-xs h-4">{subtask.priority}</Badge>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}

                {addingToStage === stage ? (
                  <div className="p-3 bg-muted rounded-lg space-y-3 mt-2">
                    <Input
                      value={taskForm.title}
                      onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                      placeholder="Task title*"
                      autoFocus
                    />
                    <textarea
                      value={taskForm.description || ''}
                      onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                      placeholder="Description (optional)"
                      className="flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <select
                        value={taskForm.priority}
                        onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value as TaskPriority })}
                        className="flex h-9 rounded-md border border-input bg-background px-3 text-sm"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                      <select
                        value={taskForm.status}
                        onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value as TaskStatus })}
                        className="flex h-9 rounded-md border border-input bg-background px-3 text-sm"
                      >
                        <option value="todo">To Do</option>
                        <option value="in-progress">In Progress</option>
                        <option value="blocked">Blocked</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>

                    {/* Checklists */}
                    <div className="space-y-2">
                      <Label className="text-xs flex items-center gap-2">
                        <CheckSquare className="h-3 w-3" />
                        Checklist Items
                      </Label>
                      {taskForm.checklistItems && taskForm.checklistItems.length > 0 && (
                        <div className="space-y-1">
                          {taskForm.checklistItems.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-2 p-2 bg-background rounded">
                              <Checkbox checked={item.completed} disabled />
                              <span className="text-xs flex-1">{item.label}</span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-5 w-5"
                                onClick={() => handleRemoveChecklist(idx)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="flex gap-2">
                        <Input
                          value={newChecklistLabel}
                          onChange={(e) => setNewChecklistLabel(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleAddChecklist()}
                          placeholder="Add checklist item..."
                          className="h-8 text-xs"
                        />
                        <Button size="sm" onClick={handleAddChecklist} className="h-8">
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    {/* Subtasks */}
                    <div className="space-y-2">
                      <Label className="text-xs flex items-center gap-2">
                        <ListChecks className="h-3 w-3" />
                        Subtasks
                      </Label>
                      {taskForm.subtasks && taskForm.subtasks.length > 0 && (
                        <div className="space-y-1">
                          {taskForm.subtasks.map((subtask, idx) => (
                            <div key={idx} className="flex items-center gap-2 p-2 bg-background rounded">
                              <Checkbox checked={subtask.completed} disabled />
                              <div className="flex-1 min-w-0">
                                <span className="text-xs">{subtask.label}</span>
                                <div className="flex gap-1 mt-1">
                                  <Badge className="text-xs h-4">{subtask.priority}</Badge>
                                  <Badge variant="outline" className="text-xs h-4">{subtask.status}</Badge>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-5 w-5"
                                onClick={() => handleRemoveSubtask(idx)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <Input
                            value={newSubtaskLabel}
                            onChange={(e) => setNewSubtaskLabel(e.target.value)}
                            placeholder="Add subtask..."
                            className="h-8 text-xs flex-1"
                          />
                          <select
                            value={newSubtaskPriority}
                            onChange={(e) => setNewSubtaskPriority(e.target.value as TaskPriority)}
                            className="h-8 rounded-md border border-input bg-background px-2 text-xs"
                          >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                            <option value="urgent">Urgent</option>
                          </select>
                          <Button size="sm" onClick={handleAddSubtask} className="h-8">
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleAddTask}>Add Task</Button>
                      <Button variant="ghost" size="sm" onClick={() => setAddingToStage(null)}>Cancel</Button>
                    </div>
                  </div>
                ) : (
                  !readOnly && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-xs text-primary mt-2"
                      onClick={() => {
                        setAddingToStage(stage)
                        setTaskForm({ ...taskForm, stage })
                      }}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add Task to {stage}
                    </Button>
                  )
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
