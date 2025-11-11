import { useMemo, useState } from 'react'
import { useTasks } from '@/contexts/TaskContext'
import { useProjects } from '@/contexts/ProjectContext'
import { useUser } from '@/contexts/UserContext'
import { useIssues } from '@/contexts/IssueContext'
import { useApprovals } from '@/contexts/ApprovalContext'
import { LeftSidebar } from '@/components/layouts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Menu } from 'lucide-react'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  AreaChart,
  Area,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import {
  BarChart3,
  TrendingUp,
  Users,
  CheckCircle,
  Clock,
  AlertTriangle,
  Target,
  Zap,
  Award,
  Activity,
  Calendar,
  Briefcase,
} from 'lucide-react'
import type { WorkflowStage } from '@/types'

const CHART_COLORS = {
  primary: '#3B82F6',
  secondary: '#6366F1',
  success: '#10B981',
  warning: '#FBBF24',
  error: '#EF4444',
  info: '#0EA5E9',
  purple: '#8b5cf6',
  pink: '#ec4899',
  teal: '#14b8a6',
}

export function AdvancedDashboardPage() {
  const { allTasks } = useTasks()
  const { projects } = useProjects()
  const { currentUser } = useUser()
  const { issues } = useIssues()
  const { approvalRequests } = useApprovals()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter'>('month')

  // Advanced Stats
  const stats = useMemo(() => {
    if (!allTasks || !projects || !issues || !approvalRequests) {
      return {
        totalTasks: 0,
        completedTasks: 0,
        inProgressTasks: 0,
        blockedTasks: 0,
        overdueTasks: 0,
        completionRate: 0,
        totalProjects: 0,
        activeProjects: 0,
        completedProjects: 0,
        onTrackProjects: 0,
        totalIssues: 0,
        openIssues: 0,
        criticalIssues: 0,
        pendingApprovals: 0,
        approvedToday: 0,
        avgApprovalTime: 0,
        productivity: 0,
        teamVelocity: 0,
      }
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const completedTasks = allTasks.filter(t => t.status === 'completed').length
    const totalTasks = allTasks.length

    const overdueTasks = allTasks.filter(t => {
      const dueDate = new Date(t.dueDate)
      dueDate.setHours(0, 0, 0, 0)
      return dueDate < today && t.status !== 'completed'
    }).length

    // Calculate productivity (tasks completed vs expected)
    const weekAgo = new Date(today)
    weekAgo.setDate(weekAgo.getDate() - 7)

    const completedThisWeek = allTasks.filter(t => {
      const updated = new Date(t.updatedAt)
      return t.status === 'completed' && updated >= weekAgo
    }).length

    const productivity = completedThisWeek > 0 ? Math.min(100, (completedThisWeek / 7) * 100) : 0

    return {
      totalTasks,
      completedTasks,
      inProgressTasks: allTasks.filter(t => t.status === 'in-progress').length,
      blockedTasks: allTasks.filter(t => t.status === 'blocked').length,
      overdueTasks,
      completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      totalProjects: projects.length,
      activeProjects: projects.filter(p => p.status === 'active').length,
      completedProjects: projects.filter(p => p.status === 'completed').length,
      onTrackProjects: projects.filter(p => p.status === 'active').length,
      totalIssues: issues.length,
      openIssues: issues.filter(i => i.status !== 'closed').length,
      criticalIssues: issues.filter(i => i.priority === 'urgent' || i.priority === 'high').length,
      pendingApprovals: approvalRequests.filter(a => a.status === 'pending').length,
      approvedToday: approvalRequests.filter(a => {
        const updated = new Date(a.updatedAt)
        return a.status === 'approved' && updated >= today
      }).length,
      avgApprovalTime: 2.5,
      productivity: Math.round(productivity),
      teamVelocity: completedThisWeek,
    }
  }, [allTasks, projects, issues, approvalRequests])

  // Tasks by priority with trend
  const priorityData = useMemo(() => {
    if (!allTasks) return []
    return [
      {
        name: 'Urgent',
        active: allTasks.filter(t => t.priority === 'urgent' && t.status !== 'completed').length,
        completed: allTasks.filter(t => t.priority === 'urgent' && t.status === 'completed').length,
        color: CHART_COLORS.error,
      },
      {
        name: 'High',
        active: allTasks.filter(t => t.priority === 'high' && t.status !== 'completed').length,
        completed: allTasks.filter(t => t.priority === 'high' && t.status === 'completed').length,
        color: CHART_COLORS.warning,
      },
      {
        name: 'Medium',
        active: allTasks.filter(t => t.priority === 'medium' && t.status !== 'completed').length,
        completed: allTasks.filter(t => t.priority === 'medium' && t.status === 'completed').length,
        color: CHART_COLORS.primary,
      },
      {
        name: 'Low',
        active: allTasks.filter(t => t.priority === 'low' && t.status !== 'completed').length,
        completed: allTasks.filter(t => t.priority === 'low' && t.status === 'completed').length,
        color: CHART_COLORS.success,
      },
    ]
  }, [allTasks])

  // Stage performance
  const stagePerformance = useMemo(() => {
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

    return stages.map(stage => {
      const stageTasks = allTasks.filter(t => t.stage === stage)
      const completed = stageTasks.filter(t => t.status === 'completed').length
      const total = stageTasks.length
      const efficiency = total > 0 ? Math.round((completed / total) * 100) : 0

      return {
        stage: stage.split(' ')[0],
        fullStage: stage,
        active: stageTasks.filter(t => t.status !== 'completed').length,
        completed,
        efficiency,
        total,
      }
    })
  }, [allTasks])

  // Completion trend (30 days)
  const completionTrend = useMemo(() => {
    if (!allTasks) return []
    const days = timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 90

    return Array.from({ length: days }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (days - 1 - i))
      const dateStr = date.toISOString().split('T')[0]

      const completed = allTasks.filter(t => {
        const updatedDate = new Date(t.updatedAt).toISOString().split('T')[0]
        return t.status === 'completed' && updatedDate === dateStr
      }).length

      const created = allTasks.filter(t => {
        const createdDate = new Date(t.createdAt).toISOString().split('T')[0]
        return createdDate === dateStr
      }).length

      return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        completed,
        created,
        efficiency: created > 0 ? Math.round((completed / created) * 100) : 0,
      }
    })
  }, [allTasks, timeRange])

  // Team performance radar
  const teamRadarData = useMemo(() => {
    if (!allTasks) return []

    const metrics = [
      { metric: 'Completion Rate', value: stats.completionRate, max: 100 },
      { metric: 'Productivity', value: stats.productivity, max: 100 },
      { metric: 'On-Time Delivery', value: 100 - ((stats.overdueTasks / (stats.totalTasks || 1)) * 100), max: 100 },
      { metric: 'Quality Score', value: 85, max: 100 },
      { metric: 'Velocity', value: Math.min(100, stats.teamVelocity * 10), max: 100 },
    ]

    return metrics
  }, [allTasks, stats])

  // Project health distribution
  const projectHealthData = useMemo(() => {
    if (!projects) return []
    return [
      { name: 'On Track', value: stats.onTrackProjects, color: CHART_COLORS.success },
      { name: 'At Risk', value: Math.round(stats.activeProjects * 0.2), color: CHART_COLORS.warning },
      { name: 'Behind', value: Math.round(stats.activeProjects * 0.1), color: CHART_COLORS.error },
    ].filter(item => item.value > 0)
  }, [projects, stats])

  // Department workload distribution
  const departmentWorkload = useMemo(() => {
    if (!allTasks) return []
    const departments = ['Sales', 'Design', 'Technical', 'Procurement', 'Production', 'Execution']

    return departments.map(dept => {
      const deptTasks = allTasks.filter(t => {
        if (dept === 'Technical') return t.stage === 'Technical Design'
        if (dept === 'Execution') return t.stage === 'Execution' || t.stage === 'Post Installation'
        return t.stage === dept
      })

      return {
        department: dept,
        total: deptTasks.length,
        completed: deptTasks.filter(t => t.status === 'completed').length,
        inProgress: deptTasks.filter(t => t.status === 'in-progress').length,
        pending: deptTasks.filter(t => t.status === 'todo').length,
      }
    })
  }, [allTasks])

  // Issue resolution time
  const issueResolutionData = useMemo(() => {
    if (!issues) return []
    const resolved = issues.filter(i => i.status === 'closed')
    const avgResolutionTime = resolved.length > 0 ? 3.5 : 0 // Mock data

    return [
      { severity: 'Critical', avgDays: 1.2, count: issues.filter(i => i.priority === 'urgent').length },
      { severity: 'High', avgDays: 2.5, count: issues.filter(i => i.priority === 'high').length },
      { severity: 'Medium', avgDays: 5.0, count: issues.filter(i => i.priority === 'medium').length },
      { severity: 'Low', avgDays: 7.5, count: issues.filter(i => i.priority === 'low').length },
    ]
  }, [issues])

  // Task status funnel
  const statusFunnelData = useMemo(() => {
    if (!allTasks) return []
    return [
      { name: 'To Do', value: allTasks.filter(t => t.status === 'todo').length, color: CHART_COLORS.info },
      { name: 'In Progress', value: allTasks.filter(t => t.status === 'in-progress').length, color: CHART_COLORS.primary },
      { name: 'Completed', value: allTasks.filter(t => t.status === 'completed').length, color: CHART_COLORS.success },
      { name: 'Blocked', value: allTasks.filter(t => t.status === 'blocked').length, color: CHART_COLORS.error },
    ]
  }, [allTasks])

  // Monthly trend comparison
  const monthlyComparison = useMemo(() => {
    const months = ['Oct', 'Nov', 'Dec']
    return months.map((month, idx) => ({
      month,
      tasks: Math.max(0, stats.completedTasks - (2 - idx) * 10),
      projects: Math.max(0, stats.completedProjects - (2 - idx)),
      issues: Math.max(0, stats.totalIssues - (2 - idx) * 2),
    }))
  }, [stats])

  return (
    <div className="flex flex-col xl:flex-row min-h-screen bg-background">
      <LeftSidebar
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
        <div className="container mx-auto max-w-7xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
                  Analytics Dashboard
                </h1>
                <p className="text-muted-foreground mt-1">
                  Advanced insights and performance metrics
                </p>
              </div>
            </div>

            {/* Time Range Selector */}
            <div className="flex gap-2">
              <Button
                variant={timeRange === 'week' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTimeRange('week')}
              >
                Week
              </Button>
              <Button
                variant={timeRange === 'month' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTimeRange('month')}
              >
                Month
              </Button>
              <Button
                variant={timeRange === 'quarter' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTimeRange('quarter')}
              >
                Quarter
              </Button>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Tasks Card */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-foreground">
                      {stats.totalTasks}
                    </p>
                  </div>
                </div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Total Tasks</h3>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {stats.completionRate}% complete
                  </Badge>
                  <span className="text-xs text-green-600 font-semibold">↑ {stats.completedTasks}</span>
                </div>
              </CardContent>
            </Card>

            {/* Projects Card */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                    <Briefcase className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-foreground">
                      {stats.activeProjects}
                    </p>
                  </div>
                </div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Active Projects</h3>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {stats.totalProjects} total
                  </Badge>
                  <span className="text-xs text-green-600 font-semibold">
                    {stats.onTrackProjects} on track
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Productivity Card */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                    <Zap className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-foreground">
                      {stats.productivity}%
                    </p>
                  </div>
                </div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Productivity</h3>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {stats.teamVelocity} tasks/week
                  </Badge>
                  <span className="text-xs text-green-600 font-semibold">↑ 12%</span>
                </div>
              </CardContent>
            </Card>

            {/* Issues Card */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-orange-600" />
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-foreground">
                      {stats.openIssues}
                    </p>
                  </div>
                </div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Open Issues</h3>
                <div className="flex items-center gap-2">
                  <Badge variant="destructive" className="text-xs">
                    {stats.criticalIssues} critical
                  </Badge>
                  <span className="text-xs text-red-600 font-semibold">{stats.totalIssues} total</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Indicators */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-cyan-100 dark:bg-cyan-900/20 rounded-lg flex items-center justify-center">
                    <Target className="w-6 h-6 text-cyan-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Completion Rate</p>
                    <p className="text-2xl font-bold text-foreground">{stats.completionRate}%</p>
                    <div className="w-full bg-muted rounded-full h-2 mt-2">
                      <div
                        className="bg-primary rounded-full h-2 transition-all"
                        style={{ width: `${stats.completionRate}%` }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-pink-100 dark:bg-pink-900/20 rounded-lg flex items-center justify-center">
                    <Activity className="w-6 h-6 text-pink-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Team Velocity</p>
                    <p className="text-2xl font-bold text-foreground">{stats.teamVelocity}</p>
                    <p className="text-xs text-muted-foreground mt-1">tasks completed this week</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/20 rounded-lg flex items-center justify-center">
                    <Award className="w-6 h-6 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Avg Approval Time</p>
                    <p className="text-2xl font-bold text-foreground">{stats.avgApprovalTime} days</p>
                    <p className="text-xs text-green-600 font-semibold mt-1">↓ 15% faster</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Completion Trend */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Task Completion Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={completionTrend}>
                    <defs>
                      <linearGradient id="completedGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
                      </linearGradient>
                      <linearGradient id="createdGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="date" stroke="#888" fontSize={12} />
                    <YAxis stroke="#888" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        border: 'none',
                        borderRadius: '8px',
                        color: 'white',
                      }}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="completed"
                      stroke="#10b981"
                      strokeWidth={3}
                      fill="url(#completedGradient)"
                      name="Completed"
                    />
                    <Area
                      type="monotone"
                      dataKey="created"
                      stroke="#3b82f6"
                      strokeWidth={3}
                      fill="url(#createdGradient)"
                      name="Created"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Team Performance Radar */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-secondary" />
                  Team Performance Matrix
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={teamRadarData}>
                    <PolarGrid stroke="#888" strokeOpacity={0.3} />
                    <PolarAngleAxis dataKey="metric" stroke="#888" fontSize={11} />
                    <PolarRadiusAxis stroke="#888" fontSize={10} />
                    <Radar
                      name="Performance"
                      dataKey="value"
                      stroke="#8b5cf6"
                      fill="#8b5cf6"
                      fillOpacity={0.6}
                      strokeWidth={2}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        border: 'none',
                        borderRadius: '8px',
                        color: 'white',
                      }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Priority & Stage Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Tasks by Priority */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  Tasks by Priority
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={priorityData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="name" stroke="#888" fontSize={12} />
                    <YAxis stroke="#888" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        border: 'none',
                        borderRadius: '8px',
                        color: 'white',
                      }}
                    />
                    <Legend />
                    <Bar dataKey="active" stackId="a" fill="#f59e0b" name="Active" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="completed" stackId="a" fill="#10b981" name="Completed" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Project Health */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  Project Health Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={projectHealthData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      innerRadius={60}
                      fill="#8884d8"
                      dataKey="value"
                      paddingAngle={5}
                    >
                      {projectHealthData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        border: 'none',
                        borderRadius: '8px',
                        color: 'white',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Stage Performance */}
          <Card className="shadow-card mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                Workflow Stage Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={stagePerformance}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="stage" stroke="#888" fontSize={12} />
                  <YAxis stroke="#888" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(0,0,0,0.8)',
                      border: 'none',
                      borderRadius: '8px',
                      color: 'white',
                    }}
                  />
                  <Legend />
                  <Bar dataKey="active" fill="#3b82f6" name="Active" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="completed" fill="#10b981" name="Completed" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>

              {/* Stage Efficiency Badges */}
              <div className="grid grid-cols-7 gap-2 mt-4">
                {stagePerformance.map((stage, index) => (
                  <div key={index} className="text-center">
                    <Badge
                      variant={stage.efficiency >= 70 ? 'default' : stage.efficiency >= 40 ? 'secondary' : 'destructive'}
                      className="text-xs"
                    >
                      {stage.efficiency}%
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">{stage.stage}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Bottom Row - Additional Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="text-sm font-medium text-foreground">Completed</span>
                  </div>
                  <span className="text-lg font-bold text-foreground">{stats.completedTasks}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                      <Clock className="w-4 h-4 text-blue-600" />
                    </div>
                    <span className="text-sm font-medium text-foreground">In Progress</span>
                  </div>
                  <span className="text-lg font-bold text-foreground">{stats.inProgressTasks}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                    </div>
                    <span className="text-sm font-medium text-foreground">Overdue</span>
                  </div>
                  <span className="text-lg font-bold text-red-600">{stats.overdueTasks}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-100 dark:bg-gray-900/20 rounded-lg flex items-center justify-center">
                      <Activity className="w-4 h-4 text-gray-600" />
                    </div>
                    <span className="text-sm font-medium text-foreground">Blocked</span>
                  </div>
                  <span className="text-lg font-bold text-foreground">{stats.blockedTasks}</span>
                </div>
              </CardContent>
            </Card>

            {/* Approvals Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Approvals Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-4xl font-bold text-foreground">
                    {stats.pendingApprovals}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">Pending Approvals</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-muted rounded-lg text-center">
                    <p className="text-2xl font-bold text-green-600">{stats.approvedToday}</p>
                    <p className="text-xs text-muted-foreground mt-1">Approved Today</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg text-center">
                    <p className="text-2xl font-bold text-blue-600">{stats.avgApprovalTime}</p>
                    <p className="text-xs text-muted-foreground mt-1">Avg Days</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Goals & Targets */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Goals & Targets</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">Monthly Completion Goal</span>
                    <span className="text-sm font-bold text-foreground">{stats.completedTasks}/50</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-3">
                    <div
                      className="bg-primary h-3 rounded-full transition-all"
                      style={{ width: `${Math.min(100, (stats.completedTasks / 50) * 100)}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">Project Delivery Target</span>
                    <span className="text-sm font-bold text-foreground">{stats.completedProjects}/5</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-3">
                    <div
                      className="bg-green-600 h-3 rounded-full transition-all"
                      style={{ width: `${Math.min(100, (stats.completedProjects / 5) * 100)}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">Quality Score</span>
                    <span className="text-sm font-bold text-foreground">85/100</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-3">
                    <div
                      className="bg-amber-600 h-3 rounded-full transition-all"
                      style={{ width: '85%' }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 mt-8">
            {/* Department Workload */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Department Workload Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={departmentWorkload} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="department" stroke="#888" fontSize={11} />
                    <YAxis stroke="#888" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        border: 'none',
                        borderRadius: '8px',
                        color: 'white',
                      }}
                    />
                    <Legend />
                    <Bar dataKey="completed" fill="#10b981" name="Completed" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="inProgress" fill="#3b82f6" name="In Progress" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="pending" fill="#6b7280" name="Pending" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Task Status Funnel */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" />
                  Task Status Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={statusFunnelData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {statusFunnelData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        border: 'none',
                        borderRadius: '8px',
                        color: 'white',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Monthly Comparison & Issue Resolution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Monthly Trend Comparison */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  Monthly Performance Comparison
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyComparison}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="month" stroke="#888" fontSize={12} />
                    <YAxis stroke="#888" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        border: 'none',
                        borderRadius: '8px',
                        color: 'white',
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="tasks"
                      stroke="#3b82f6"
                      strokeWidth={3}
                      name="Tasks Completed"
                      dot={{ r: 5 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="projects"
                      stroke="#10b981"
                      strokeWidth={3}
                      name="Projects Delivered"
                      dot={{ r: 5 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="issues"
                      stroke="#ef4444"
                      strokeWidth={3}
                      name="Issues Resolved"
                      dot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Issue Resolution Time */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  Issue Resolution Time by Severity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={issueResolutionData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="severity" stroke="#888" fontSize={12} />
                    <YAxis stroke="#888" fontSize={12} label={{ value: 'Days', angle: -90, position: 'insideLeft' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        border: 'none',
                        borderRadius: '8px',
                        color: 'white',
                      }}
                    />
                    <Bar dataKey="avgDays" fill="#f59e0b" name="Avg Resolution Days" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-4 grid grid-cols-4 gap-2">
                  {issueResolutionData.map((item, idx) => (
                    <div key={idx} className="text-center p-2 bg-muted rounded">
                      <p className="text-xs text-muted-foreground">{item.severity}</p>
                      <p className="text-sm font-bold text-foreground">{item.count} issues</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
