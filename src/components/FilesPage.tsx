import { ChevronDown, Download, Upload, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useProjects } from '@/contexts/ProjectContext'
import { useFiles } from '@/contexts/FileContext'
import type { WorkflowStage } from '@/types'

const allStages: WorkflowStage[] = [
  'Sales',
  'Design',
  'Technical Design',
  'Procurement',
  'Production',
]

export function FilesPage() {
  const { currentProject } = useProjects()
  const { files } = useFiles()

  if (!currentProject) {
    return (
      <main className="flex-1 p-6 lg:p-8 flex items-center justify-center">
        <p className="text-muted-foreground">No project selected</p>
      </main>
    )
  }

  // Group files by stage
  const stageFiles = allStages.map((stageName) => {
    const stageFilesList = files.filter((f) => f.requiredFrom === stageName)
    const completed = stageFilesList.filter((f) => f.status === 'received').length
    return {
      stageName,
      completed,
      total: stageFilesList.length,
      files: stageFilesList.map((f) => ({
        id: f.id,
        name: f.fileName,
        status: f.status,
      })),
      isOpen: completed > 0 || stageFilesList.some((f) => f.status === 'missing'),
    }
  }).filter((stage) => stage.total > 0)

  const totalFiles = files.length
  const completedFiles = files.filter((f) => f.status === 'received').length
  const completionPercentage = totalFiles > 0 ? Math.round((completedFiles / totalFiles) * 100) : 0

  return (
    <main className="flex-1 p-6 lg:p-8">
      {/* Page Header */}
      <div className="flex flex-wrap justify-between gap-4 items-center mb-6">
        <div className="flex min-w-72 flex-col gap-1">
          <p className="text-slate-900 dark:text-slate-50 text-3xl font-black leading-tight tracking-[-0.03em]">
            Required Project Files
          </p>
          <p className="text-slate-500 dark:text-slate-400 text-base font-normal leading-normal">
            {currentProject.name} - {currentProject.projectType}
          </p>
        </div>
      </div>

      {/* Overall Progress */}
      <div className="bg-white dark:bg-slate-900/50 rounded-xl p-6 border border-slate-200 dark:border-slate-800 mb-6">
        <div className="flex items-center gap-6">
          <div className="flex-1">
            <div className="flex justify-between items-center mb-1">
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                Overall File Completion
              </h3>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                {completionPercentage}%
              </span>
            </div>
            <Progress value={completionPercentage} />
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">
              {completedFiles}
              <span className="text-base font-medium text-slate-500 dark:text-slate-400">
                /{totalFiles}
              </span>
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Files Uploaded</p>
          </div>
        </div>
      </div>

      {/* Stage Files */}
      <div className="space-y-4">
        {stageFiles.map((stage) => (
          <details
            key={stage.stageName}
            className="group bg-white dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800"
            open={stage.isOpen}
          >
            <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-t-xl list-none">
              <div className="flex items-center gap-3">
                <h3 className="font-semibold text-slate-800 dark:text-slate-200">
                  {stage.stageName}
                </h3>
                {stage.completed === stage.total ? (
                  <Badge variant="success" className="text-xs">
                    {stage.completed}/{stage.total} Complete
                  </Badge>
                ) : stage.completed > 0 ? (
                  <Badge variant="warning" className="text-xs">
                    {stage.completed}/{stage.total} Complete
                  </Badge>
                ) : (
                  <Badge
                    className="text-xs bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                  >
                    {stage.completed}/{stage.total} Complete
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-500 dark:text-slate-400">Expand</span>
                <ChevronDown className="h-5 w-5 transition-transform group-open:rotate-180" />
              </div>
            </summary>
            <div className="border-t border-slate-200 dark:border-slate-800 p-2 space-y-1">
              {stage.files.map((file) => (
                <div
                  key={file.id}
                  className="grid grid-cols-[1fr_120px_48px] gap-x-4 items-center py-2 px-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg"
                >
                  <p className="font-medium text-sm text-slate-800 dark:text-slate-200 truncate">
                    {file.name}
                  </p>
                  <div className="flex justify-center">
                    {file.status === 'received' && (
                      <Badge
                        variant="success"
                        className="flex items-center gap-1.5 text-xs"
                      >
                        <CheckCircle className="h-3 w-3" />
                        <span>Received</span>
                      </Badge>
                    )}
                    {file.status === 'pending' && (
                      <Badge
                        variant="warning"
                        className="flex items-center gap-1.5 text-xs"
                      >
                        <Clock className="h-3 w-3" />
                        <span>Pending</span>
                      </Badge>
                    )}
                    {file.status === 'missing' && (
                      <Badge
                        className="flex items-center gap-1.5 text-xs bg-danger/20 text-danger"
                      >
                        <AlertCircle className="h-3 w-3" />
                        <span>Missing</span>
                      </Badge>
                    )}
                  </div>
                  <div className="flex justify-end">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                    >
                      {file.status === 'received' ? (
                        <Download className="h-5 w-5" />
                      ) : (
                        <Upload className="h-5 w-5" />
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </details>
        ))}
      </div>
    </main>
  )
}
