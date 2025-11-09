import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useProjects } from '@/contexts/ProjectContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function NewProjectPage() {
  const navigate = useNavigate()
  const { createProject, projects } = useProjects()
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

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    createProject(formData)
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="container mx-auto max-w-2xl">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Projects
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Create New Project</CardTitle>
            <CardDescription>
              Add a new interior design project to your workspace
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
                <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90">
                  Create Project
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
