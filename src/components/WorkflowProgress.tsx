import { cn } from '@/lib/utils'
import { useProjects } from '@/contexts/ProjectContext'
import { useUser } from '@/contexts/UserContext'
import type { WorkflowStage } from '@/types'

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
  const { visibleStages, canAccessStage } = useUser()

  if (!currentProject) return null

  // Filter stages to show only what user can access
  const displayStages = allStages.filter((stage) => canAccessStage(stage))

  // If user can only see one stage, show full context with grayed out others
  const showFullWorkflow = visibleStages.length === 1
  const stagesToDisplay = showFullWorkflow ? allStages : displayStages

  const currentStageIndex = allStages.indexOf(currentProject.currentStage)

  const getStageStatus = (index: number): 'completed' | 'current' | 'upcoming' => {
    if (index < currentStageIndex) return 'completed'
    if (index === currentStageIndex) return 'current'
    return 'upcoming'
  }

  return (
    <div className="mb-8">
      <div className="flex items-center">
        {stagesToDisplay.map((stageName, index) => {
          const actualIndex = allStages.indexOf(stageName)
          const status = getStageStatus(actualIndex)
          const isAccessible = canAccessStage(stageName)

          return (
            <div key={stageName} className="flex items-center flex-1">
              <div className={cn("flex flex-col items-center relative w-full", !isAccessible && showFullWorkflow && "opacity-30")}>

                {/* Stage dot */}
                {status === 'current' ? (
                  <div className="relative">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-5 rounded-full bg-background p-0.5">
                      <div className="rounded-full bg-primary size-full"></div>
                    </div>
                    <div className="size-6 rounded-full ring-4 ring-primary bg-background z-10 flex items-center justify-center">
                      <div className="size-3 rounded-full bg-primary"></div>
                    </div>
                  </div>
                ) : status === 'completed' ? (
                  <div className="rounded-full bg-primary size-4 z-10"></div>
                ) : (
                  <div className="rounded-full border-2 border-slate-400 dark:border-slate-500 bg-background size-4 z-10"></div>
                )}
                <p
                  className={cn(
                    'text-xs font-bold mt-2 text-center',
                    status === 'completed' || status === 'current'
                      ? 'text-primary'
                      : 'text-slate-500 font-medium'
                  )}
                >
                  {stageName}
                </p>
              </div>
              {/* Connector line */}
              {index < stagesToDisplay.length - 1 && (
                <div
                  className={cn(
                    'w-full h-1',
                    status === 'completed'
                      ? 'bg-primary'
                      : 'bg-slate-200 dark:bg-slate-700',
                    !isAccessible && showFullWorkflow && "opacity-30"
                  )}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
