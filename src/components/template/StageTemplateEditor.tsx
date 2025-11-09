import { useState } from 'react'
import { Plus, Trash2, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import type { TemplateStage, WorkflowStage, StageStatus, TaskPriority } from '@/types'

interface StageTemplateEditorProps {
  stages: TemplateStage[]
  onUpdateStage: (index: number, data: Partial<TemplateStage>) => void
  readOnly?: boolean
}

const WORKFLOW_STAGES: WorkflowStage[] = [
  'Sales',
  'Design',
  'Technical Design',
  'Procurement',
  'Production',
  'Execution',
  'Post Installation',
]

export function StageTemplateEditor({ stages, onUpdateStage, readOnly = false }: StageTemplateEditorProps) {
  // Ensure all 7 stages are represented
  const allStages: TemplateStage[] = WORKFLOW_STAGES.map((stageName) => {
    const existing = stages.find((s) => s.stage === stageName)
    return existing || {
      stage: stageName,
      status: 'todo' as StageStatus,
      priority: 'low' as TaskPriority,
      startDate: null,
      dueDate: null,
      departmentHeadRole: '',
      notes: '',
    }
  })

  return (
    <div className="space-y-4">
      {readOnly && (
        <div className="bg-muted/50 border border-border rounded-lg p-4 mb-4">
          <p className="text-sm text-muted-foreground">
            This is a built-in template. Clone this template to customize stage configurations.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {allStages.map((stage, index) => {
          const actualIndex = stages.findIndex((s) => s.stage === stage.stage)
          const stageIndex = actualIndex >= 0 ? actualIndex : index

          return (
            <Card key={stage.stage} className="p-4">
              <div className="space-y-4">
                {/* Stage Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-foreground">{stage.stage}</h3>
                    <p className="text-xs text-muted-foreground">Configure stage timeline and ownership</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={stage.status === 'todo' ? 'outline' : 'default'}>
                      {stage.status}
                    </Badge>
                    <Badge variant={stage.priority === 'low' ? 'outline' : 'default'}>
                      {stage.priority}
                    </Badge>
                  </div>
                </div>

                {/* Stage Configuration */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`status-${index}`}>Status</Label>
                    <select
                      id={`status-${index}`}
                      value={stage.status}
                      onChange={(e) => onUpdateStage(stageIndex, { status: e.target.value as StageStatus })}
                      disabled={readOnly}
                      className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="todo">Todo</option>
                      <option value="pending">Pending</option>
                      <option value="active">Active</option>
                      <option value="completed">Completed</option>
                      <option value="blocked">Blocked</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`priority-${index}`}>Priority</Label>
                    <select
                      id={`priority-${index}`}
                      value={stage.priority}
                      onChange={(e) => onUpdateStage(stageIndex, { priority: e.target.value as TaskPriority })}
                      disabled={readOnly}
                      className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`due-days-${index}`}>
                      Due Date
                      <span className="text-xs text-muted-foreground ml-1">(days from project start)</span>
                    </Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id={`due-days-${index}`}
                        type="number"
                        value={stage.dueDate || ''}
                        onChange={(e) => onUpdateStage(stageIndex, { dueDate: e.target.value })}
                        disabled={readOnly}
                        placeholder="e.g., 14"
                        className="pl-9"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`dept-head-${index}`}>Department Head Role</Label>
                    <Input
                      id={`dept-head-${index}`}
                      value={stage.departmentHeadRole}
                      onChange={(e) => onUpdateStage(stageIndex, { departmentHeadRole: e.target.value })}
                      disabled={readOnly}
                      placeholder="e.g., Sales Manager"
                    />
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor={`notes-${index}`}>Notes</Label>
                  <textarea
                    id={`notes-${index}`}
                    value={stage.notes || ''}
                    onChange={(e) => onUpdateStage(stageIndex, { notes: e.target.value })}
                    disabled={readOnly}
                    placeholder="Add notes about this stage..."
                    className="flex min-h-16 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {!readOnly && (
        <div className="bg-muted/50 border border-border rounded-lg p-4 mt-4">
          <p className="text-sm text-muted-foreground">
            Configure stage timelines, priorities, and department head roles. Due dates are calculated as days from the project start date.
          </p>
        </div>
      )}
    </div>
  )
}
