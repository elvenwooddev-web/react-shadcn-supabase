import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTasks } from '@/contexts/TaskContext'
import { useProjects } from '@/contexts/ProjectContext'
import { useUser } from '@/contexts/UserContext'
import { useIssues } from '@/contexts/IssueContext'
import { useApprovals } from '@/contexts/ApprovalContext'
import { useTeam } from '@/contexts/TeamContext'
import { LeftSidebar } from '@/components/layouts'
import { TaskCard } from '@/components/tasks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'
import {
  CheckSquare,
  AlertCircle,
  Calendar,
  Clock,
  TrendingUp,
  Briefcase,
  CheckCircle,
  Menu,
  ArrowRight,
  FileText,
  Users,
} from 'lucide-react'
import type { Task } from '@/types'

export function HomePage() {
  const navigate = useNavigate()
  const { allTasks } = useTasks()
  const { projects } = useProjects()
  const { currentUser } = useUser()
  const { issues } = useIssues()
  const { approvalRequests } = useApprovals()
  const { activities } = useTeam()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Get user's tasks
  const myTasks = useMemo(() => {
    if (!currentUser || !allTasks) return []
    return allTasks.filter(task => {
      const isAssigned = task.assignees?.some(a => a.userId === currentUser.id) ||
                        task.assignee?.userId === currentUser.id
      return isAssigned
    })
  }, [allTasks, currentUser])

  // Get user's issues
  const myIssues = useMemo(() => {
    if (!currentUser || !issues) return []
    return issues.filter(issue => issue.assignee?.userId === currentUser.id)
  }, [issues, currentUser])

  // Get user's projects
  const myProjects = useMemo(() => {
    if (!currentUser || !projects) return []
    return projects.filter(project =>
      project.projectManager.id === currentUser.id ||
      project.teamMembers?.some(tm => tm.userId === currentUser.id)
    )
  }, [projects, currentUser])

  // Get pending approvals for current user
  const myPendingApprovals = useMemo(() => {
    if (!currentUser || !approvalRequests) return []
    return approvalRequests.filter(approval =>
      approval.assignedTo === currentUser.id &&
      approval.status === 'pending'
    )
  }, [approvalRequests, currentUser])

  // Calculate stats
  const stats = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const overdueTasks = myTasks.filter(t => {
      const dueDate = new Date(t.dueDate)
      dueDate.setHours(0, 0, 0, 0)
      return dueDate < today && t.status !== 'completed'
    })

    const todayTasks = myTasks.filter(t => {
      const dueDate = new Date(t.dueDate)
      dueDate.setHours(0, 0, 0, 0)
      return dueDate.getTime() === today.getTime()
    })

    const weekFromNow = new Date(today)
    weekFromNow.setDate(weekFromNow.getDate() + 7)

    const upcomingTasks = myTasks.filter(t => {
      const dueDate = new Date(t.dueDate)
      dueDate.setHours(0, 0, 0, 0)
      return dueDate > today && dueDate <= weekFromNow
    })

    return {
      totalTasks: myTasks.length,
      completedTasks: myTasks.filter(t => t.status === 'completed').length,
      inProgressTasks: myTasks.filter(t => t.status === 'in-progress').length,
      overdueTasks: overdueTasks.length,
      todayTasks: todayTasks.length,
      upcomingTasks: upcomingTasks.length,
      totalIssues: myIssues.length,
      openIssues: myIssues.filter(i => i.status !== 'closed').length,
      totalProjects: myProjects.length,
      activeProjects: myProjects.filter(p => p.status === 'active').length,
      pendingApprovals: myPendingApprovals.length,
      recentActivities: activities.slice(0, 5),
    }
  }, [myTasks, myIssues, myProjects, myPendingApprovals, activities])

  // Get priority tasks to display
  const priorityTasks = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Overdue tasks
    const overdue = myTasks.filter(t => {
      const dueDate = new Date(t.dueDate)
      dueDate.setHours(0, 0, 0, 0)
      return dueDate < today && t.status !== 'completed'
    }).slice(0, 3)

    // Today's tasks
    const todayList = myTasks.filter(t => {
      const dueDate = new Date(t.dueDate)
      dueDate.setHours(0, 0, 0, 0)
      return dueDate.getTime() === today.getTime()
    }).slice(0, 3)

    // Upcoming high priority
    const highPriority = myTasks.filter(t =>
      (t.priority === 'urgent' || t.priority === 'high') &&
      t.status !== 'completed'
    ).slice(0, 3)

    return { overdue, today: todayList, highPriority }
  }, [myTasks])

  const completionRate = stats.totalTasks > 0
    ? Math.round((stats.completedTasks / stats.totalTasks) * 100)
    : 0

  return (
    <div className="flex flex-col xl:flex-row min-h-screen bg-background">
      <LeftSidebar
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
      <div className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="container mx-auto max-w-7xl">
          {/* Header */}
          <div className="flex items-start sm:items-center gap-3 mb-6 sm:mb-8">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden mt-1 sm:mt-0 shrink-0"
            >
              <Menu className="h-5 w-5" />
            </Button>

            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                Welcome back, {currentUser?.name || 'User'}
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Here's what's happening with your work
              </p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Tasks */}
            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/my-work')}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">My Tasks</p>
                    <p className="text-3xl font-bold mt-2">{stats.totalTasks}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {completionRate}% completed
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                    <CheckSquare className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Projects */}
            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/projects')}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">My Projects</p>
                    <p className="text-3xl font-bold mt-2">{stats.totalProjects}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {stats.activeProjects} active
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                    <Briefcase className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Issues */}
            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/issues')}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">My Issues</p>
                    <p className="text-3xl font-bold mt-2">{stats.totalIssues}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {stats.openIssues} open
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Approvals */}
            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/approvals')}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Pending Approvals</p>
                    <p className="text-3xl font-bold mt-2">{stats.pendingApprovals}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Need your review
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Priority Alerts */}
          {(stats.overdueTasks > 0 || stats.todayTasks > 0) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {stats.overdueTasks > 0 && (
                <Card className="border-red-200 dark:border-red-900/50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center shrink-0">
                        <AlertCircle className="w-5 h-5 text-red-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-red-600">
                          {stats.overdueTasks} Overdue {stats.overdueTasks === 1 ? 'Task' : 'Tasks'}
                        </p>
                        <p className="text-sm text-muted-foreground">These tasks need immediate attention</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate('/my-work')}
                      >
                        View
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {stats.todayTasks > 0 && (
                <Card className="border-orange-200 dark:border-orange-900/50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center shrink-0">
                        <Calendar className="w-5 h-5 text-orange-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-orange-600">
                          {stats.todayTasks} {stats.todayTasks === 1 ? 'Task' : 'Tasks'} Due Today
                        </p>
                        <p className="text-sm text-muted-foreground">Don't forget to complete these today</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate('/my-work')}
                      >
                        View
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Quick Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">In Progress</p>
                    <p className="text-2xl font-bold text-blue-600 mt-1">{stats.inProgressTasks}</p>
                  </div>
                  <Clock className="w-8 h-8 text-blue-600 opacity-20" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Due Today</p>
                    <p className="text-2xl font-bold text-orange-600 mt-1">{stats.todayTasks}</p>
                  </div>
                  <Calendar className="w-8 h-8 text-orange-600 opacity-20" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Upcoming</p>
                    <p className="text-2xl font-bold text-purple-600 mt-1">{stats.upcomingTasks}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-purple-600 opacity-20" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Overdue</p>
                    <p className="text-2xl font-bold text-red-600 mt-1">{stats.overdueTasks}</p>
                  </div>
                  <AlertCircle className="w-8 h-8 text-red-600 opacity-20" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Left Column - Tasks */}
            <div className="lg:col-span-2 space-y-6">
              {/* Overdue Tasks */}
              {priorityTasks.overdue.length > 0 && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-red-600">
                        <AlertCircle className="w-5 h-5" />
                        Overdue Tasks
                        <Badge variant="destructive">{priorityTasks.overdue.length}</Badge>
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate('/my-work')}
                      >
                        View All
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {priorityTasks.overdue.map(task => (
                      <TaskCard key={task.id} task={task} showProject />
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Today's Tasks */}
              {priorityTasks.today.length > 0 && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="w-5 h-5" />
                        Due Today
                        <Badge variant="secondary">{priorityTasks.today.length}</Badge>
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate('/my-work')}
                      >
                        View All
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {priorityTasks.today.map(task => (
                      <TaskCard key={task.id} task={task} showProject />
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* High Priority Tasks */}
              {priorityTasks.highPriority.length > 0 && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5" />
                        High Priority Tasks
                        <Badge variant="secondary">{priorityTasks.highPriority.length}</Badge>
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate('/my-work')}
                      >
                        View All
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {priorityTasks.highPriority.map(task => (
                      <TaskCard key={task.id} task={task} showProject />
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Empty State */}
              {priorityTasks.overdue.length === 0 &&
               priorityTasks.today.length === 0 &&
               priorityTasks.highPriority.length === 0 && (
                <Card>
                  <CardContent className="py-12 text-center">
                    <CheckCircle className="w-12 h-12 mx-auto text-green-500 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">All caught up!</h3>
                    <p className="text-muted-foreground">
                      You have no urgent tasks at the moment. Great work!
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Column - Sidebar Info */}
            <div className="space-y-6">
              {/* Pending Approvals */}
              {stats.pendingApprovals > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Pending Approvals
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {myPendingApprovals.slice(0, 5).map(approval => (
                        <div
                          key={approval.id}
                          className="p-3 border rounded-lg hover:bg-muted cursor-pointer transition-colors"
                          onClick={() => navigate('/approvals')}
                        >
                          <p className="font-medium text-sm line-clamp-1">
                            {approval.entityType}: {approval.entityId}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Level {approval.currentApprovalLevel} of {approval.approvalConfigs.length}
                          </p>
                        </div>
                      ))}
                      {myPendingApprovals.length > 5 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full"
                          onClick={() => navigate('/approvals')}
                        >
                          View all {myPendingApprovals.length} approvals
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* My Projects */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    My Projects
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {myProjects.slice(0, 5).map(project => (
                      <div
                        key={project.id}
                        className="p-3 border rounded-lg hover:bg-muted cursor-pointer transition-colors"
                        onClick={() => {
                          navigate(`/projects/${project.id}/workflow`)
                        }}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm line-clamp-1">{project.name}</p>
                            <p className="text-xs text-muted-foreground mt-1">{project.clientName}</p>
                          </div>
                          <Badge variant={project.status === 'active' ? 'default' : 'secondary'} className="shrink-0">
                            {project.status}
                          </Badge>
                        </div>
                        <div className="mt-2">
                          <div className="text-xs text-muted-foreground mb-1">{project.currentStage}</div>
                        </div>
                      </div>
                    ))}
                    {myProjects.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No projects assigned
                      </p>
                    )}
                    {myProjects.length > 5 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full"
                        onClick={() => navigate('/')}
                      >
                        View all {myProjects.length} projects
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Open Issues */}
              {stats.openIssues > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      My Issues
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {myIssues.slice(0, 5).map(issue => (
                        <div
                          key={issue.id}
                          className="p-3 border rounded-lg hover:bg-muted cursor-pointer transition-colors"
                          onClick={() => navigate('/issues')}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <p className="font-medium text-sm line-clamp-1">{issue.title}</p>
                            <Badge
                              variant={
                                issue.priority === 'urgent' || issue.priority === 'high'
                                  ? 'destructive'
                                  : 'secondary'
                              }
                              className="shrink-0"
                            >
                              {issue.priority}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {issue.status} • {issue.category}
                          </p>
                        </div>
                      ))}
                      {myIssues.length > 5 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full"
                          onClick={() => navigate('/issues')}
                        >
                          View all {myIssues.length} issues
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {stats.recentActivities.length > 0 ? (
                    <div className="space-y-3">
                      {stats.recentActivities.filter(activity => activity?.user).map(activity => (
                        <div key={activity.id} className="flex items-start gap-3">
                          <Avatar
                            className="w-8 h-8 shrink-0"
                            src={activity.user?.avatar}
                            fallback={activity.user?.name ? activity.user.name.split(' ').map(n => n[0]).join('') : '?'}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm">{activity.message}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(activity.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No recent activity
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Button
                  variant="outline"
                  className="h-auto py-4 flex flex-col items-center gap-2"
                  onClick={() => navigate('/projects/new')}
                >
                  <Briefcase className="w-5 h-5" />
                  <span className="text-sm">New Project</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto py-4 flex flex-col items-center gap-2"
                  onClick={() => navigate('/my-work')}
                >
                  <CheckSquare className="w-5 h-5" />
                  <span className="text-sm">View Tasks</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto py-4 flex flex-col items-center gap-2"
                  onClick={() => navigate('/issues')}
                >
                  <AlertCircle className="w-5 h-5" />
                  <span className="text-sm">Report Issue</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto py-4 flex flex-col items-center gap-2"
                  onClick={() => navigate('/templates')}
                >
                  <FileText className="w-5 h-5" />
                  <span className="text-sm">Templates</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
