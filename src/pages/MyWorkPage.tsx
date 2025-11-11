import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTasks } from '@/contexts/TaskContext'
import { useProjects } from '@/contexts/ProjectContext'
import { useUser } from '@/contexts/UserContext'
import { Header, LeftSidebar } from '@/components/layouts'
import { TaskCard } from '@/components/tasks'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CheckSquare, Search, Filter, Calendar, Clock, AlertCircle } from 'lucide-react'
import type { TaskStatus, TaskPriority, WorkflowStage } from '@/types'

type ViewMode = 'all' | 'today' | 'week' | 'overdue'
type GroupBy = 'project' | 'priority' | 'stage' | 'dueDate' | 'none'

export function MyWorkPage() {
  const navigate = useNavigate()
  const { allTasks } = useTasks()
  const { projects } = useProjects()
  const { currentUser } = useUser()

  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all')
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'all'>('all')
  const [projectFilter, setProjectFilter] = useState<string>('all')
  const [viewMode, setViewMode] = useState<ViewMode>('all')
  const [groupBy, setGroupBy] = useState<GroupBy>('project')

  // Get tasks assigned to current user
  const myTasks = useMemo(() => {
    if (!currentUser || !allTasks) return []

    return allTasks.filter(task => {
      // Check if user is assigned to the task
      const isAssigned = task.assignees?.some(a => a.userId === currentUser.id) ||
                        task.assignee?.userId === currentUser.id
      return isAssigned
    })
  }, [allTasks, currentUser])

  // Filter tasks by view mode
  const filteredByViewMode = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const weekFromNow = new Date(today)
    weekFromNow.setDate(weekFromNow.getDate() + 7)

    return myTasks.filter(task => {
      const dueDate = new Date(task.dueDate)
      dueDate.setHours(0, 0, 0, 0)

      switch (viewMode) {
        case 'today':
          return dueDate.getTime() === today.getTime()
        case 'week':
          return dueDate >= today && dueDate <= weekFromNow
        case 'overdue':
          return dueDate < today && task.status !== 'completed'
        default:
          return true
      }
    })
  }, [myTasks, viewMode])

  // Apply additional filters
  const filteredTasks = useMemo(() => {
    return filteredByViewMode.filter((task) => {
      const matchesSearch =
        searchQuery === '' ||
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.trackingId.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesStatus = statusFilter === 'all' || task.status === statusFilter
      const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter

      const matchesProject = projectFilter === 'all' ||
        projects.some(p => p.id === projectFilter && allTasks.some(t => t.id === task.id))

      return matchesSearch && matchesStatus && matchesPriority && matchesProject
    })
  }, [filteredByViewMode, searchQuery, statusFilter, priorityFilter, projectFilter, projects, allTasks])

  // Group tasks
  const groupedTasks = useMemo(() => {
    if (groupBy === 'none') {
      return { 'All Tasks': filteredTasks }
    }

    const groups: Record<string, typeof filteredTasks> = {}

    filteredTasks.forEach(task => {
      let groupKey: string

      switch (groupBy) {
        case 'project':
          const project = projects.find(p =>
            allTasks.some(t => t.id === task.id)
          )
          groupKey = project?.name || 'No Project'
          break
        case 'priority':
          groupKey = task.priority.charAt(0).toUpperCase() + task.priority.slice(1)
          break
        case 'stage':
          groupKey = task.stage
          break
        case 'dueDate':
          const dueDate = new Date(task.dueDate)
          const today = new Date()
          today.setHours(0, 0, 0, 0)

          if (dueDate < today) {
            groupKey = 'Overdue'
          } else if (dueDate.toDateString() === today.toDateString()) {
            groupKey = 'Today'
          } else if (dueDate.getTime() <= today.getTime() + 7 * 24 * 60 * 60 * 1000) {
            groupKey = 'This Week'
          } else {
            groupKey = 'Later'
          }
          break
        default:
          groupKey = 'All Tasks'
      }

      if (!groups[groupKey]) {
        groups[groupKey] = []
      }
      groups[groupKey].push(task)
    })

    return groups
  }, [filteredTasks, groupBy, projects, allTasks])

  // Stats
  const stats = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    return {
      total: myTasks.length,
      completed: myTasks.filter(t => t.status === 'completed').length,
      inProgress: myTasks.filter(t => t.status === 'in-progress').length,
      overdue: myTasks.filter(t => {
        const dueDate = new Date(t.dueDate)
        dueDate.setHours(0, 0, 0, 0)
        return dueDate < today && t.status !== 'completed'
      }).length,
      dueToday: myTasks.filter(t => {
        const dueDate = new Date(t.dueDate)
        dueDate.setHours(0, 0, 0, 0)
        return dueDate.getTime() === today.getTime()
      }).length,
    }
  }, [myTasks])

  return (
    <div className="flex h-screen bg-background">
      <LeftSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto p-6">
          {/* Page Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-2">
                  <CheckSquare className="w-8 h-8" />
                  My Work
                </h1>
                <p className="text-muted-foreground mt-1">
                  Your tasks across all projects
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
              <div className="p-4 border rounded-lg">
                <div className="text-sm text-muted-foreground">Total Tasks</div>
                <div className="text-2xl font-bold mt-1">{stats.total}</div>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="text-sm text-muted-foreground">In Progress</div>
                <div className="text-2xl font-bold mt-1 text-blue-600">{stats.inProgress}</div>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="text-sm text-muted-foreground">Due Today</div>
                <div className="text-2xl font-bold mt-1 text-orange-600">{stats.dueToday}</div>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="text-sm text-muted-foreground">Overdue</div>
                <div className="text-2xl font-bold mt-1 text-red-600">{stats.overdue}</div>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="text-sm text-muted-foreground">Completed</div>
                <div className="text-2xl font-bold mt-1 text-green-600">{stats.completed}</div>
              </div>
            </div>

            {/* View Mode Tabs */}
            <div className="flex items-center gap-2 mb-4">
              <Button
                variant={viewMode === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('all')}
              >
                All Tasks
              </Button>
              <Button
                variant={viewMode === 'today' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('today')}
              >
                <Calendar className="w-4 h-4 mr-1" />
                Today
              </Button>
              <Button
                variant={viewMode === 'week' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('week')}
              >
                <Clock className="w-4 h-4 mr-1" />
                This Week
              </Button>
              <Button
                variant={viewMode === 'overdue' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('overdue')}
              >
                <AlertCircle className="w-4 h-4 mr-1" />
                Overdue
              </Button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as typeof statusFilter)}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="blocked">Blocked</SelectItem>
                </SelectContent>
              </Select>

              <Select value={priorityFilter} onValueChange={(value) => setPriorityFilter(value as typeof priorityFilter)}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>

              <Select value={groupBy} onValueChange={(value) => setGroupBy(value as GroupBy)}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Group by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Grouping</SelectItem>
                  <SelectItem value="project">By Project</SelectItem>
                  <SelectItem value="priority">By Priority</SelectItem>
                  <SelectItem value="stage">By Stage</SelectItem>
                  <SelectItem value="dueDate">By Due Date</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tasks List */}
          {Object.keys(groupedTasks).length === 0 ? (
            <div className="text-center py-12">
              <CheckSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No tasks found</h3>
              <p className="text-muted-foreground">
                {searchQuery || statusFilter !== 'all' || priorityFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'You have no assigned tasks'}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedTasks).map(([groupName, tasks]) => (
                <div key={groupName}>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                      {groupName}
                      <Badge variant="secondary">{tasks.length}</Badge>
                    </h2>
                  </div>
                  <div className="space-y-2">
                    {tasks.map((task) => (
                      <TaskCard key={task.id} task={task} showProject />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
