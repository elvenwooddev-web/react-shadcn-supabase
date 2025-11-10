import { useState } from 'react'
import { Download, CheckCircle, Clock, AlertCircle, MoreVertical } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useTasks } from '@/contexts/TaskContext'
import { useFiles } from '@/contexts/FileContext'
import { useProjects } from '@/contexts/ProjectContext'
import { TaskCard } from '@/components/tasks'
import { StageDocumentsTab } from '@/components/shared'

export function TaskList() {
  const [activeTab, setActiveTab] = useState<'tasks' | 'files' | 'documents'>('tasks')
  const { tasks: allTasks } = useTasks()
  const { files: allFiles } = useFiles()
  const { currentProject } = useProjects()

  // Filter tasks and files by current project stage
  const currentStage = currentProject?.currentStage
  const tasks = allTasks.filter((task) => task.stage === currentStage)
  const files = allFiles.filter((file) => file.requiredFrom === currentStage)

  return (
    <div className="bg-card rounded-xl p-6 border border-border">
      {/* Tabs */}
      <div className="flex border-b border-border mb-6">
        <button
          onClick={() => setActiveTab('tasks')}
          className={cn(
            'px-4 py-3 text-sm border-b-2',
            activeTab === 'tasks'
              ? 'border-primary text-primary font-semibold'
              : 'border-transparent text-muted-foreground hover:text-slate-800 dark:hover:text-slate-200 font-medium'
          )}
        >
          Current Tasks
        </button>
        <button
          onClick={() => setActiveTab('files')}
          className={cn(
            'px-4 py-3 text-sm border-b-2',
            activeTab === 'files'
              ? 'border-primary text-primary font-semibold'
              : 'border-transparent text-muted-foreground hover:text-slate-800 dark:hover:text-slate-200 font-medium'
          )}
        >
          Required Files
        </button>
        <button
          onClick={() => setActiveTab('documents')}
          className={cn(
            'px-4 py-3 text-sm border-b-2',
            activeTab === 'documents'
              ? 'border-primary text-primary font-semibold'
              : 'border-transparent text-muted-foreground hover:text-slate-800 dark:hover:text-slate-200 font-medium'
          )}
        >
          Stage Documents
        </button>
      </div>

      {/* Task List */}
      {activeTab === 'tasks' && (
        <div className="space-y-4">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
          {tasks.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              No tasks for your department yet. Click "Add Task" to create one.
            </div>
          )}
        </div>
      )}

      {/* Required Files Table */}
      {activeTab === 'files' && (
        <div>
          {/* Table Header */}
          <div className="grid grid-cols-[1fr_auto_auto_auto] gap-x-6 items-center py-2 px-4 text-xs font-semibold text-muted-foreground border-b border-border uppercase">
            <span>File Name</span>
            <span className="text-center">Required From</span>
            <span className="text-center">Status</span>
            <span className="text-right">Actions</span>
          </div>
          {/* Table Rows */}
          <div className="divide-y divide-border">
            {files.map((file) => (
              <div
                key={file.id}
                className="grid grid-cols-[1fr_auto_auto_auto] gap-x-6 items-center py-4 px-4 hover:bg-muted"
              >
                {/* File Name */}
                <div>
                  <p className="font-medium text-foreground">
                    {file.fileName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {file.uploadDate ? `Uploaded: ${file.uploadDate}` : 'Not yet uploaded'}
                  </p>
                </div>
                {/* Required From */}
                <div className="text-center text-sm">{file.requiredFrom}</div>
                {/* Status */}
                <div className="flex justify-center">
                  {file.status === 'received' && (
                    <Badge
                      variant="success"
                      className="flex items-center gap-1.5"
                    >
                      <CheckCircle className="h-3 w-3" />
                      <span>Received</span>
                    </Badge>
                  )}
                  {file.status === 'pending' && (
                    <Badge
                      variant="warning"
                      className="flex items-center gap-1.5"
                    >
                      <Clock className="h-3 w-3" />
                      <span>Pending</span>
                    </Badge>
                  )}
                  {file.status === 'missing' && (
                    <Badge
                      className="flex items-center gap-1.5 bg-danger/20 text-danger"
                    >
                      <AlertCircle className="h-3 w-3" />
                      <span>Missing</span>
                    </Badge>
                  )}
                </div>
                {/* Actions */}
                <div className="flex justify-end items-center gap-2">
                  {file.status === 'received' ? (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hover:bg-muted/80"
                    >
                      <Download className="h-5 w-5" />
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-3 bg-muted hover:bg-muted/80"
                      >
                        Upload
                      </Button>
                      {file.status === 'missing' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-muted/80"
                        >
                          <MoreVertical className="h-5 w-5" />
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stage Documents */}
      {activeTab === 'documents' && <StageDocumentsTab />}
    </div>
  )
}
