import { useState } from 'react'
import { Plus, Trash2, ChevronDown, File } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import type { TemplateDocument, WorkflowStage, DocumentCategory, DocumentStatus } from '@/types'

const WORKFLOW_STAGES: WorkflowStage[] = [
  'Sales',
  'Design',
  'Technical Design',
  'Procurement',
  'Production',
  'Execution',
  'Post Installation',
]

interface DocumentTemplateEditorProps {
  documents: TemplateDocument[]
  onAddDocument: (doc: TemplateDocument) => void
  onDeleteDocument: (index: number) => void
  readOnly?: boolean
}

export function DocumentTemplateEditor({ documents, onAddDocument, onDeleteDocument, readOnly = false }: DocumentTemplateEditorProps) {
  const [expandedStages, setExpandedStages] = useState<Set<WorkflowStage>>(new Set(WORKFLOW_STAGES))
  const [addingToStage, setAddingToStage] = useState<WorkflowStage | null>(null)
  const [docForm, setDocForm] = useState({
    title: '',
    description: '',
    category: 'report' as DocumentCategory,
    status: 'pending' as DocumentStatus,
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

  const getDocumentsByStage = (stage: WorkflowStage) => {
    return documents
      .map((doc, index) => ({ doc, index }))
      .filter(({ doc }) => doc.stage === stage)
  }

  const handleAddDocument = () => {
    if (!docForm.title.trim() || !addingToStage) return

    onAddDocument({
      title: docForm.title,
      description: docForm.description || undefined,
      category: docForm.category,
      stage: addingToStage,
      status: docForm.status,
    })
    setDocForm({ title: '', description: '', category: 'report', status: 'pending' })
    setAddingToStage(null)
  }

  const categoryColors = {
    contract: 'bg-danger/20 text-danger',
    report: 'bg-primary/20 text-primary',
    specification: 'bg-warning/20 text-warning',
    checklist: 'bg-success/20 text-success',
  }

  return (
    <div className="space-y-4">
      {WORKFLOW_STAGES.map((stage) => {
        const stageDocs = getDocumentsByStage(stage)
        const isExpanded = expandedStages.has(stage)

        return (
          <div key={stage} className="bg-card border border-border rounded-lg">
            <button
              onClick={() => toggleStage(stage)}
              className="w-full flex items-center justify-between p-4 hover:bg-muted transition-colors rounded-t-lg"
            >
              <div className="flex items-center gap-3">
                <h3 className="font-semibold text-foreground">{stage}</h3>
                <Badge variant="outline">{stageDocs.length} documents</Badge>
              </div>
              <ChevronDown
                className={`h-5 w-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              />
            </button>

            {isExpanded && (
              <div className="p-4 border-t border-border space-y-2">
                {stageDocs.map(({ doc, index }) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted group">
                    <div className="flex items-center gap-3 flex-1">
                      <File className="h-4 w-4 text-primary" />
                      <div>
                        <p className="font-medium text-sm">{doc.title}</p>
                        {doc.description && (
                          <p className="text-xs text-muted-foreground">{doc.description}</p>
                        )}
                        <div className="flex gap-2 mt-1">
                          <Badge className={`${categoryColors[doc.category]} border-0 text-xs`}>
                            {doc.category}
                          </Badge>
                          <Badge variant="outline" className="text-xs">{doc.status}</Badge>
                        </div>
                      </div>
                    </div>
                    {!readOnly && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 opacity-0 group-hover:opacity-100 hover:bg-danger/10 hover:text-danger"
                        onClick={() => onDeleteDocument(index)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                ))}

                {addingToStage === stage ? (
                  <div className="p-3 bg-muted rounded-lg space-y-3 mt-2">
                    <Input
                      value={docForm.title}
                      onChange={(e) => setDocForm({ ...docForm, title: e.target.value })}
                      placeholder="Document title*"
                      autoFocus
                    />
                    <Input
                      value={docForm.description}
                      onChange={(e) => setDocForm({ ...docForm, description: e.target.value })}
                      placeholder="Description (optional)"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <select
                        value={docForm.category}
                        onChange={(e) => setDocForm({ ...docForm, category: e.target.value as DocumentCategory })}
                        className="flex h-9 rounded-md border border-input bg-background px-3 text-sm"
                      >
                        <option value="contract">Contract</option>
                        <option value="report">Report</option>
                        <option value="specification">Specification</option>
                        <option value="checklist">Checklist</option>
                      </select>
                      <select
                        value={docForm.status}
                        onChange={(e) => setDocForm({ ...docForm, status: e.target.value as DocumentStatus })}
                        className="flex h-9 rounded-md border border-input bg-background px-3 text-sm"
                      >
                        <option value="pending">Pending</option>
                        <option value="uploaded">Uploaded</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleAddDocument}>Add Document</Button>
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
                      Add Document to {stage}
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
