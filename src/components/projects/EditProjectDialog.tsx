import { useState, useEffect, type FormEvent } from 'react'
import { useProjects } from '@/contexts/ProjectContext'
import { useTeam } from '@/contexts/TeamContext'
import type { Project, WorkflowStage, ProjectStatus } from '@/types'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

const statusOptions: { value: ProjectStatus; label: string }[] = [
  { value: 'active', label: 'Active' },
  { value: 'on-hold', label: 'On Hold' },
  { value: 'completed', label: 'Completed' },
  { value: 'archived', label: 'Archived' },
]

const stageOptions: { value: WorkflowStage; label: string }[] = [
  { value: 'Sales', label: 'Sales' },
  { value: 'Design', label: 'Design' },
  { value: 'Technical Design', label: 'Technical Design' },
  { value: 'Procurement', label: 'Procurement' },
  { value: 'Production', label: 'Production' },
  { value: 'Execution', label: 'Execution' },
  { value: 'Post Installation', label: 'Post Installation' },
]

interface EditProjectDialogProps {
  project: Project
  isOpen: boolean
  onClose: () => void
  onSave: (project: Project) => void
}

export function EditProjectDialog({ project, isOpen, onClose, onSave }: EditProjectDialogProps) {
  const { updateProject } = useProjects()
  const { teamMembers } = useTeam()
  const [formData, setFormData] = useState({
    name: project.name,
    description: project.description,
    clientName: project.clientName,
    projectType: project.projectType,
    projectCode: project.projectCode,
    status: project.status,
    currentStage: project.currentStage,
    estimatedCompletion: project.estimatedCompletion,
    projectManagerId: project.projectManager.id,
  })

  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: project.name,
        description: project.description,
        clientName: project.clientName,
        projectType: project.projectType,
        projectCode: project.projectCode,
        status: project.status,
        currentStage: project.currentStage,
        estimatedCompletion: project.estimatedCompletion,
        projectManagerId: project.projectManager.id,
      })
    }
  }, [isOpen, project])

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()

    const projectManager = teamMembers.find((tm) => tm.id === formData.projectManagerId)
    if (!projectManager) return

    const updatedProject: Project = {
      ...project,
      name: formData.name,
      description: formData.description,
      clientName: formData.clientName,
      projectType: formData.projectType,
      projectCode: formData.projectCode,
      status: formData.status,
      currentStage: formData.currentStage,
      estimatedCompletion: formData.estimatedCompletion,
      projectManager,
      updatedAt: new Date(),
    }

    updateProject(project.id, updatedProject)
    onSave(updatedProject)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Project</DialogTitle>
          <DialogDescription>
            Update project details and settings
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Project Name & Code */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2 col-span-2">
              <Label htmlFor="edit-name">Project Name*</Label>
              <Input
                id="edit-name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Miller Residence"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-code">Code*</Label>
              <Input
                id="edit-code"
                required
                value={formData.projectCode}
                onChange={(e) => setFormData({ ...formData, projectCode: e.target.value.toUpperCase() })}
                placeholder="MIL"
                maxLength={6}
                className="font-mono"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="edit-description">Description*</Label>
            <Textarea
              id="edit-description"
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="e.g., 3BHK luxury apartment interior design"
              rows={2}
            />
          </div>

          {/* Client Name & Project Type */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-client">Client Name*</Label>
              <Input
                id="edit-client"
                required
                value={formData.clientName}
                onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                placeholder="e.g., The Miller Family"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-type">Project Type*</Label>
              <Input
                id="edit-type"
                required
                value={formData.projectType}
                onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
                placeholder="e.g., 3BHK, Villa, Office"
              />
            </div>
          </div>

          {/* Status & Current Stage */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-status">Status*</Label>
              <select
                id="edit-status"
                required
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as ProjectStatus })}
                className="w-full h-10 px-3 rounded-md border border-border bg-background text-foreground"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-stage">Current Stage*</Label>
              <select
                id="edit-stage"
                required
                value={formData.currentStage}
                onChange={(e) => setFormData({ ...formData, currentStage: e.target.value as WorkflowStage })}
                className="w-full h-10 px-3 rounded-md border border-border bg-background text-foreground"
              >
                {stageOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Estimated Completion & Project Manager */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-completion">Estimated Completion*</Label>
              <Input
                id="edit-completion"
                type="date"
                required
                value={formData.estimatedCompletion}
                onChange={(e) => setFormData({ ...formData, estimatedCompletion: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-manager">Project Manager*</Label>
              <select
                id="edit-manager"
                required
                value={formData.projectManagerId}
                onChange={(e) => setFormData({ ...formData, projectManagerId: e.target.value })}
                className="w-full h-10 px-3 rounded-md border border-border bg-background text-foreground"
              >
                {teamMembers.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name} - {member.role}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90">
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
