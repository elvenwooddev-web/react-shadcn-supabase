import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, FileText, CheckCircle2, Layers, TrendingUp, Loader2 } from 'lucide-react'
import { useProjects } from '@/contexts/ProjectContext'
import { useTemplates } from '@/contexts/TemplateContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

export function NewProjectPage() {
  const navigate = useNavigate()
  const { createProject, projects } = useProjects()
  const { templates } = useTemplates()
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('')
  const [isCreating, setIsCreating] = useState(false)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [loadingStage, setLoadingStage] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    clientName: '',
    projectType: '',
    projectCode: '',
    startDate: new Date().toISOString().split('T')[0],
    estimatedCompletion: '',
    projectManagerId: 'tm2', // Default to Sam Wilson
    templateType: 'residential' as 'residential' | 'retail',
  })

  // Auto-generate project code suggestion from name
  const generateCodeFromName = (name: string): string => {
    const words = name.trim().split(/\s+/)
    if (words.length === 0 || !words[0]) return ''

    if (words.length === 1) {
      return words[0].substring(0, 4).toUpperCase()
    } else {
      return (words[0].substring(0, 2) + words[1].substring(0, 2)).toUpperCase()
    }
  }

  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      projectCode: formData.projectCode || generateCodeFromName(name),
    })
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    // Validate template selection
    if (!selectedTemplateId) {
      alert('Please select a template to continue')
      return
    }

    setIsCreating(true)
    setLoadingProgress(0)

    const selectedTemplate = templates.find(t => t.id === selectedTemplateId)
    const taskCount = selectedTemplate?.tasks.length || 0
    const fileCount = selectedTemplate?.requiredFiles.length || 0
    const docCount = selectedTemplate?.stageDocuments.length || 0
    const totalItems = taskCount + fileCount + docCount

    try {
      // Stage 1: Creating project
      setLoadingStage('Creating project...')
      setLoadingProgress(20)
      await new Promise(resolve => setTimeout(resolve, 300))

      // Stage 2: Loading template tasks
      setLoadingStage(`Loading ${taskCount} tasks...`)
      setLoadingProgress(40)
      await new Promise(resolve => setTimeout(resolve, 400))

      // Stage 3: Loading template files
      setLoadingStage(`Loading ${fileCount} files...`)
      setLoadingProgress(60)
      await new Promise(resolve => setTimeout(resolve, 300))

      // Stage 4: Loading template documents
      setLoadingStage(`Loading ${docCount} documents...`)
      setLoadingProgress(80)
      await new Promise(resolve => setTimeout(resolve, 300))

      // Create the project (this saves template data to localStorage)
      createProject(formData)

      // Stage 5: Finalizing
      setLoadingStage('Finalizing...')
      setLoadingProgress(100)
      await new Promise(resolve => setTimeout(resolve, 300))

      // Use hard navigation to force context reload
      window.location.href = '/'
    } catch (error) {
      console.error('Error creating project:', error)
      setIsCreating(false)
      alert('Failed to create project. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="container mx-auto max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Projects
        </Button>

        {/* Template Selection Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Choose a Template</CardTitle>
            <CardDescription>
              Select a project template to get started with pre-configured tasks, files, and documents
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {templates.map((template) => (
                <Card
                  key={template.id}
                  className={cn(
                    "cursor-pointer transition-all hover:shadow-md",
                    selectedTemplateId === template.id
                      ? "ring-2 ring-primary border-primary"
                      : "border-border hover:border-primary/50"
                  )}
                  onClick={() => setSelectedTemplateId(template.id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg flex items-center gap-2">
                          {template.name}
                          {selectedTemplateId === template.id && (
                            <CheckCircle2 className="h-5 w-5 text-primary" />
                          )}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {template.description}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-2">
                      {template.isBuiltIn && (
                        <Badge variant="secondary" className="text-xs">
                          Built-in
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-xs">
                        {template.projectType}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Layers className="h-4 w-4" />
                        <span>{template.tasks.length} tasks</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <FileText className="h-4 w-4" />
                        <span>{template.requiredFiles.length} files</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <TrendingUp className="h-4 w-4" />
                        <span>{template.usageCount || 0} used</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            {templates.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No templates available. Create one from the Templates page.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Project Details Form */}
        <Card>
          <CardHeader>
            <CardTitle>Project Details</CardTitle>
            <CardDescription>
              Add details for your new interior design project
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="name">Project Name*</Label>
                  <Input
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="e.g., Miller Residence"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="projectCode">
                    Code*
                    <span className="text-xs text-muted-foreground ml-1">(auto-generated)</span>
                  </Label>
                  <Input
                    id="projectCode"
                    required
                    value={formData.projectCode}
                    onChange={(e) => setFormData({ ...formData, projectCode: e.target.value.toUpperCase() })}
                    placeholder="MIL"
                    maxLength={6}
                    className="font-mono"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description*</Label>
                <Input
                  id="description"
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g., 3BHK luxury apartment interior design"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="clientName">Client Name*</Label>
                  <Input
                    id="clientName"
                    required
                    value={formData.clientName}
                    onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                    placeholder="e.g., The Miller Family"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="projectType">Project Type*</Label>
                  <Input
                    id="projectType"
                    required
                    value={formData.projectType}
                    onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
                    placeholder="e.g., 3BHK, Villa, Office"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date*</Label>
                  <Input
                    id="startDate"
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estimatedCompletion">Estimated Completion*</Label>
                  <Input
                    id="estimatedCompletion"
                    type="date"
                    required
                    value={formData.estimatedCompletion}
                    onChange={(e) =>
                      setFormData({ ...formData, estimatedCompletion: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => navigate('/')} className="flex-1">
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-primary hover:bg-primary/90"
                  disabled={!selectedTemplateId || isCreating}
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Project'
                  )}
                </Button>
              </div>
              {!selectedTemplateId && (
                <p className="text-sm text-muted-foreground text-center mt-2">
                  Please select a template above to continue
                </p>
              )}
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Loading Dialog */}
      <Dialog open={isCreating} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>Creating Project</DialogTitle>
            <DialogDescription>
              Setting up your project with template data
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{loadingStage}</span>
                <span className="font-medium">{loadingProgress}%</span>
              </div>
              <Progress value={loadingProgress} className="h-2" />
            </div>
            <div className="flex items-center justify-center text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              <span className="text-sm">Please wait...</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
