import { MoreVertical, Edit, Archive, Trash2 } from 'lucide-react'
import type { Project } from '@/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { EditProjectDialog, DeleteProjectDialog } from '@/components/projects'
import { useProjects } from '@/contexts/ProjectContext'
import { useState } from 'react'

interface ProjectTableViewProps {
  projects: Project[]
  onProjectClick: (projectId: string) => void
}

export function ProjectTableView({ projects, onProjectClick }: ProjectTableViewProps) {
  const { updateProject, deleteProject } = useProjects()
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [deletingProject, setDeletingProject] = useState<Project | null>(null)

  const handleEdit = (updatedProject: Project) => {
    updateProject(updatedProject.id, updatedProject)
  }

  const handleArchive = (projectId: string) => {
    updateProject(projectId, { status: 'archived' })
  }

  const handleDelete = () => {
    if (deletingProject) {
      deleteProject(deletingProject.id)
      setDeletingProject(null)
    }
  }

  return (
    <>
      <div className="rounded-md border">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                Project
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                Client
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                Status
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                Stage
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                Due Date
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                Team
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => (
              <tr
                key={project.id}
                className="border-b transition-colors hover:bg-muted/50 cursor-pointer"
                onClick={() => onProjectClick(project.id)}
              >
                <td className="p-4 align-middle">
                  <div className="flex items-center gap-3">
                    <div
                      className="size-10 rounded-lg bg-cover bg-center shrink-0"
                      style={{ backgroundImage: `url("${project.logo}")` }}
                    />
                    <div className="min-w-0">
                      <div className="font-medium">{project.name}</div>
                      <div className="text-sm text-muted-foreground">{project.projectType}</div>
                    </div>
                  </div>
                </td>
                <td className="p-4 align-middle">
                  <div className="font-medium">{project.clientName}</div>
                </td>
                <td className="p-4 align-middle">
                  <Badge
                    variant={
                      project.status === 'active'
                        ? 'default'
                        : project.status === 'completed'
                        ? 'success'
                        : 'secondary'
                    }
                  >
                    {project.status}
                  </Badge>
                </td>
                <td className="p-4 align-middle">
                  <Badge variant="outline">{project.currentStage}</Badge>
                </td>
                <td className="p-4 align-middle">
                  <div className="text-sm">{project.estimatedCompletion}</div>
                </td>
                <td className="p-4 align-middle">
                  <div className="flex -space-x-2">
                    {project.teamMembers.slice(0, 3).map((member) => (
                      <div
                        key={member.id}
                        className="size-6 rounded-full ring-2 ring-background bg-cover bg-center"
                        style={{ backgroundImage: `url("${member.avatar}")` }}
                        title={member.name}
                      />
                    ))}
                    {project.teamMembers.length > 3 && (
                      <div className="size-6 rounded-full ring-2 ring-background bg-muted flex items-center justify-center text-xs font-medium">
                        +{project.teamMembers.length - 3}
                      </div>
                    )}
                  </div>
                </td>
                <td className="p-4 align-middle" onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setEditingProject(project)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleArchive(project.id)}>
                        <Archive className="h-4 w-4 mr-2" />
                        Archive
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => setDeletingProject(project)}
                        className="text-danger focus:text-danger focus:bg-danger/10"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Dialog */}
      {editingProject && (
        <EditProjectDialog
          project={editingProject}
          isOpen={!!editingProject}
          onClose={() => setEditingProject(null)}
          onSave={(updatedProject) => {
            handleEdit(updatedProject)
            setEditingProject(null)
          }}
        />
      )}

      {/* Delete Dialog */}
      {deletingProject && (
        <DeleteProjectDialog
          project={deletingProject}
          open={!!deletingProject}
          onOpenChange={(open) => !open && setDeletingProject(null)}
          onConfirm={handleDelete}
        />
      )}
    </>
  )
}
