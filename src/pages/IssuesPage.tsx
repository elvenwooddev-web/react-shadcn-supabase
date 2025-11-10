import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useIssues } from '@/contexts/IssueContext'
import { useProjects } from '@/contexts/ProjectContext'
import { Header, LeftSidebar } from '@/components/layouts'
import { IssueCard } from '@/components/issues'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlertTriangle, Search, Filter } from 'lucide-react'
import type { IssueStatus, IssueSeverity } from '@/types'

export function IssuesPage() {
  const navigate = useNavigate()
  const { allIssues } = useIssues()
  const { projects } = useProjects()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<IssueStatus | 'all'>('all')
  const [severityFilter, setSeverityFilter] = useState<IssueSeverity | 'all'>('all')
  const [projectFilter, setProjectFilter] = useState<string>('all')

  // Filter issues
  const filteredIssues = allIssues.filter((issue) => {
    const matchesSearch =
      searchQuery === '' ||
      issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.trackingId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.description.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === 'all' || issue.status === statusFilter
    const matchesSeverity = severityFilter === 'all' || issue.severity === severityFilter
    const matchesProject = projectFilter === 'all' || issue.projectId === projectFilter

    return matchesSearch && matchesStatus && matchesSeverity && matchesProject
  })

  // Sort by severity (critical first), then by creation date
  const sortedIssues = [...filteredIssues].sort((a, b) => {
    const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
    if (severityOrder[a.severity] !== severityOrder[b.severity]) {
      return severityOrder[a.severity] - severityOrder[b.severity]
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

  // Stats
  const openIssues = allIssues.filter((i) => i.status === 'open' || i.status === 'in-progress').length
  const criticalIssues = allIssues.filter(
    (i) => i.severity === 'critical' && (i.status === 'open' || i.status === 'in-progress')
  ).length
  const resolvedIssues = allIssues.filter((i) => i.status === 'resolved' || i.status === 'closed').length

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <LeftSidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <div className="flex-1 overflow-y-auto px-8 py-6">
          {/* Page Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                <AlertTriangle className="h-8 w-8 text-orange-500" />
                Issues
              </h1>
              <p className="text-muted-foreground mt-1">Track and manage issues across all projects</p>
            </div>
            <Button onClick={() => navigate('/')} variant="outline">
              Back to Projects
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Open Issues</p>
                  <p className="text-2xl font-bold text-foreground">{openIssues}</p>
                </div>
                <div className="h-12 w-12 bg-orange-500/10 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-orange-500" />
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Critical Issues</p>
                  <p className="text-2xl font-bold text-foreground">{criticalIssues}</p>
                </div>
                <div className="h-12 w-12 bg-red-500/10 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-red-500" />
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Resolved Issues</p>
                  <p className="text-2xl font-bold text-foreground">{resolvedIssues}</p>
                </div>
                <div className="h-12 w-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-green-500" />
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-card border border-border rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold text-foreground">Filters</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search issues..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as IssueStatus | 'all')}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>

              {/* Severity Filter */}
              <Select value={severityFilter} onValueChange={(value) => setSeverityFilter(value as IssueSeverity | 'all')}>
                <SelectTrigger>
                  <SelectValue placeholder="Severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severities</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>

              {/* Project Filter */}
              <Select value={projectFilter} onValueChange={setProjectFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Projects</SelectItem>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.projectCode} - {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Active Filters */}
            {(statusFilter !== 'all' || severityFilter !== 'all' || projectFilter !== 'all' || searchQuery) && (
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
                <span className="text-sm text-muted-foreground">Active filters:</span>
                {searchQuery && (
                  <Badge variant="outline" className="gap-1">
                    Search: {searchQuery}
                    <button
                      onClick={() => setSearchQuery('')}
                      className="ml-1 hover:text-foreground"
                    >
                      ×
                    </button>
                  </Badge>
                )}
                {statusFilter !== 'all' && (
                  <Badge variant="outline" className="gap-1">
                    Status: {statusFilter}
                    <button
                      onClick={() => setStatusFilter('all')}
                      className="ml-1 hover:text-foreground"
                    >
                      ×
                    </button>
                  </Badge>
                )}
                {severityFilter !== 'all' && (
                  <Badge variant="outline" className="gap-1">
                    Severity: {severityFilter}
                    <button
                      onClick={() => setSeverityFilter('all')}
                      className="ml-1 hover:text-foreground"
                    >
                      ×
                    </button>
                  </Badge>
                )}
                {projectFilter !== 'all' && (
                  <Badge variant="outline" className="gap-1">
                    Project: {projects.find((p) => p.id === projectFilter)?.projectCode}
                    <button
                      onClick={() => setProjectFilter('all')}
                      className="ml-1 hover:text-foreground"
                    >
                      ×
                    </button>
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchQuery('')
                    setStatusFilter('all')
                    setSeverityFilter('all')
                    setProjectFilter('all')
                  }}
                  className="ml-auto"
                >
                  Clear all
                </Button>
              </div>
            )}
          </div>

          {/* Issues List */}
          <div className="space-y-4">
            {sortedIssues.length === 0 ? (
              <div className="bg-card border border-border rounded-lg p-12 text-center">
                <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No issues found</h3>
                <p className="text-muted-foreground">
                  {searchQuery || statusFilter !== 'all' || severityFilter !== 'all' || projectFilter !== 'all'
                    ? 'Try adjusting your filters'
                    : 'Create issues from tasks to track blockers'}
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-muted-foreground">
                    Showing {sortedIssues.length} of {allIssues.length} issues
                  </p>
                </div>
                {sortedIssues.map((issue) => (
                  <IssueCard key={issue.id} issue={issue} />
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
