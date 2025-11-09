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
        return { Icon: MessageCircle, color: 'text-slate-600 dark:text-slate-300', bg: 'bg-slate-200 dark:bg-slate-700' }
      default:
        return { Icon: MessageCircle, color: 'text-slate-600', bg: 'bg-slate-200' }
    }
  }

  return (
    <aside className="w-80 border-l border-slate-200 dark:border-slate-800 p-6 bg-white dark:bg-[#101c22] min-h-[calc(100vh-69px)]">
      <div className="space-y-6">
        {/* Project Details */}
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50 mb-3">
            Project Details
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Start Date</span>
              <span className="font-medium text-slate-800 dark:text-slate-200">
                {currentProject.startDate}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Est. Completion</span>
              <span className="font-medium text-slate-800 dark:text-slate-200">
                {currentProject.estimatedCompletion}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Project Manager</span>
              <span className="font-medium text-slate-800 dark:text-slate-200">
                {currentProject.projectManager.name}
              </span>
            </div>
          </div>
        </div>

        {/* Team Members */}
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50 mb-3">
            Team Members
          </h3>
          <div className="space-y-3">
            {teamMembers.map((member) => (
              <div key={member.id} className="flex items-center gap-3">
                <Avatar src={member.avatar} alt={member.name} className="size-8" />
                <div>
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                    {member.name}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {member.role}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50 mb-3">
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
                    <p className="text-sm text-slate-800 dark:text-slate-200">
                      <span className="font-semibold">{activity.userName}</span>{' '}
                      {activity.message}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
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
