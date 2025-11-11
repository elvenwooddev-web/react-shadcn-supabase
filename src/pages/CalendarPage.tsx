import { useState, useMemo, useCallback } from 'react'
import { Calendar as BigCalendar, dateFnsLocalizer } from 'react-big-calendar'
import type { View } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay } from 'date-fns'
import { enUS } from 'date-fns/locale'
import { useTasks } from '@/contexts/TaskContext'
import { useProjects } from '@/contexts/ProjectContext'
import { useUser } from '@/contexts/UserContext'
import { Header, LeftSidebar } from '@/components/layouts'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react'
import { EditTaskDialog } from '@/components/tasks'
import { cn } from '@/lib/utils'
import type { Task, CalendarEvent } from '@/types'
import 'react-big-calendar/lib/css/react-big-calendar.css'

const locales = {
  'en-US': enUS,
}

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { locale: enUS }),
  getDay,
  locales,
})

interface CalendarEventType extends CalendarEvent {
  task?: Task
  resource?: {
    priority: string
    status: string
    projectId?: string
    projectName?: string
  }
}

type FilterMode = 'all' | 'my-tasks' | 'project'

export function CalendarPage() {
  const { allTasks } = useTasks()
  const { projects } = useProjects()
  const { currentUser } = useUser()

  const [view, setView] = useState<View>('month')
  const [date, setDate] = useState(new Date())
  const [selectedEvent, setSelectedEvent] = useState<CalendarEventType | null>(null)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [filterMode, setFilterMode] = useState<FilterMode>('all')
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all')

  // Filter tasks based on filter mode
  const filteredTasks = useMemo(() => {
    if (!allTasks) return []
    let filtered = allTasks

    if (filterMode === 'my-tasks' && currentUser) {
      filtered = filtered.filter(task =>
        task.assignees?.some(a => a.userId === currentUser.id) ||
        task.assignee?.userId === currentUser.id
      )
    }

    if (filterMode === 'project' && selectedProjectId !== 'all') {
      // This would need project-to-task mapping in real implementation
      // For now, we'll keep all tasks
    }

    return filtered
  }, [allTasks, filterMode, selectedProjectId, currentUser])

  // Convert tasks to calendar events
  const events = useMemo<CalendarEventType[]>(() => {
    return filteredTasks.map(task => {
      const dueDate = new Date(task.dueDate)

      // Find project for this task
      const project = projects.find(p => {
        // In a real app, you'd have a projectId on the task
        // For now, we'll use a placeholder
        return true
      })

      return {
        id: task.id,
        title: task.title,
        start: dueDate,
        end: dueDate,
        allDay: true,
        type: 'task' as const,
        taskId: task.id,
        task,
        color: getPriorityColor(task.priority),
        resource: {
          priority: task.priority,
          status: task.status,
          projectId: project?.id,
          projectName: project?.name,
        },
      }
    })
  }, [filteredTasks, projects])

  const eventStyleGetter = useCallback((event: CalendarEventType) => {
    const backgroundColor = event.color || '#3174ad'

    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: event.resource?.status === 'completed' ? 0.6 : 1,
        border: '0',
        display: 'block',
        fontSize: '13px',
        padding: '2px 4px',
      },
    }
  }, [])

  const handleSelectEvent = useCallback((event: CalendarEventType) => {
    setSelectedEvent(event)
    if (event.task) {
      setSelectedTask(event.task)
    }
  }, [])

  const handleNavigate = useCallback((newDate: Date) => {
    setDate(newDate)
  }, [])

  const handleViewChange = useCallback((newView: View) => {
    setView(newView)
  }, [])

  // Custom toolbar
  const CustomToolbar = ({ label, onNavigate, onView }: any) => (
    <div className="flex items-center justify-between mb-4 p-4 bg-card border rounded-lg">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => onNavigate('PREV')}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => onNavigate('NEXT')}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          onClick={() => onNavigate('TODAY')}
        >
          Today
        </Button>
        <h2 className="text-lg font-semibold ml-4">{label}</h2>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant={view === 'month' ? 'default' : 'outline'}
          onClick={() => onView('month')}
        >
          Month
        </Button>
        <Button
          variant={view === 'week' ? 'default' : 'outline'}
          onClick={() => onView('week')}
        >
          Week
        </Button>
        <Button
          variant={view === 'day' ? 'default' : 'outline'}
          onClick={() => onView('day')}
        >
          Day
        </Button>
        <Button
          variant={view === 'agenda' ? 'default' : 'outline'}
          onClick={() => onView('agenda')}
        >
          Agenda
        </Button>
      </div>
    </div>
  )

  // Stats
  const stats = useMemo(() => {
    if (!filteredTasks) return {
      total: 0,
      thisMonth: 0,
      overdue: 0,
      completed: 0,
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const thisMonth = filteredTasks.filter(task => {
      const taskDate = new Date(task.dueDate)
      return taskDate.getMonth() === today.getMonth() &&
             taskDate.getFullYear() === today.getFullYear()
    })

    return {
      total: filteredTasks.length,
      thisMonth: thisMonth.length,
      overdue: filteredTasks.filter(t => {
        const dueDate = new Date(t.dueDate)
        dueDate.setHours(0, 0, 0, 0)
        return dueDate < today && t.status !== 'completed'
      }).length,
      completed: filteredTasks.filter(t => t.status === 'completed').length,
    }
  }, [filteredTasks])

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
                  <CalendarIcon className="w-8 h-8" />
                  Calendar
                </h1>
                <p className="text-muted-foreground mt-1">
                  View tasks by due date
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Select value={filterMode} onValueChange={(value) => setFilterMode(value as FilterMode)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Tasks</SelectItem>
                    <SelectItem value="my-tasks">My Tasks</SelectItem>
                    <SelectItem value="project">By Project</SelectItem>
                  </SelectContent>
                </Select>

                {filterMode === 'project' && (
                  <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Select project" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Projects</SelectItem>
                      {projects.map(project => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="p-4 border rounded-lg">
                <div className="text-sm text-muted-foreground">Total Tasks</div>
                <div className="text-2xl font-bold mt-1">{stats.total}</div>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="text-sm text-muted-foreground">This Month</div>
                <div className="text-2xl font-bold mt-1 text-blue-600">{stats.thisMonth}</div>
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
          </div>

          {/* Calendar */}
          <div className="bg-card border rounded-lg p-4" style={{ height: '600px' }}>
            <BigCalendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              view={view}
              date={date}
              onNavigate={handleNavigate}
              onView={handleViewChange}
              onSelectEvent={handleSelectEvent}
              eventPropGetter={eventStyleGetter}
              components={{
                toolbar: CustomToolbar,
              }}
              popup
              selectable
            />
          </div>

          {/* Legend */}
          <div className="mt-4 flex items-center gap-4 p-4 bg-card border rounded-lg">
            <span className="text-sm font-medium">Priority:</span>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#ef4444' }} />
              <span className="text-sm">Urgent</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#f97316' }} />
              <span className="text-sm">High</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#3b82f6' }} />
              <span className="text-sm">Medium</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#10b981' }} />
              <span className="text-sm">Low</span>
            </div>
          </div>
        </main>
      </div>

      {/* Task Detail Dialog */}
      {selectedTask && (
        <EditTaskDialog
          task={selectedTask}
          open={!!selectedTask}
          onOpenChange={(open) => {
            if (!open) {
              setSelectedTask(null)
              setSelectedEvent(null)
            }
          }}
        />
      )}
    </div>
  )
}

function getPriorityColor(priority: string): string {
  switch (priority) {
    case 'urgent':
      return '#ef4444' // red-500
    case 'high':
      return '#f97316' // orange-500
    case 'medium':
      return '#3b82f6' // blue-500
    case 'low':
      return '#10b981' // green-500
    default:
      return '#6b7280' // gray-500
  }
}
