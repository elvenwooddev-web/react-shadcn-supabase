import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Command } from 'cmdk'
import { useProjects } from '@/contexts/ProjectContext'
import { useTasks } from '@/contexts/TaskContext'
import { useUser } from '@/contexts/UserContext'
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog'
import {
  Home,
  CheckSquare,
  Calendar,
  BarChart3,
  FileText,
  AlertTriangle,
  Shield,
  Settings,
  FolderOpen,
  Search,
  Clock,
  Users,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const navigate = useNavigate()

  const { projects } = useProjects()
  const { allTasks } = useTasks()
  const { currentUser } = useUser()

  // Listen for Cmd+K / Ctrl+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  // Handle navigation
  const handleSelect = useCallback((callback: () => void) => {
    setOpen(false)
    setSearch('')
    callback()
  }, [])

  // Filter tasks by search
  const filteredTasks = search
    ? allTasks.filter(
        (task) =>
          task.title.toLowerCase().includes(search.toLowerCase()) ||
          task.trackingId.toLowerCase().includes(search.toLowerCase())
      ).slice(0, 5)
    : []

  // Filter projects by search
  const filteredProjects = search
    ? projects.filter((project) =>
        project.name.toLowerCase().includes(search.toLowerCase()) ||
        project.projectCode.toLowerCase().includes(search.toLowerCase())
      ).slice(0, 5)
    : []

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="p-0 max-w-2xl overflow-hidden">
        <Command className="rounded-lg border-none" shouldFilter={false}>
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <Command.Input
              placeholder="Type a command or search..."
              className="flex h-12 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
              value={search}
              onValueChange={setSearch}
            />
          </div>

          <Command.List className="max-h-[400px] overflow-y-auto p-2">
            <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
              No results found.
            </Command.Empty>

            {!search && (
              <>
                {/* Quick Actions */}
                <Command.Group heading="Quick Actions" className="mb-2">
                  <CommandItem
                    icon={<Home className="w-4 h-4" />}
                    onSelect={() => handleSelect(() => navigate('/'))}
                  >
                    Go to All Projects
                  </CommandItem>
                  <CommandItem
                    icon={<CheckSquare className="w-4 h-4" />}
                    onSelect={() => handleSelect(() => navigate('/my-work'))}
                  >
                    Go to My Work
                  </CommandItem>
                  <CommandItem
                    icon={<Calendar className="w-4 h-4" />}
                    onSelect={() => handleSelect(() => navigate('/calendar'))}
                  >
                    Go to Calendar
                  </CommandItem>
                  <CommandItem
                    icon={<BarChart3 className="w-4 h-4" />}
                    onSelect={() => handleSelect(() => navigate('/dashboard'))}
                  >
                    Go to Dashboard
                  </CommandItem>
                  <CommandItem
                    icon={<FileText className="w-4 h-4" />}
                    onSelect={() => handleSelect(() => navigate('/templates'))}
                  >
                    Go to Templates
                  </CommandItem>
                  <CommandItem
                    icon={<AlertTriangle className="w-4 h-4" />}
                    onSelect={() => handleSelect(() => navigate('/issues'))}
                  >
                    Go to Issues
                  </CommandItem>
                  <CommandItem
                    icon={<Shield className="w-4 h-4" />}
                    onSelect={() => handleSelect(() => navigate('/approvals'))}
                  >
                    Go to Approvals
                  </CommandItem>
                  <CommandItem
                    icon={<Settings className="w-4 h-4" />}
                    onSelect={() => handleSelect(() => navigate('/settings'))}
                  >
                    Go to Settings
                  </CommandItem>
                </Command.Group>

                {/* Recent Projects */}
                <Command.Group heading="Recent Projects" className="mb-2">
                  {projects.slice(0, 5).map((project) => (
                    <CommandItem
                      key={project.id}
                      icon={<FolderOpen className="w-4 h-4" />}
                      onSelect={() =>
                        handleSelect(() => navigate(`/projects/${project.id}/overview`))
                      }
                    >
                      {project.name}
                      <span className="ml-2 text-xs text-muted-foreground">
                        {project.projectCode}
                      </span>
                    </CommandItem>
                  ))}
                </Command.Group>
              </>
            )}

            {/* Search Results - Projects */}
            {search && filteredProjects.length > 0 && (
              <Command.Group heading="Projects" className="mb-2">
                {filteredProjects.map((project) => (
                  <CommandItem
                    key={project.id}
                    icon={<FolderOpen className="w-4 h-4" />}
                    onSelect={() =>
                      handleSelect(() => navigate(`/projects/${project.id}/overview`))
                    }
                  >
                    {project.name}
                    <span className="ml-2 text-xs text-muted-foreground">
                      {project.projectCode}
                    </span>
                  </CommandItem>
                ))}
              </Command.Group>
            )}

            {/* Search Results - Tasks */}
            {search && filteredTasks.length > 0 && (
              <Command.Group heading="Tasks" className="mb-2">
                {filteredTasks.map((task) => (
                  <CommandItem
                    key={task.id}
                    icon={<CheckSquare className="w-4 h-4" />}
                    onSelect={() => {
                      // In a real app, you'd navigate to the task detail
                      handleSelect(() => {})
                    }}
                  >
                    {task.title}
                    <span className="ml-2 text-xs text-muted-foreground">
                      {task.trackingId}
                    </span>
                  </CommandItem>
                ))}
              </Command.Group>
            )}
          </Command.List>

          <div className="border-t p-2 text-xs text-muted-foreground">
            <div className="flex items-center justify-between">
              <span>Press Esc to close</span>
              <span>Use ↑↓ to navigate</span>
            </div>
          </div>
        </Command>
      </DialogContent>
    </Dialog>
  )
}

interface CommandItemProps {
  children: React.ReactNode
  icon?: React.ReactNode
  onSelect: () => void
}

function CommandItem({ children, icon, onSelect }: CommandItemProps) {
  return (
    <Command.Item
      onSelect={onSelect}
      className={cn(
        'relative flex cursor-pointer select-none items-center rounded-sm px-2 py-2 text-sm outline-none',
        'data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground',
        'data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50'
      )}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </Command.Item>
  )
}
