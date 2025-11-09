import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, LayoutGrid } from 'lucide-react'
import { useProjects } from '@/contexts/ProjectContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { HomeSidebar } from '@/components/HomeSidebar'
import { LeftSidebar } from '@/components/LeftSidebar'

export function ProjectsListPage() {
  const { projects, setCurrentProject } = useProjects()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')

  // Clear current project when viewing all projects
  useEffect(() => {
    setCurrentProject(null)
  }, [])

  const filteredProjects = projects.filter((project) =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.clientName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleProjectClick = (projectId: string) => {
    const project = projects.find((p) => p.id === projectId)
    if (project) {
      setCurrentProject(project)
      navigate(`/projects/${projectId}/workflow`)
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      <LeftSidebar />
      <div className="flex-1 p-8">
        <div className="container mx-auto max-w-6xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">All Projects</h1>
              <p className="text-muted-foreground">Manage your interior design projects</p>
            </div>
            <Button
              onClick={() => navigate('/projects/new')}
              className="bg-primary hover:bg-primary/90 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Button>
          </div>

          {/* Search Bar */}
          <div className="mb-6 relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Projects Grid */}
          {filteredProjects.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center">
                <LayoutGrid className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No projects found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery
                    ? 'Try adjusting your search'
                    : 'Get started by creating your first project'}
                </p>
                {!searchQuery && (
                  <Button onClick={() => navigate('/projects/new')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Project
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredProjects.map((project) => (
                <Card
                  key={project.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => handleProjectClick(project.id)}
                >
                  <CardHeader>
                    <div className="flex items-start gap-3 mb-2">
                      <div
                        className="size-12 rounded-lg bg-cover bg-center shrink-0"
                        style={{ backgroundImage: `url("${project.logo}")` }}
                      />
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg truncate">{project.name}</CardTitle>
                        <CardDescription className="truncate">{project.projectType}</CardDescription>
                      </div>
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
              ))}
            </div>
          )}
        </div>
      </div>
      <HomeSidebar />
    </div>
  )
}
