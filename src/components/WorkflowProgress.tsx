import { useState } from 'react'
import { cn } from '@/lib/utils'
import { useProjects } from '@/contexts/ProjectContext'
import { useStages } from '@/contexts/StageContext'
import { useUser } from '@/contexts/UserContext'
import { StageDetailDialog } from '@/components/StageDetailDialog'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import type { WorkflowStage, ProjectStage } from '@/types'

const allStages: WorkflowStage[] = [
  'Sales',
  'Design',
  'Technical Design',
  'Procurement',
  'Production',
  'Execution',
  'Post Installation',
]

export function WorkflowProgress() {
  const { currentProject } = useProjects()
  const { stages, getStageByName } = useStages()
  const { visibleStages, canAccessStage } = useUser()
  const [selectedStage, setSelectedStage] = useState<ProjectStage | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  if (!currentProject) return null

  // Filter stages to show only what user can access
  const displayStages = allStages.filter((stage) => canAccessStage(stage))

  // If user can only see one stage, show full context with grayed out others
  const showFullWorkflow = visibleStages.length === 1
  const stagesToDisplay = showFullWorkflow ? allStages : displayStages

  const handleStageClick = (stageName: WorkflowStage) => {
    const stageData = getStageByName(stageName)
    if (stageData) {
      setSelectedStage(stageData)
      setDialogOpen(true)
    }
  }

  return (
    <>
      <div className="mb-8">
        <div className="flex items-center">
          {stagesToDisplay.map((stageName, index) => {
            const stageData = getStageByName(stageName)
            const actualIndex = allStages.indexOf(stageName)
            const status = stageData?.status || 'pending'
            const isAccessible = canAccessStage(stageName)
            const isClickable = isAccessible && stageData

            return (
              <div key={stageName} className="flex items-center flex-1">
                <button
                  onClick={() => isClickable && handleStageClick(stageName)}
                  disabled={!isClickable}
                  className={cn(
                    "flex flex-col items-center relative w-full",
                    !isAccessible && showFullWorkflow && "opacity-30",
                    isClickable && "cursor-pointer hover:opacity-80 transition-opacity"
                  )}
                >
                  {/* Stage dot */}
                  {status === 'active' ? (
                    <div className="relative">
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-5 rounded-full bg-background p-0.5">
                        <div className="rounded-full bg-primary size-full"></div>
                      </div>
                      <div className="size-6 rounded-full ring-4 ring-primary bg-background z-10 flex items-center justify-center">
                        <div className="size-3 rounded-full bg-primary"></div>
                      </div>
                    </div>
                  ) : status === 'completed' ? (
                    <div className="rounded-full bg-success size-4 z-10"></div>
                  ) : status === 'blocked' ? (
                    <div className="rounded-full bg-danger size-4 z-10"></div>
                  ) : (
                    <div className="rounded-full border-2 border-border bg-background size-4 z-10"></div>
                  )}

                  {/* Stage name and metadata */}
                  <p
                    className={cn(
                      'text-xs font-bold mt-2 text-center',
                      status === 'completed' ? 'text-success' :
                      status === 'active' ? 'text-primary' :
                      status === 'blocked' ? 'text-danger' :
                      'text-muted-foreground font-medium'
                    )}
                  >
                    {stageName}
                  </p>

                  {/* Department head avatar */}
                  {stageData?.departmentHead && isAccessible && (
                    <Avatar src={stageData.departmentHead.avatar} className="size-4 mt-1" title={stageData.departmentHead.name} />
                  )}

                  {/* Due date badge */}
                  {stageData?.dueDate && isAccessible && (
                    <Badge variant="outline" className="text-xs mt-1 h-4 px-1">
                      {stageData.dueDate}
                    </Badge>
                  )}

                  {/* Priority indicator */}
                  {stageData && stageData.priority !== 'medium' && isAccessible && (
                    <div className={cn(
                      "absolute -top-1 -right-1 size-2 rounded-full",
                      stageData.priority === 'urgent' ? 'bg-danger' :
                      stageData.priority === 'high' ? 'bg-warning' :
                      'bg-muted'
                    )} />
                  )}
                </button>

                {/* Connector line */}
                {index < stagesToDisplay.length - 1 && (
                  <div
                    className={cn(
                      'w-full h-1',
                      status === 'completed' ? 'bg-success' :
                      status === 'active' ? 'bg-primary' :
                      status === 'blocked' ? 'bg-danger' :
                      'bg-muted',
                      !isAccessible && showFullWorkflow && "opacity-30"
                    )}
                  />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {selectedStage && (
        <StageDetailDialog
          stage={selectedStage}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
        />
      )}
    </>
  )
}
