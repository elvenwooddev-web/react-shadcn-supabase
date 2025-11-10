import { MouseEvent, useState } from 'react'
import { MoreVertical, Edit, Archive } from 'lucide-react'
import type { Project } from '@/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { EditProjectDialog } from '@/components/EditProjectDialog'

interface ProjectCardProps {
  project: Project
  onProjectClick: (projectId: string) => void
  onEdit?: (project: Project) => void
  onArchive?: (projectId: string) => void
}

export function ProjectCard({
  project,
  onProjectClick,
  onEdit,
  onArchive,
}: ProjectCardProps) {
  const [showEditDialog, setShowEditDialog] = useState(false)

  const handleCardClick = () => {
    onProjectClick(project.id)
  }

  const handleActionClick = (e: MouseEvent) => {
    e.stopPropagation()
  }

  const handleEdit = (e: MouseEvent) => {
    e.stopPropagation()
    setShowEditDialog(true)
  }

  const handleArchive = (e: MouseEvent) => {
    e.stopPropagation()
    onArchive?.(project.id)
  }

  return (
    <>
      <Card
        className="cursor-pointer hover:shadow-lg transition-shadow relative"
        onClick={handleCardClick}
      >
        <CardHeader>
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex items-start gap-3 min-w-0 flex-1">
              <div
                className="size-12 rounded-lg bg-cover bg-center shrink-0"
                style={{ backgroundImage: `url("${project.logo}")` }}
              />
              <div className="flex-1 min-w-0">
                <CardTitle className="text-lg truncate">{project.name}</CardTitle>
                <CardDescription className="truncate">{project.projectType}</CardDescription>
              </div>
            </div>

            {/* Actions Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={handleActionClick}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" onClick={handleActionClick}>
                <DropdownMenuItem onClick={handleEdit}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleArchive}>
                  <Archive className="h-4 w-4 mr-2" />
                  Archive
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex gap-2">
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
            <Badge variant="outline">{project.currentStage}</Badge>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Client:</span>
              <span className="font-medium truncate ml-2">{project.clientName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Due:</span>
              <span className="font-medium">{project.estimatedCompletion}</span>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <span className="text-muted-foreground text-xs">Team:</span>
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
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      {showEditDialog && (
        <EditProjectDialog
          project={project}
          isOpen={showEditDialog}
          onClose={() => setShowEditDialog(false)}
          onSave={(updatedProject) => {
            onEdit?.(updatedProject)
            setShowEditDialog(false)
          }}
        />
      )}
    </>
  )
}
