import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Issue } from '@/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'
import { EditIssueDialog } from '@/components/EditIssueDialog'
import { AlertTriangle, Calendar, User, FileText, MessageSquare, ExternalLink } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'

interface IssueCardProps {
  issue: Issue
}

export function IssueCard({ issue }: IssueCardProps) {
  const navigate = useNavigate()
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  // Severity-based styling
  const severityStyles = {
    low: 'bg-muted/50 text-foreground border-border',
    medium: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/50',
    high: 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/50',
    critical: 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/50',
  }

  const severityBorderStyles = {
    low: 'border-l-4 border-l-muted',
    medium: 'border-l-4 border-l-yellow-500',
    high: 'border-l-4 border-l-orange-500',
    critical: 'border-l-4 border-l-red-500',
  }

  const statusStyles = {
    open: 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/50',
    'in-progress': 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/50',
    resolved: 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/50',
    closed: 'bg-muted text-muted-foreground border-border',
  }

  const handleNavigateToProject = () => {
    navigate(`/projects/${issue.projectId}/workflow`)
  }

  return (
    <>
      <div
        className={`bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow ${severityBorderStyles[issue.severity]}`}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className={`font-mono text-xs ${severityStyles[issue.severity]}`}>
                {issue.trackingId}
              </Badge>
              <Badge variant="outline" className={statusStyles[issue.status]}>
                {issue.status}
              </Badge>
              <Badge variant="outline" className={severityStyles[issue.severity]}>
                <AlertTriangle className="h-3 w-3 mr-1" />
                {issue.severity}
              </Badge>
              <Badge variant="outline">
                {issue.projectCode}
              </Badge>
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-1">{issue.title}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2">{issue.description}</p>
          </div>
        </div>

        {/* Source Info */}
        <div className="flex items-center gap-4 mb-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <FileText className="h-4 w-4" />
            <span>
              {issue.sourceType === 'task' ? 'Task' : 'Subtask'}: {issue.sourceTrackingId}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span>Stage: {issue.stage}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-border">
          <div className="flex items-center gap-4">
            {/* Reported By */}
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6" src={issue.reportedBy.avatar} fallback={issue.reportedBy.name[0]} />
              <span className="text-sm text-muted-foreground">
                {issue.reportedBy.name}
              </span>
            </div>

            {/* Assigned To */}
            {issue.assignedTo && (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <Avatar className="h-6 w-6" src={issue.assignedTo.avatar} fallback={issue.assignedTo.name[0]} />
                <span className="text-sm text-muted-foreground">
                  {issue.assignedTo.name}
                </span>
              </div>
            )}

            {/* Comments */}
            {issue.comments && issue.comments.length > 0 && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <MessageSquare className="h-4 w-4" />
                <span className="text-sm">{issue.comments.length}</span>
              </div>
            )}

            {/* Created Date */}
            <div className="flex items-center gap-1 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span className="text-sm">
                {formatDistanceToNow(new Date(issue.createdAt), { addSuffix: true })}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleNavigateToProject}
              className="gap-1"
            >
              <ExternalLink className="h-4 w-4" />
              View Task
            </Button>
            <Button variant="outline" size="sm" onClick={() => setIsEditDialogOpen(true)}>
              View Details
            </Button>
          </div>
        </div>

        {/* Resolution Info */}
        {issue.status === 'resolved' && issue.resolvedBy && (
          <div className="mt-3 pt-3 border-t border-border">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Resolved by</span>
              <Avatar className="h-5 w-5" src={issue.resolvedBy.avatar} fallback={issue.resolvedBy.name[0]} />
              <span className="text-foreground font-medium">{issue.resolvedBy.name}</span>
              {issue.resolvedAt && (
                <span className="text-muted-foreground">
                  {formatDistanceToNow(new Date(issue.resolvedAt), { addSuffix: true })}
                </span>
              )}
            </div>
            {issue.resolutionNote && (
              <p className="text-sm text-muted-foreground mt-2 italic">
                "{issue.resolutionNote}"
              </p>
            )}
          </div>
        )}
      </div>

      <EditIssueDialog
        issue={issue}
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
      />
    </>
  )
}
