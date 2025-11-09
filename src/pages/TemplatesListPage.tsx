import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, FileText, Edit, Copy, Trash2, Lock } from 'lucide-react'
import { useTemplates } from '@/contexts/TemplateContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DeleteConfirmDialog } from '@/components/DeleteConfirmDialog'
import { LeftSidebar } from '@/components/LeftSidebar'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'

export function TemplatesListPage() {
  const { templates, createTemplate, deleteTemplate, duplicateTemplate } = useTemplates()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [newTemplateName, setNewTemplateName] = useState('')
  const [newTemplateDescription, setNewTemplateDescription] = useState('')
  const [newTemplateType, setNewTemplateType] = useState('Residential')

  const filteredTemplates = templates.filter((template) =>
    template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    template.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleCreateTemplate = () => {
    const id = createTemplate({
      name: newTemplateName,
      description: newTemplateDescription,
      projectType: newTemplateType,
    })
    setShowCreateDialog(false)
    setNewTemplateName('')
    setNewTemplateDescription('')
    navigate(`/templates/${id}/edit`)
  }

  const handleDuplicate = (templateId: string, name: string) => {
    duplicateTemplate(templateId, `${name} (Copy)`)
  }

  return (
    <div className="flex min-h-screen bg-background">
      <LeftSidebar />
      <div className="flex-1 p-8">
        <div className="container mx-auto max-w-6xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Project Templates</h1>
              <p className="text-muted-foreground">Create and manage reusable project templates</p>
            </div>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  New Template
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Template</DialogTitle>
                  <DialogDescription>
                    Create a custom project template with tasks, files, and documents
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="template-name">Template Name*</Label>
                    <Input
                      id="template-name"
                      value={newTemplateName}
                      onChange={(e) => setNewTemplateName(e.target.value)}
                      placeholder="e.g., Office Interior Design"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="template-description">Description</Label>
                    <textarea
                      id="template-description"
                      value={newTemplateDescription}
                      onChange={(e) => setNewTemplateDescription(e.target.value)}
                      placeholder="Describe this template..."
                      className="flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="template-type">Project Type*</Label>
                    <select
                      id="template-type"
                      value={newTemplateType}
                      onChange={(e) => setNewTemplateType(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="Residential">Residential</option>
                      <option value="Retail/Commercial">Retail/Commercial</option>
                      <option value="Office">Office</option>
                      <option value="Hospitality">Hospitality</option>
                      <option value="Custom">Custom</option>
                    </select>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" onClick={() => setShowCreateDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateTemplate} disabled={!newTemplateName.trim()}>
                      Create & Edit
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Search */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search templates..."
                className="pl-9"
              />
            </div>
          </div>

          {/* Templates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => (
              <Card key={template.id} className="hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-primary" />
                        {template.name}
                        {template.isBuiltIn && (
                          <Lock className="h-3 w-3 text-muted-foreground" />
                        )}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {template.description}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Badge variant="outline">{template.projectType}</Badge>
                    {template.isBuiltIn && <Badge variant="secondary">Built-in</Badge>}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="text-2xl font-bold text-foreground">{template.tasks.length}</p>
                      <p className="text-xs text-muted-foreground">Tasks</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">{template.requiredFiles.length}</p>
                      <p className="text-xs text-muted-foreground">Files</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">{template.stageDocuments.length}</p>
                      <p className="text-xs text-muted-foreground">Docs</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => navigate(`/templates/${template.id}/edit`)}
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      {template.isBuiltIn ? 'View' : 'Edit'}
                    </Button>
                    {!template.isBuiltIn && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDuplicate(template.id, template.name)}
                          title="Duplicate template"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        <DeleteConfirmDialog
                          onConfirm={() => deleteTemplate(template.id)}
                          title="Delete Template"
                          description={`Are you sure you want to delete "${template.name}"?`}
                        >
                          <Button variant="outline" size="sm" className="hover:bg-danger/10 hover:text-danger">
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </DeleteConfirmDialog>
                      </>
                    )}
                    {template.isBuiltIn && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDuplicate(template.id, template.name)}
                        title="Duplicate template"
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Duplicate
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredTemplates.length === 0 && (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-muted mx-auto mb-4" />
              <p className="text-muted-foreground">No templates found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
