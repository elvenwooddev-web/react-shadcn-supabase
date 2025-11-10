import { ArrowRight, CheckCircle } from 'lucide-react'
import { WorkflowProgress } from '@/components/WorkflowProgress'
import { TaskList } from '@/components/TaskList'
import { AddTaskDialog } from '@/components/AddTaskDialog'
import { Button } from '@/components/ui/button'
import { useProjects } from '@/contexts/ProjectContext'
import { useTasks } from '@/contexts/TaskContext'
import { useFiles } from '@/contexts/FileContext'
import type { WorkflowStage } from '@/types'

const WORKFLOW_STAGES: WorkflowStage[] = [
  'Sales',
  'Design',
  'Technical Design',
  'Procurement',
  'Production',
  'Execution',
  'Post Installation',
]

export function WorkflowPage() {
  const { currentProject, updateProject } = useProjects()
  const { tasks } = useTasks()
  const { files } = useFiles()

  if (!currentProject) {
    return (
      <main className="flex-1 p-6 lg:p-8 bg-background flex items-center justify-center">
        <p className="text-muted-foreground">No project selected</p>
      </main>
    )
  }

  const currentStage = currentProject.currentStage
  const currentStageTasks = tasks.filter((task) => task.stage === currentStage)
  const currentStageFiles = files.filter((file) => file.requiredFrom === currentStage)

  // Check if current stage is complete
  const allTasksComplete = currentStageTasks.length > 0 && currentStageTasks.every((task) => task.status === 'completed')
  const allFilesReceived = currentStageFiles.length > 0 && currentStageFiles.every((file) => file.status === 'received')
  const canCompleteStage = allTasksComplete && allFilesReceived

  const handleCompleteStage = () => {
    if (!canCompleteStage) {
      alert('Please complete all tasks and receive all required files before moving to the next stage.')
      return
    }

    const currentIndex = WORKFLOW_STAGES.indexOf(currentStage)
    if (currentIndex === -1 || currentIndex === WORKFLOW_STAGES.length - 1) {
      alert('This is the final stage. Mark the project as completed instead.')
      return
    }

    const nextStage = WORKFLOW_STAGES[currentIndex + 1]
    updateProject(currentProject.id, {
      currentStage: nextStage,
    })
  }

  return (
    <main className="flex-1 p-6 lg:p-8 bg-background">
      {/* Page Header */}
      <div className="flex flex-wrap justify-between gap-4 items-center mb-6">
        <div className="flex min-w-72 flex-col gap-1">
          <p className="text-foreground text-3xl font-black leading-tight tracking-[-0.03em]">
            {currentProject.name} - {currentProject.projectType}
          </p>
          <p className="text-muted-foreground text-base font-normal leading-normal">
            Client: {currentProject.clientName} | Project ID: {currentProject.id.substring(0, 8)}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center gap-2 rounded-lg h-10 px-4 bg-success/20 text-success text-sm font-bold">
            <CheckCircle className="h-4 w-4" />
            <span>{currentProject.status === 'active' ? 'On Track' : currentProject.status}</span>
          </div>
          <AddTaskDialog />
          <Button
            onClick={handleCompleteStage}
            disabled={!canCompleteStage}
            className="flex items-center justify-center gap-2 rounded-lg h-10 px-5 bg-primary text-white text-sm font-bold shadow-sm hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            title={!canCompleteStage ? 'Complete all tasks and receive all files to proceed' : 'Move to next stage'}
          >
            <ArrowRight className="h-4 w-4" />
            <span>Complete Stage & Handoff</span>
          </Button>
        </div>
      </div>

      {/* Workflow Progress */}
      <WorkflowProgress />

      {/* Task List */}
      <TaskList />
    </main>
  )
}
