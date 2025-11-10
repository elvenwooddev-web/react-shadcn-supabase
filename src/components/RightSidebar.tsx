import { CheckCircle2, Upload, MessageCircle } from 'lucide-react'
import { Avatar } from '@/components/ui/avatar'
import { useProjects } from '@/contexts/ProjectContext'
import { useTeam } from '@/contexts/TeamContext'
import { formatRelativeTime } from '@/lib/helpers'

export function RightSidebar() {
  const { currentProject } = useProjects()
  const { teamMembers, activities } = useTeam()

  if (!currentProject) return null

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'task-completed':
        return { Icon: CheckCircle2, color: 'text-success', bg: 'bg-success/20' }
      case 'file-uploaded':
        return { Icon: Upload, color: 'text-primary', bg: 'bg-primary/20' }
      case 'comment-added':
        return { Icon: MessageCircle, color: 'text-muted-foreground', bg: 'bg-muted' }
      default:
        return { Icon: MessageCircle, color: 'text-muted-foreground', bg: 'bg-muted' }
    }
  }

  return (
    <aside className="hidden xl:block w-80 border-l border-border p-6 bg-card min-h-[calc(100vh-69px)]">
      <div className="space-y-6">
        {/* Project Details */}
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3">
            Project Details
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Start Date</span>
              <span className="font-medium text-foreground">
                {currentProject.startDate}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Est. Completion</span>
              <span className="font-medium text-foreground">
                {currentProject.estimatedCompletion}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Project Manager</span>
              <span className="font-medium text-foreground">
                {currentProject.projectManager.name}
              </span>
            </div>
          </div>
        </div>

        {/* Team Members */}
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3">
            Team Members
          </h3>
          <div className="space-y-3">
            {teamMembers.map((member) => (
              <div key={member.id} className="flex items-center gap-3">
                <Avatar src={member.avatar} alt={member.name} className="size-8" />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {member.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {member.role}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3">
            Recent Activity
          </h3>
          <ul className="space-y-4">
            {activities.slice(0, 10).map((activity) => {
              const { Icon, color, bg } = getActivityIcon(activity.type)
              return (
                <li key={activity.id} className="flex gap-3">
                  <div className={`flex items-center justify-center size-7 rounded-full ${bg}`}>
                    <Icon className={`h-4 w-4 ${color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground">
                      <span className="font-semibold">{activity.userName}</span>{' '}
                      {activity.message}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatRelativeTime(activity.timestamp)}
                    </p>
                  </div>
                </li>
              )
            })}
            {activities.length === 0 && (
              <li className="text-sm text-muted-foreground text-center py-4">
                No activity yet
              </li>
            )}
          </ul>
        </div>
      </div>
    </aside>
  )
}
