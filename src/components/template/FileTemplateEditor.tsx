import { useState } from 'react'
import { Plus, Trash2, ChevronDown, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import type { TemplateFile, WorkflowStage, FileStatus } from '@/types'

const WORKFLOW_STAGES: WorkflowStage[] = [
  'Sales',
  'Design',
  'Technical Design',
  'Procurement',
  'Production',
  'Execution',
  'Post Installation',
]

interface FileTemplateEditorProps {
  files: TemplateFile[]
  onAddFile: (file: TemplateFile) => void
  onDeleteFile: (index: number) => void
  readOnly?: boolean
}

export function FileTemplateEditor({ files, onAddFile, onDeleteFile, readOnly = false }: FileTemplateEditorProps) {
  const [expandedStages, setExpandedStages] = useState<Set<WorkflowStage>>(new Set(WORKFLOW_STAGES))
  const [addingToStage, setAddingToStage] = useState<WorkflowStage | null>(null)
  const [fileForm, setFileForm] = useState({
    fileName: '',
    description: '',
    status: 'pending' as FileStatus,
  })

  const toggleStage = (stage: WorkflowStage) => {
    const newExpanded = new Set(expandedStages)
    if (newExpanded.has(stage)) {
      newExpanded.delete(stage)
    } else {
      newExpanded.add(stage)
    }
    setExpandedStages(newExpanded)
  }

  const getFilesByStage = (stage: WorkflowStage) => {
    return files
      .map((file, index) => ({ file, index }))
      .filter(({ file }) => file.requiredFrom === stage)
  }

  const handleAddFile = () => {
    if (!fileForm.fileName.trim() || !addingToStage) return

    onAddFile({
      fileName: fileForm.fileName,
      description: fileForm.description || undefined,
      requiredFrom: addingToStage,
      status: fileForm.status,
    })
    setFileForm({ fileName: '', description: '', status: 'pending' })
    setAddingToStage(null)
  }

  return (
    <div className="space-y-4">
      {WORKFLOW_STAGES.map((stage) => {
        const stageFiles = getFilesByStage(stage)
        const isExpanded = expandedStages.has(stage)

        return (
          <div key={stage} className="bg-card border border-border rounded-lg">
            <button
              onClick={() => toggleStage(stage)}
              className="w-full flex items-center justify-between p-4 hover:bg-muted transition-colors rounded-t-lg"
            >
              <div className="flex items-center gap-3">
                <h3 className="font-semibold text-foreground">{stage}</h3>
                <Badge variant="outline">{stageFiles.length} files</Badge>
              </div>
              <ChevronDown
                className={`h-5 w-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              />
            </button>

            {isExpanded && (
              <div className="p-4 border-t border-border space-y-2">
                {stageFiles.map(({ file, index }) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted group">
                    <div className="flex items-center gap-3 flex-1">
                      <FileText className="h-4 w-4 text-primary" />
                      <div>
                        <p className="font-medium text-sm">{file.fileName}</p>
                        {file.description && (
                          <p className="text-xs text-muted-foreground">{file.description}</p>
                        )}
                      </div>
                    </div>
                    {!readOnly && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 opacity-0 group-hover:opacity-100 hover:bg-danger/10 hover:text-danger"
                        onClick={() => onDeleteFile(index)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                ))}

                {addingToStage === stage ? (
                  <div className="p-3 bg-muted rounded-lg space-y-3 mt-2">
                    <Input
                      value={fileForm.fileName}
                      onChange={(e) => setFileForm({ ...fileForm, fileName: e.target.value })}
                      placeholder="File name*"
                      autoFocus
                    />
                    <Input
                      value={fileForm.description}
                      onChange={(e) => setFileForm({ ...fileForm, description: e.target.value })}
                      placeholder="Description (optional)"
                    />
                    <select
                      value={fileForm.status}
                      onChange={(e) => setFileForm({ ...fileForm, status: e.target.value as FileStatus })}
                      className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                    >
                      <option value="pending">Pending</option>
                      <option value="received">Received</option>
                      <option value="missing">Missing</option>
                    </select>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleAddFile}>Add File</Button>
                      <Button variant="ghost" size="sm" onClick={() => setAddingToStage(null)}>Cancel</Button>
                    </div>
                  </div>
                ) : (
                  !readOnly && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-xs text-primary mt-2"
                      onClick={() => setAddingToStage(stage)}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add File to {stage}
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
