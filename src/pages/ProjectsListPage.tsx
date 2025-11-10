import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, LayoutGrid, List, Kanban, Filter, X, Menu } from 'lucide-react'
import { useProjects } from '@/contexts/ProjectContext'
import { useTeam } from '@/contexts/TeamContext'
import type { WorkflowStage, ProjectStatus } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { HomeSidebar, LeftSidebar } from '@/components/layouts'
import { ProjectListView, ProjectTableView, ProjectKanbanView } from '@/components/projects'

export function ProjectsListPage() {
  const { projects, setCurrentProject } = useProjects()
  const { teamMembers } = useTeam()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [filterManager, setFilterManager] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<ProjectStatus | 'all'>('all')
  const [filterStage, setFilterStage] = useState<WorkflowStage | 'all'>('all')
  const [showFilters, setShowFilters] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Clear current project when viewing all projects
  useEffect(() => {
    setCurrentProject(null)
  }, [])

  // Get unique project managers
  const projectManagers = Array.from(
    new Set(projects.map(p => p.projectManager.id))
  ).map(id => teamMembers.find(tm => tm.id === id)!)
    .filter(Boolean)

  const filteredProjects = projects.filter((project) => {
    // Search filter
    const matchesSearch =
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.clientName.toLowerCase().includes(searchQuery.toLowerCase())

    // Project Manager filter
    const matchesManager = filterManager === 'all' || project.projectManager.id === filterManager

    // Status filter
    const matchesStatus = filterStatus === 'all' || project.status === filterStatus

    // Stage filter
    const matchesStage = filterStage === 'all' || project.currentStage === filterStage

    return matchesSearch && matchesManager && matchesStatus && matchesStage
  })

  const activeFiltersCount =
    (filterManager !== 'all' ? 1 : 0) +
    (filterStatus !== 'all' ? 1 : 0) +
    (filterStage !== 'all' ? 1 : 0)

  const clearAllFilters = () => {
    setFilterManager('all')
    setFilterStatus('all')
    setFilterStage('all')
  }

  const handleProjectClick = (projectId: string) => {
    const project = projects.find((p) => p.id === projectId)
    if (project) {
      setCurrentProject(project)
      navigate(`/projects/${projectId}/workflow`)
    }
  }

  return (
    <div className="flex flex-col xl:flex-row min-h-screen bg-background">
      <LeftSidebar
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
      <div className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="container mx-auto max-w-6xl">
          {/* Header */}
          <div className="flex items-start sm:items-center gap-3 mb-6 sm:mb-8">
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden mt-1 sm:mt-0 shrink-0"
            >
              <Menu className="h-5 w-5" />
            </Button>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 flex-1">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">All Projects</h1>
                <p className="text-sm sm:text-base text-muted-foreground">Manage your interior design projects</p>
              </div>
              <Button
                onClick={() => navigate('/projects/new')}
                className="bg-primary hover:bg-primary/90 text-white w-full sm:w-auto shrink-0"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Project
              </Button>
            </div>
          </div>

          {/* Search Bar and Filters */}
          <div className="mb-6 space-y-4">
            <div className="flex gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button
                variant={showFilters ? 'default' : 'outline'}
                onClick={() => setShowFilters(!showFilters)}
                className="gap-2"
              >
                <Filter className="h-4 w-4" />
                Filters
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="ml-1 px-1.5 py-0.5 text-xs">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </div>

            {/* Filter Panel */}
            {showFilters && (
              <Card>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Project Manager Filter */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Project Manager</label>
                      <select
                        value={filterManager}
                        onChange={(e) => setFilterManager(e.target.value)}
                        className="w-full h-10 px-3 rounded-md border border-border bg-background text-foreground"
                      >
                        <option value="all">All Managers</option>
                        {projectManagers.map((manager) => (
                          <option key={manager.id} value={manager.id}>
                            {manager.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Status Filter */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Status</label>
                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value as ProjectStatus | 'all')}
                        className="w-full h-10 px-3 rounded-md border border-border bg-background text-foreground"
                      >
                        <option value="all">All Statuses</option>
                        <option value="active">Active</option>
                        <option value="on-hold">On Hold</option>
                        <option value="completed">Completed</option>
                        <option value="archived">Archived</option>
                      </select>
                    </div>

                    {/* Stage Filter */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Stage</label>
                      <select
                        value={filterStage}
                        onChange={(e) => setFilterStage(e.target.value as WorkflowStage | 'all')}
                        className="w-full h-10 px-3 rounded-md border border-border bg-background text-foreground"
                      >
                        <option value="all">All Stages</option>
                        <option value="Sales">Sales</option>
                        <option value="Design">Design</option>
                        <option value="Technical Design">Technical Design</option>
                        <option value="Procurement">Procurement</option>
                        <option value="Production">Production</option>
                        <option value="Execution">Execution</option>
                        <option value="Post Installation">Post Installation</option>
                      </select>
                    </div>
                  </div>

                  {/* Clear Filters Button */}
                  {activeFiltersCount > 0 && (
                    <div className="mt-4 flex justify-end">
                      <Button variant="ghost" size="sm" onClick={clearAllFilters} className="gap-2">
                        <X className="h-4 w-4" />
                        Clear All Filters
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Projects View Tabs */}
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
            <Tabs defaultValue="grid" className="w-full">
              <TabsList>
                <TabsTrigger value="grid" className="gap-2">
                  <LayoutGrid className="h-4 w-4" />
                  Grid
                </TabsTrigger>
                <TabsTrigger value="list" className="gap-2">
                  <List className="h-4 w-4" />
                  List
                </TabsTrigger>
                <TabsTrigger value="kanban" className="gap-2">
                  <Kanban className="h-4 w-4" />
                  Kanban
                </TabsTrigger>
              </TabsList>

              <TabsContent value="grid" className="mt-6">
                <ProjectListView
                  projects={filteredProjects}
                  onProjectClick={handleProjectClick}
                />
              </TabsContent>

              <TabsContent value="list" className="mt-6">
                <ProjectTableView
                  projects={filteredProjects}
                  onProjectClick={handleProjectClick}
                />
              </TabsContent>

              <TabsContent value="kanban" className="mt-6">
                <ProjectKanbanView
                  projects={filteredProjects}
                  onProjectClick={handleProjectClick}
                />
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
      <HomeSidebar />
    </div>
  )
}
