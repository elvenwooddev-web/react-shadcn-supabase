import { useState } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Trash2, RotateCcw, AlertCircle } from 'lucide-react'
import { useStatusConfig } from '@/contexts/StatusConfigContext'
import type { StatusConfig, StatusEntityType } from '@/types'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { StatusBadge } from '@/components/ui/status-badge'
import { AddStatusDialog } from '@/components/settings/AddStatusDialog'
import { EditStatusDialog } from '@/components/settings/EditStatusDialog'
import { DeleteConfirmDialog } from '@/components/DeleteConfirmDialog'

interface SortableStatusItemProps {
  status: StatusConfig
  onDelete: (id: string) => void
}

function SortableStatusItem({ status, onDelete }: SortableStatusItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: status.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const { getStatusUsageCount } = useStatusConfig()
  const usageCount = getStatusUsageCount(status.id)

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 p-3 bg-card border border-border rounded-lg hover:border-primary/50 transition-colors"
    >
      {/* Drag Handle */}
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
      >
        <GripVertical className="h-5 w-5" />
      </button>

      {/* Status Badge Preview */}
      <StatusBadge
        entityType={status.entityType}
        status={status.value}
        showIcon={!!status.icon}
      />

      {/* Status Info */}
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">{status.label}</span>
          {status.isDefault && (
            <Badge variant="outline" className="text-xs h-5">
              Default
            </Badge>
          )}
          {!status.isActive && (
            <Badge variant="outline" className="text-xs h-5 bg-muted">
              Inactive
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          Value: <span className="font-mono">{status.value}</span>
          {usageCount > 0 && ` • Used in ${usageCount} items`}
        </p>
      </div>

      {/* Transitions Info */}
      {status.allowedTransitions && status.allowedTransitions.length > 0 && (
        <div className="text-xs text-muted-foreground">
          {status.allowedTransitions.length} transition{status.allowedTransitions.length !== 1 ? 's' : ''}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-1">
        <EditStatusDialog status={status} />
        <DeleteConfirmDialog
          onConfirm={() => onDelete(status.id)}
          title="Delete Status"
          description={`Are you sure you want to delete the "${status.label}" status? This action cannot be undone.${
            usageCount > 0 ? ` This status is currently used in ${usageCount} items.` : ''
          }`}
          trigger={
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-danger hover:text-danger hover:bg-danger/10"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          }
        />
      </div>
    </div>
  )
}

const ENTITY_TYPES: { value: StatusEntityType; label: string }[] = [
  { value: 'task', label: 'Tasks' },
  { value: 'subtask', label: 'Subtasks' },
  { value: 'issue', label: 'Issues' },
  { value: 'stage', label: 'Stages' },
  { value: 'document', label: 'Documents' },
  { value: 'file', label: 'Files' },
  { value: 'project', label: 'Projects' },
]

export function StatusConfigTab() {
  const [activeTab, setActiveTab] = useState<StatusEntityType>('task')
  const { getStatusConfigs, deleteStatus, reorderStatuses, resetToDefaults } = useStatusConfig()

  const statuses = getStatusConfigs(activeTab)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = statuses.findIndex((s) => s.id === active.id)
      const newIndex = statuses.findIndex((s) => s.id === over.id)

      const reordered = arrayMove(statuses, oldIndex, newIndex)
      const statusIds = reordered.map((s) => s.id)
      reorderStatuses(activeTab, statusIds)
    }
  }

  const handleReset = () => {
    if (
      confirm(
        `Reset ${activeTab} statuses to defaults? This will remove all custom statuses for this entity type.`
      )
    ) {
      resetToDefaults(activeTab)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold">Status Configuration</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Customize statuses for tasks, issues, stages, and more. Drag to reorder.
          </p>
        </div>
        <Button variant="outline" onClick={handleReset} className="gap-2">
          <RotateCcw className="h-4 w-4" />
          Reset to Defaults
        </Button>
      </div>

      {/* Entity Type Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as StatusEntityType)}>
        <TabsList className="grid w-full grid-cols-7">
          {ENTITY_TYPES.map((type) => (
            <TabsTrigger key={type.value} value={type.value}>
              {type.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {ENTITY_TYPES.map((type) => (
          <TabsContent key={type.value} value={type.value} className="space-y-4 mt-6">
            {/* Add Status Button */}
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                {statuses.length} status{statuses.length !== 1 ? 'es' : ''} configured
              </p>
              <AddStatusDialog entityType={type.value} />
            </div>

            {/* Info Card */}
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Status Management Tips</p>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li>• Drag statuses to reorder how they appear in dropdowns</li>
                      <li>• Set one status as "default" for new items</li>
                      <li>• Configure transitions to enforce workflow rules</li>
                      <li>• Inactive statuses are hidden but preserve data</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Status List with Drag and Drop */}
            {statuses.length > 0 ? (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={statuses.map((s) => s.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-2">
                    {statuses.map((status) => (
                      <SortableStatusItem
                        key={status.id}
                        status={status}
                        onDelete={deleteStatus}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground mb-4">
                    No statuses configured for {type.label.toLowerCase()}
                  </p>
                  <AddStatusDialog entityType={type.value} />
                </CardContent>
              </Card>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
