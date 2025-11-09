import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Save, FileText, FolderOpen, File, Network } from 'lucide-react'
import { useTemplates } from '@/contexts/TemplateContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TaskTemplateEditor } from '@/components/template/TaskTemplateEditor'
import { FileTemplateEditor } from '@/components/template/FileTemplateEditor'
import { DocumentTemplateEditor } from '@/components/template/DocumentTemplateEditor'
import { StageTemplateEditor } from '@/components/template/StageTemplateEditor'
import type { TemplateTask, TemplateFile, TemplateDocument, TemplateStage } from '@/types'

type TabType = 'tasks' | 'files' | 'documents' | 'stages'

export function TemplateEditorPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { getTemplate, updateTemplate, updateTemplateStage, addTaskToTemplate, updateTemplateTask, deleteTemplateTask, addFileToTemplate, deleteTemplateFile, addDocumentToTemplate, deleteTemplateDocument } = useTemplates()

  const template = id ? getTemplate(id) : null

  const [activeTab, setActiveTab] = useState<TabType>('tasks')
  const [templateName, setTemplateName] = useState(template?.name || '')
  const [templateDescription, setTemplateDescription] = useState(template?.description || '')
  const [templateType, setTemplateType] = useState(template?.projectType || 'Residential')
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    if (template) {
      setTemplateName(template.name)
      setTemplateDescription(template.description)
      setTemplateType(template.projectType)
    }
  }, [template])

  if (!template) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Template not found</p>
          <Button onClick={() => navigate('/templates')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Templates
          </Button>
        </div>
      </div>
    )
  }

  const handleSave = () => {
    if (!id) return

    updateTemplate(id, {
      name: templateName,
      description: templateDescription,
      projectType: templateType,
    })
    setHasChanges(false)
  }

  const tabs = [
    { id: 'tasks', label: 'Tasks', icon: FileText, count: template.tasks.length },
    { id: 'files', label: 'Required Files', icon: FolderOpen, count: template.requiredFiles.length },
    { id: 'documents', label: 'Stage Documents', icon: File, count: template.stageDocuments.length },
    { id: 'stages', label: 'Stages', icon: Network, count: template.stages?.length || 0 },
  ]

  const readOnly = template.isBuiltIn

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/templates')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Templates
          </Button>
          {!readOnly && (
            <Button onClick={handleSave} disabled={!hasChanges}>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          )}
        </div>

        {/* Template Info Card */}
        <Card className="mb-6">
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-foreground">
                {readOnly ? template.name : 'Edit Template'}
              </h1>
              {readOnly && <Badge variant="secondary">Built-in (Read-Only)</Badge>}
            </div>

            {!readOnly && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="template-name">Template Name*</Label>
                  <Input
                    id="template-name"
                    value={templateName}
                    onChange={(e) => {
                      setTemplateName(e.target.value)
                      setHasChanges(true)
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="template-type">Project Type*</Label>
                  <select
                    id="template-type"
                    value={templateType}
                    onChange={(e) => {
                      setTemplateType(e.target.value)
                      setHasChanges(true)
                    }}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="Residential">Residential</option>
                    <option value="Retail/Commercial">Retail/Commercial</option>
                    <option value="Office">Office</option>
                    <option value="Hospitality">Hospitality</option>
                    <option value="Custom">Custom</option>
                  </select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="template-description">Description</Label>
                  <textarea
                    id="template-description"
                    value={templateDescription}
                    onChange={(e) => {
                      setTemplateDescription(e.target.value)
                      setHasChanges(true)
                    }}
                    className="flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
              </div>
            )}

            {readOnly && (
              <p className="text-muted-foreground">{template.description}</p>
            )}
          </div>
        </Card>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 border-b border-border">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="font-medium">{tab.label}</span>
                <Badge variant="outline" className="text-xs">{tab.count}</Badge>
              </button>
            )
          })}
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'tasks' && (
            <TaskTemplateEditor
              tasks={template.tasks}
              onAddTask={(task: TemplateTask) => {
                if (id) {
                  addTaskToTemplate(id, task)
                  setHasChanges(true)
                }
              }}
              onUpdateTask={(index: number, data: Partial<TemplateTask>) => {
                if (id) {
                  updateTemplateTask(id, index, data)
                  setHasChanges(true)
                }
              }}
              onDeleteTask={(index: number) => {
                if (id) {
                  deleteTemplateTask(id, index)
                  setHasChanges(true)
                }
              }}
              readOnly={readOnly}
            />
          )}

          {activeTab === 'files' && (
            <FileTemplateEditor
              files={template.requiredFiles}
              onAddFile={(file: TemplateFile) => {
                if (id) {
                  addFileToTemplate(id, file)
                  setHasChanges(true)
                }
              }}
              onDeleteFile={(index: number) => {
                if (id) {
                  deleteTemplateFile(id, index)
                  setHasChanges(true)
                }
              }}
              readOnly={readOnly}
            />
          )}

          {activeTab === 'documents' && (
            <DocumentTemplateEditor
              documents={template.stageDocuments}
              onAddDocument={(doc: TemplateDocument) => {
                if (id) {
                  addDocumentToTemplate(id, doc)
                  setHasChanges(true)
                }
              }}
              onDeleteDocument={(index: number) => {
                if (id) {
                  deleteTemplateDocument(id, index)
                  setHasChanges(true)
                }
              }}
              readOnly={readOnly}
            />
          )}

          {activeTab === 'stages' && (
            <StageTemplateEditor
              stages={template.stages || []}
              onUpdateStage={(index: number, data: Partial<TemplateStage>) => {
                if (id) {
                  updateTemplateStage(id, index, data)
                  setHasChanges(true)
                }
              }}
              readOnly={readOnly}
            />
          )}
        </div>
      </div>
    </div>
  )
}
