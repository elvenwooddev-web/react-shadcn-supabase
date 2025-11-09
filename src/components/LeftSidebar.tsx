import { NavLink, Link } from 'react-router-dom'
import { LayoutGrid, Network, FolderOpen, MessageSquare, HelpCircle, Home, BarChart3, Users, Settings, User, FileText, AlertTriangle } from 'lucide-react'
import { useProjects } from '@/contexts/ProjectContext'
import { useIssues } from '@/contexts/IssueContext'
import { cn } from '@/lib/utils'
import { ThemeSwitcher } from '@/components/ThemeSwitcher'
import { Badge } from '@/components/ui/badge'

export function LeftSidebar() {
  const { currentProject } = useProjects()
  const { getOpenIssuesCount } = useIssues()
  const openIssuesCount = getOpenIssuesCount()

  const navItems = [
    { to: 'workflow', icon: Network, label: 'Workflow' },
    { to: 'files', icon: FolderOpen, label: 'Files' },
  ]

  return (
    <aside className="flex h-full min-h-screen w-60 flex-col justify-between bg-card p-4 border-r border-border">
      <div className="flex flex-col gap-4">
        {/* App Logo / Project Info */}
        {currentProject ? (
          <div className="flex gap-3">
            <div
              className="bg-center bg-no-repeat aspect-square bg-cover rounded-lg size-10 shrink-0"
              style={{ backgroundImage: `url("${currentProject.logo}")` }}
            />
            <div className="flex flex-col min-w-0">
              <h1 className="text-foreground text-sm font-medium leading-normal truncate">
                {currentProject.name}
              </h1>
              <p className="text-muted-foreground text-xs font-normal leading-normal">
                Project Management
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="size-8 text-primary">
              <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path
                  clipRule="evenodd"
                  d="M12.0799 24L4 19.2479L9.95537 8.75216L18.04 13.4961L18.0446 4H29.9554L29.96 13.4961L38.0446 8.75216L44 19.2479L35.92 24L44 28.7521L38.0446 39.2479L29.96 34.5039L29.9554 44H18.0446L18.04 34.5039L9.95537 39.2479L4 28.7521L12.0799 24Z"
                  fill="currentColor"
                  fillRule="evenodd"
                />
              </svg>
            </div>
            <div className="flex flex-col min-w-0">
              <h1 className="text-foreground text-base font-bold leading-normal truncate">
                InteriorsFlow
              </h1>
              <p className="text-muted-foreground text-xs font-normal leading-normal">
                Project Management
              </p>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex flex-col gap-1">
          {!currentProject ? (
            /* All Projects Page Navigation */
            <>
              <a
                href="#"
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted text-foreground"
              >
                <BarChart3 className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-medium">Dashboard</span>
              </a>

              <Link
                to="/"
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted text-foreground"
              >
                <Home className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-medium">All Projects</span>
              </Link>

              <Link
                to="/templates"
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted text-foreground"
              >
                <FileText className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-medium">Templates</span>
              </Link>

              <Link
                to="/issues"
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted text-foreground"
              >
                <AlertTriangle className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-medium">Issues</span>
                {openIssuesCount > 0 && (
                  <Badge variant="destructive" className="ml-auto text-xs px-1.5 py-0.5 h-5">
                    {openIssuesCount}
                  </Badge>
                )}
              </Link>

              <a
                href="#"
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted text-foreground"
              >
                <Users className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-medium">Team Collab</span>
              </a>
            </>
          ) : (
            /* Project Page Navigation */
            <>
              <Link
                to="/"
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted text-foreground"
              >
                <Home className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-medium">All Projects</span>
              </Link>

              <div className="h-px bg-border my-2" />

              <NavLink
                to="overview"
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg',
                    isActive
                      ? 'bg-primary/20 dark:bg-primary/30'
                      : 'hover:bg-muted text-foreground'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <BarChart3
                      className={cn(
                        'h-5 w-5',
                        isActive
                          ? 'text-primary font-bold'
                          : 'text-muted-foreground'
                      )}
                    />
                    <span
                      className={cn(
                        'text-sm',
                        isActive
                          ? 'font-bold text-primary'
                          : 'font-medium'
                      )}
                    >
                      Dashboard
                    </span>
                  </>
                )}
              </NavLink>

              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-3 px-3 py-2 rounded-lg',
                        isActive
                          ? 'bg-primary/20 dark:bg-primary/30'
                          : 'hover:bg-muted text-foreground'
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <Icon
                          className={cn(
                            'h-5 w-5',
                            isActive
                              ? 'text-primary font-bold'
                              : 'text-muted-foreground'
                          )}
                        />
                        <span
                          className={cn(
                            'text-sm',
                            isActive
                              ? 'font-bold text-primary'
                              : 'font-medium'
                          )}
                        >
                          {item.label}
                        </span>
                      </>
                    )}
                  </NavLink>
                )
              })}

              <Link
                to="/issues"
                className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg hover:bg-muted text-foreground"
              >
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm font-medium">Issues</span>
                </div>
                {openIssuesCount > 0 && (
                  <Badge variant="destructive" className="text-xs px-1.5 py-0.5 h-5">
                    {openIssuesCount}
                  </Badge>
                )}
              </Link>

              <NavLink
                to="chat"
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg',
                    isActive
                      ? 'bg-primary/20 dark:bg-primary/30'
                      : 'hover:bg-muted text-foreground'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <MessageSquare
                      className={cn(
                        'h-5 w-5',
                        isActive
                          ? 'text-primary font-bold'
                          : 'text-muted-foreground'
                      )}
                    />
                    <span
                      className={cn(
                        'text-sm',
                        isActive
                          ? 'font-bold text-primary'
                          : 'font-medium'
                      )}
                    >
                      Team Chat
                    </span>
                  </>
                )}
              </NavLink>
            </>
          )}
        </nav>
      </div>

      {/* Bottom Links */}
      <nav className="flex flex-col gap-1">
        <ThemeSwitcher />
        {!currentProject ? (
          <>
            {/* All Projects Page - Settings, Profile */}
            <Link
              to="/settings"
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted text-foreground"
            >
              <Settings className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-medium">Settings</span>
            </Link>
            <a
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted text-foreground"
              href="#"
            >
              <User className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-medium">Profile</span>
            </a>
          </>
        ) : (
          /* Project Page - Help */
          <a
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted text-foreground"
            href="#"
          >
            <HelpCircle className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm font-medium">Help</span>
          </a>
        )}
      </nav>
    </aside>
  )
}
