import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Home, Store } from 'lucide-react'
import { useProjects } from '@/contexts/ProjectContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

export function NewProjectPage() {
  const navigate = useNavigate()
  const { createProject } = useProjects()
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    clientName: '',
    projectType: '',
    startDate: new Date().toISOString().split('T')[0],
    estimatedCompletion: '',
    projectManagerId: 'tm2', // Default to Sam Wilson
    templateType: 'residential' as 'residential' | 'retail',
  })

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
              <div className="space-y-3">
                <Label>Template Type*</Label>
                <RadioGroup
                  value={formData.templateType}
                  onValueChange={(value: 'residential' | 'retail') =>
                    setFormData({ ...formData, templateType: value })
                  }
                  className="grid grid-cols-2 gap-4"
                >
                  <Label
                    htmlFor="residential"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer [&:has([data-state=checked])]:border-primary"
                  >
                    <RadioGroupItem value="residential" id="residential" className="sr-only" />
                    <Home className="mb-3 h-6 w-6" />
                    <div className="space-y-1 text-center">
                      <p className="text-sm font-medium leading-none">Residential/Home</p>
                      <p className="text-xs text-muted-foreground">
                        For apartments, villas, and homes
                      </p>
                    </div>
                  </Label>
                  <Label
                    htmlFor="retail"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer [&:has([data-state=checked])]:border-primary"
                  >
                    <RadioGroupItem value="retail" id="retail" className="sr-only" />
                    <Store className="mb-3 h-6 w-6" />
                    <div className="space-y-1 text-center">
                      <p className="text-sm font-medium leading-none">Retail/Commercial</p>
                      <p className="text-xs text-muted-foreground">
                        For stores, showrooms, and offices
                      </p>
                    </div>
                  </Label>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Project Name*</Label>
                <Input
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Miller Residence"
                />
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
