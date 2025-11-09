import { useProjects } from '@/contexts/ProjectContext'
import { useTasks } from '@/contexts/TaskContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Clock, AlertCircle } from 'lucide-react'

export function ProjectOverviewPage() {
  const { currentProject } = useProjects()
  const { tasks } = useTasks()

  if (!currentProject) {
    return (
      <main className="flex-1 p-6 lg:p-8 bg-background flex items-center justify-center">
        <p className="text-muted-foreground">No project selected</p>
      </main>
    )
  }

  const completedTasks = tasks.filter((t) => t.status === 'completed').length
  const inProgressTasks = tasks.filter((t) => t.status === 'in-progress').length
  const blockedTasks = tasks.filter((t) => t.status === 'blocked').length
  const totalTasks = tasks.length
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  return (
    <main className="flex-1 p-6 lg:p-8 bg-background">
      <div className="mb-6">
        <h1 className="text-3xl font-black text-foreground mb-2">{currentProject.name}</h1>
        <p className="text-muted-foreground">
          {currentProject.description} • {currentProject.clientName}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Completion</CardDescription>
            <CardTitle className="text-3xl">{completionPercentage}%</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={completionPercentage} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Tasks</CardDescription>
            <CardTitle className="text-3xl">{totalTasks}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle className="h-4 w-4 text-success" />
              {completedTasks} completed
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>In Progress</CardDescription>
            <CardTitle className="text-3xl">{inProgressTasks}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4 text-primary" />
              Active tasks
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Blocked</CardDescription>
            <CardTitle className="text-3xl">{blockedTasks}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <AlertCircle className="h-4 w-4 text-danger" />
              Needs attention
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Project Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Project Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Project Type</span>
              <span className="font-medium">{currentProject.projectType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Start Date</span>
              <span className="font-medium">{currentProject.startDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Est. Completion</span>
              <span className="font-medium">{currentProject.estimatedCompletion}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Current Stage</span>
              <Badge>{currentProject.currentStage}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status</span>
              <Badge
                variant={
                  currentProject.status === 'active'
                    ? 'default'
                    : currentProject.status === 'completed'
                    ? 'success'
                    : 'secondary'
                }
              >
                {currentProject.status}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Team</CardTitle>
            <CardDescription>{currentProject.teamMembers.length} members</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {currentProject.teamMembers.map((member) => (
                <div key={member.id} className="flex items-center gap-3">
                  <div
                    className="size-10 rounded-full bg-cover bg-center"
                    style={{ backgroundImage: `url("${member.avatar}")` }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{member.name}</p>
                    <p className="text-sm text-muted-foreground truncate">{member.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
