import { useProjects } from '@/contexts/ProjectContext'
import { useIssues } from '@/contexts/IssueContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Briefcase, CheckCircle2, Clock, AlertTriangle, TrendingUp, AlertCircle } from 'lucide-react'
import { loadFromLocalStorage } from '@/lib/helpers'
import type { Task } from '@/types'

export function HomeSidebar() {
  const { projects } = useProjects()
  const { allIssues, getOpenIssuesCount, getCriticalIssuesCount } = useIssues()

  // Load all tasks from localStorage
  const allTasksData: Record<string, Task[]> = loadFromLocalStorage('tasks', {})

  // Calculate overall stats across all projects
  const stats = projects.reduce(
    (acc, project) => {
      const projectTasks = allTasksData[project.id] || []
      acc.totalProjects++
      acc.totalTasks += projectTasks.length
      acc.completedTasks += projectTasks.filter((t) => t.status === 'completed').length
      acc.inProgressTasks += projectTasks.filter((t) => t.status === 'in-progress').length
      acc.blockedTasks += projectTasks.filter((t) => t.status === 'blocked').length
      if (project.status === 'active') acc.activeProjects++
      return acc
    },
    {
      totalProjects: 0,
      activeProjects: 0,
      totalTasks: 0,
      completedTasks: 0,
      inProgressTasks: 0,
      blockedTasks: 0,
    }
  )

  const completionRate =
    stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0

  // Get recent projects (last 3)
  const recentProjects = projects
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 3)

  return (
    <aside className="w-full xl:w-80 xl:border-l border-t xl:border-t-0 border-border bg-card p-4 sm:p-6 space-y-6">
      {/* Overview Stats */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Dashboard Overview</CardTitle>
          <CardDescription>Your workspace at a glance</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Completion Rate</span>
              <span className="font-bold text-foreground">{completionRate}%</span>
            </div>
            <Progress value={completionRate} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <p className="text-2xl font-bold text-foreground">{stats.totalProjects}</p>
              <p className="text-xs text-muted-foreground">Total Projects</p>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-success">{stats.activeProjects}</p>
              <p className="text-xs text-muted-foreground">Active</p>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-success" />
                <span className="text-muted-foreground">Completed</span>
              </div>
              <span className="font-semibold">{stats.completedTasks}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground">In Progress</span>
              </div>
              <span className="font-semibold">{stats.inProgressTasks}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <AlertTriangle className="h-4 w-4 text-danger" />
                <span className="text-muted-foreground">Blocked</span>
              </div>
              <span className="font-semibold text-danger">{stats.blockedTasks}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <AlertCircle className="h-4 w-4 text-orange-500" />
                <span className="text-muted-foreground">Open Issues</span>
              </div>
              <span className="font-semibold text-orange-700 dark:text-orange-400">{getOpenIssuesCount()}</span>
            </div>
            {getCriticalIssuesCount() > 0 && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <span className="text-muted-foreground">Critical Issues</span>
                </div>
                <span className="font-semibold text-red-700 dark:text-red-400">{getCriticalIssuesCount()}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Projects */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            Recent Projects
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentProjects.length > 0 ? (
            recentProjects.map((project) => {
              const projectTasks = allTasksData[project.id] || []
              const completed = projectTasks.filter((t) => t.status === 'completed').length
              const total = projectTasks.length
              const projectCompletion = total > 0 ? Math.round((completed / total) * 100) : 0

              return (
                <div
                  key={project.id}
                  className="p-3 rounded-lg border border-border hover:border-primary/50 transition-colors cursor-pointer"
                >
                  <div className="flex items-start gap-3 mb-2">
                    <div
                      className="size-8 rounded bg-cover bg-center shrink-0"
                      style={{ backgroundImage: `url("${project.logo}")` }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{project.name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {project.clientName}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{projectCompletion}%</span>
                    </div>
                    <Progress value={projectCompletion} className="h-1.5" />
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="text-xs">
                      {project.currentStage}
                    </Badge>
                    {project.status === 'active' && (
                      <Badge variant="default" className="text-xs">
                        Active
                      </Badge>
                    )}
                  </div>
                </div>
              )
            })
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              No projects yet
            </p>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Productivity
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg bg-success/10">
            <div>
              <p className="text-sm font-medium text-success">On Track</p>
              <p className="text-xs text-muted-foreground">
                {stats.activeProjects} active projects
              </p>
            </div>
            <CheckCircle2 className="h-8 w-8 text-success" />
          </div>

          {stats.blockedTasks > 0 && (
            <div className="flex items-center justify-between p-3 rounded-lg bg-danger/10">
              <div>
                <p className="text-sm font-medium text-danger">Needs Attention</p>
                <p className="text-xs text-muted-foreground">
                  {stats.blockedTasks} blocked tasks
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-danger" />
            </div>
          )}

          <div className="text-center pt-2 border-t">
            <p className="text-xs text-muted-foreground">
              {stats.totalTasks} total tasks across all projects
            </p>
          </div>
        </CardContent>
      </Card>
    </aside>
  )
}
