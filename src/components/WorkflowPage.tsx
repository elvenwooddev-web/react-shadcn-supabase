import { ArrowRight, CheckCircle } from 'lucide-react'
import { WorkflowProgress } from '@/components/WorkflowProgress'
import { TaskList } from '@/components/TaskList'
import { AddTaskDialog } from '@/components/AddTaskDialog'
import { Button } from '@/components/ui/button'
import { useProjects } from '@/contexts/ProjectContext'

export function WorkflowPage() {
  const { currentProject } = useProjects()

  if (!currentProject) {
    return (
      <main className="flex-1 p-6 lg:p-8 flex items-center justify-center">
        <p className="text-muted-foreground">No project selected</p>
      </main>
    )
  }

  return (
    <main className="flex-1 p-6 lg:p-8">
      {/* Page Header */}
      <div className="flex flex-wrap justify-between gap-4 items-center mb-6">
        <div className="flex min-w-72 flex-col gap-1">
          <p className="text-slate-900 dark:text-slate-50 text-3xl font-black leading-tight tracking-[-0.03em]">
            {currentProject.name} - {currentProject.projectType}
          </p>
          <p className="text-slate-500 dark:text-slate-400 text-base font-normal leading-normal">
            Client: {currentProject.clientName} | Project ID: {currentProject.id.substring(0, 8)}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center gap-2 rounded-lg h-10 px-4 bg-success/20 text-success text-sm font-bold">
            <CheckCircle className="h-4 w-4" />
            <span>{currentProject.status === 'active' ? 'On Track' : currentProject.status}</span>
          </div>
          <AddTaskDialog />
          <Button className="flex items-center justify-center gap-2 rounded-lg h-10 px-5 bg-primary text-white text-sm font-bold shadow-sm hover:bg-primary/90">
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
