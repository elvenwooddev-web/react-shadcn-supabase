import type { Project } from '@/types'
import { ProjectCard } from '@/components/ProjectCard'
import { useProjects } from '@/contexts/ProjectContext'

interface ProjectListViewProps {
  projects: Project[]
  onProjectClick: (projectId: string) => void
}

export function ProjectListView({ projects, onProjectClick }: ProjectListViewProps) {
  const { updateProject, deleteProject } = useProjects()

  const handleEdit = (updatedProject: Project) => {
    updateProject(updatedProject.id, updatedProject)
  }

  const handleArchive = (projectId: string) => {
    updateProject(projectId, { status: 'archived' })
  }

  const handleDelete = (projectId: string) => {
    deleteProject(projectId)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          onProjectClick={onProjectClick}
          onEdit={handleEdit}
          onArchive={handleArchive}
          onDelete={handleDelete}
        />
      ))}
    </div>
  )
}
