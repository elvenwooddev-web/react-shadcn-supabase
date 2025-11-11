import { useMemo } from 'react'
import { useTasks } from '@/contexts/TaskContext'
import { useProjects } from '@/contexts/ProjectContext'
import { useUser } from '@/contexts/UserContext'
import { Header, LeftSidebar } from '@/components/layouts'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { BarChart3, TrendingUp, Users, CheckCircle, Clock, AlertTriangle } from 'lucide-react'
import type { WorkflowStage } from '@/types'

const COLORS = {
  urgent: '#ef4444',
  high: '#f97316',
  medium: '#3b82f6',
  low: '#10b981',
}

const STAGE_COLORS = [
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#f59e0b', // amber
  '#10b981', // green
  '#3b82f6', // blue
  '#6366f1', // indigo
  '#14b8a6', // teal
]

export function DashboardPage() {
  const { allTasks } = useTasks()
  const { projects } = useProjects()
  const { currentUser } = useUser()

  // Calculate overall stats
  const overallStats = useMemo(() => {
    if (!allTasks || !projects) return {
      total: 0,
      completed: 0,
      inProgress: 0,
      blocked: 0,
      overdue: 0,
      completionRate: 0,
      activeProjects: 0,
      totalProjects: 0,
    }

    const total = allTasks.length
    const completed = allTasks.filter(t => t.status === 'completed').length
    const inProgress = allTasks.filter(t => t.status === 'in-progress').length
    const blocked = allTasks.filter(t => t.status === 'blocked').length

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const overdue = allTasks.filter(t => {
      const dueDate = new Date(t.dueDate)
      dueDate.setHours(0, 0, 0, 0)
      return dueDate < today && t.status !== 'completed'
    }).length

    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0

    return {
      total,
      completed,
      inProgress,
      blocked,
      overdue,
      completionRate,
      activeProjects: projects.filter(p => p.status === 'active').length,
      totalProjects: projects.length,
    }
  }, [allTasks, projects])

  // Tasks by priority
  const tasksByPriority = useMemo(() => {
    if (!allTasks) return []
    const priorities = ['urgent', 'high', 'medium', 'low']
    return priorities.map(priority => ({
      name: priority.charAt(0).toUpperCase() + priority.slice(1),
      value: allTasks.filter(t => t.priority === priority && t.status !== 'completed').length,
      total: allTasks.filter(t => t.priority === priority).length,
    }))
  }, [allTasks])

  // Tasks by stage
  const tasksByStage = useMemo(() => {
    if (!allTasks) return []
    const stages: WorkflowStage[] = [
      'Sales',
      'Design',
      'Technical Design',
      'Procurement',
      'Production',
      'Execution',
      'Post Installation',
    ]

    return stages.map(stage => ({
      name: stage,
      active: allTasks.filter(t => t.stage === stage && t.status !== 'completed').length,
      completed: allTasks.filter(t => t.stage === stage && t.status === 'completed').length,
    }))
  }, [allTasks])

  // Task completion trend (last 7 days)
  const completionTrend = useMemo(() => {
    if (!allTasks) return []
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (6 - i))
      return date
    })

    return last7Days.map(date => {
      const dateStr = date.toISOString().split('T')[0]
      const completed = allTasks.filter(t => {
        const updatedDate = new Date(t.updatedAt).toISOString().split('T')[0]
        return t.status === 'completed' && updatedDate === dateStr
      }).length

      return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        completed,
      }
    })
  }, [allTasks])

  // Team performance (tasks completed per team member)
  const teamPerformance = useMemo(() => {
    if (!allTasks) return []
    const performanceMap = new Map<string, { name: string; completed: number; active: number }>()

    allTasks.forEach(task => {
      task.assignees?.forEach(assignee => {
        if (!performanceMap.has(assignee.userId || assignee.id)) {
          performanceMap.set(assignee.userId || assignee.id, {
            name: assignee.name,
            completed: 0,
            active: 0,
          })
        }

        const stats = performanceMap.get(assignee.userId || assignee.id)!
        if (task.status === 'completed') {
          stats.completed++
        } else {
          stats.active++
        }
      })
    })

    return Array.from(performanceMap.values())
      .sort((a, b) => b.completed - a.completed)
      .slice(0, 10) // Top 10 performers
  }, [allTasks])

  // Project progress
  const projectProgress = useMemo(() => {
    if (!projects || !allTasks) return []
    return projects.slice(0, 5).map(project => {
      // In real implementation, you'd filter tasks by project
      const projectTasks = allTasks.filter(() => true) // Placeholder
      const total = projectTasks.length
      const completed = projectTasks.filter(t => t.status === 'completed').length
      const progress = total > 0 ? Math.round((completed / total) * 100) : 0

      return {
        name: project.name.length > 20 ? project.name.substring(0, 20) + '...' : project.name,
        progress,
        completed,
        total,
      }
    })
  }, [projects, allTasks])

  return (
    <div className="flex h-screen bg-background">
      <LeftSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto p-6">
          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <BarChart3 className="w-8 h-8" />
              Analytics Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Overview of projects and tasks performance
            </p>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Tasks</p>
                  <p className="text-3xl font-bold mt-2">{overallStats.total}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {overallStats.completionRate}% completed
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">In Progress</p>
                  <p className="text-3xl font-bold mt-2">{overallStats.inProgress}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Active tasks
                  </p>
                </div>
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center">
                  <Clock className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Overdue</p>
                  <p className="text-3xl font-bold mt-2 text-red-600">{overallStats.overdue}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Need attention
                  </p>
                </div>
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Projects</p>
                  <p className="text-3xl font-bold mt-2">{overallStats.activeProjects}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    of {overallStats.totalProjects} total
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </Card>
          </div>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Completion Trend */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Completion Trend (Last 7 Days)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={completionTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="completed"
                    stroke="#10b981"
                    strokeWidth={2}
                    name="Completed Tasks"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>

            {/* Tasks by Priority */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Tasks by Priority</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={tasksByPriority}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {tasksByPriority.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={Object.values(COLORS)[index]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* Charts Row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Tasks by Stage */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Tasks by Workflow Stage</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={tasksByStage}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="active" stackId="a" fill="#3b82f6" name="Active" />
                  <Bar dataKey="completed" stackId="a" fill="#10b981" name="Completed" />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            {/* Team Performance */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Team Performance (Top 10)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={teamPerformance} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={100} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="completed" fill="#10b981" name="Completed" />
                  <Bar dataKey="active" fill="#f59e0b" name="Active" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* Project Progress */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Projects Progress</h3>
            <div className="space-y-4">
              {projectProgress.map((project, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{project.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {project.completed}/{project.total} tasks ({project.progress}%)
                    </span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className="bg-primary rounded-full h-2 transition-all"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </main>
      </div>
    </div>
  )
}
