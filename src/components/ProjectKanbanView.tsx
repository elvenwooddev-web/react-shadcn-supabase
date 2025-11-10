import { useState } from 'react'
import type { Project, WorkflowStage, ProjectStatus } from '@/types'
import { ProjectCard } from '@/components/ProjectCard'
import { useProjects } from '@/contexts/ProjectContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface ProjectKanbanViewProps {
  projects: Project[]
  onProjectClick: (projectId: string) => void
}

const STAGE_COLUMNS: WorkflowStage[] = [
  'Sales',
  'Design',
  'Technical Design',
  'Procurement',
  'Production',
  'Execution',
  'Post Installation',
]

const STATUS_COLUMNS: { status: ProjectStatus; label: string }[] = [
  { status: 'active', label: 'Active' },
  { status: 'on-hold', label: 'On Hold' },
  { status: 'completed', label: 'Completed' },
  { status: 'archived', label: 'Archived' },
]

type OrganizeBy = 'stage' | 'status'

export function ProjectKanbanView({ projects, onProjectClick }: ProjectKanbanViewProps) {
  const { updateProject } = useProjects()
  const [organizeBy, setOrganizeBy] = useState<OrganizeBy>('stage')

  const handleEdit = (updatedProject: Project) => {
    updateProject(updatedProject.id, updatedProject)
  }

  const handleArchive = (projectId: string) => {
    updateProject(projectId, { status: 'archived' })
  }

  const getProjectsByStage = (stage: WorkflowStage) => {
    return projects.filter((project) => project.currentStage === stage)
  }

  const getProjectsByStatus = (status: ProjectStatus) => {
    return projects.filter((project) => project.status === status)
  }

  return (
    <div className="space-y-4">
      {/* Toggle between Stage and Status view */}
      <div className="flex gap-2">
        <Button
          variant={organizeBy === 'stage' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setOrganizeBy('stage')}
        >
          By Stage
        </Button>
        <Button
          variant={organizeBy === 'status' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setOrganizeBy('status')}
        >
          By Status
        </Button>
      </div>

      {/* Kanban Board */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {organizeBy === 'stage' ? (
          // Stage-based columns
          <>
            {STAGE_COLUMNS.map((stage) => {
              const stageProjects = getProjectsByStage(stage)
              return (
                <div key={stage} className="flex-shrink-0 w-80">
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium">{stage}</CardTitle>
                        <Badge variant="secondary" className="text-xs">
                          {stageProjects.length}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3 max-h-[600px] overflow-y-auto">
                      {stageProjects.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground text-sm">
                          No projects
                        </div>
                      ) : (
                        stageProjects.map((project) => (
                          <div key={project.id} className="[&>div]:shadow-sm">
                            <ProjectCard
                              project={project}
                              onProjectClick={onProjectClick}
                              onEdit={handleEdit}
                              onArchive={handleArchive}
                            />
                          </div>
                        ))
                      )}
                    </CardContent>
                  </Card>
                </div>
              )
            })}
          </>
        ) : (
          // Status-based columns
          <>
            {STATUS_COLUMNS.map(({ status, label }) => {
              const statusProjects = getProjectsByStatus(status)
              return (
                <div key={status} className="flex-shrink-0 w-80">
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium">{label}</CardTitle>
                        <Badge variant="secondary" className="text-xs">
                          {statusProjects.length}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3 max-h-[600px] overflow-y-auto">
                      {statusProjects.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground text-sm">
                          No projects
                        </div>
                      ) : (
                        statusProjects.map((project) => (
                          <div key={project.id} className="[&>div]:shadow-sm">
                            <ProjectCard
                              project={project}
                              onProjectClick={onProjectClick}
                              onEdit={handleEdit}
                              onArchive={handleArchive}
                            />
                          </div>
                        ))
                      )}
                    </CardContent>
                  </Card>
                </div>
              )
            })}
          </>
        )}
      </div>
    </div>
  )
}
