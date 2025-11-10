import { useState } from 'react'
import { Shield, AlertCircle, Trash2, Power, PowerOff, Filter } from 'lucide-react'
import { useApprovalRules } from '@/contexts/ApprovalRuleContext'
import { useProjects } from '@/contexts/ProjectContext'
import type { ApprovalRule, ApprovalEntityType } from '@/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AddApprovalRuleDialog } from '@/components/settings/AddApprovalRuleDialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface ApprovalRulesTabProps {
  scope: 'global' | 'project'
  projectId?: string
}

export function ApprovalRulesTab({ scope, projectId }: ApprovalRulesTabProps) {
  const { deleteRule, toggleRule, getGlobalRules, getProjectRules } = useApprovalRules()
  const { currentProject } = useProjects()
  const [entityFilter, setEntityFilter] = useState<ApprovalEntityType | 'all'>('all')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [ruleToDelete, setRuleToDelete] = useState<string | null>(null)

  // Get rules based on scope
  const scopedRules = scope === 'global'
    ? getGlobalRules()
    : projectId
    ? getProjectRules(projectId)
    : []

  // Apply entity type filter
  const filteredRules = entityFilter === 'all'
    ? scopedRules
    : scopedRules.filter(r => r.entityType === entityFilter)

  const handleDeleteClick = (ruleId: string) => {
    setRuleToDelete(ruleId)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (ruleToDelete) {
      deleteRule(ruleToDelete)
      setRuleToDelete(null)
    }
    setDeleteDialogOpen(false)
  }

  const getEntityIcon = (entityType: ApprovalEntityType) => {
    switch (entityType) {
      case 'task':
        return '📋'
      case 'document':
        return '📄'
      case 'stage':
        return '🎯'
    }
  }

  const getApproverTypeLabel = (rule: ApprovalRule): string => {
    const firstConfig = rule.approvalConfigs[0]
    if (!firstConfig) return 'Unknown'

    switch (firstConfig.approverType) {
      case 'department-head':
        return `${firstConfig.approverRole || 'Department'} Head`
      case 'project-manager':
        return 'Project Manager'
      case 'admin':
        return 'Admin'
      case 'specific-user':
        return 'Specific User'
      case 'client':
        return 'Client'
      case 'external':
        return 'External Consultant'
      default:
        return firstConfig.approverType
    }
  }

  const getCriteriaDescription = (rule: ApprovalRule): string => {
    const { matchingCriteria } = rule
    const parts: string[] = []

    if (matchingCriteria.stages && matchingCriteria.stages.length > 0) {
      parts.push(`Stages: ${matchingCriteria.stages.join(', ')}`)
    }
    if (matchingCriteria.priority && matchingCriteria.priority.length > 0) {
      parts.push(`Priority: ${matchingCriteria.priority.join(', ')}`)
    }
    if (matchingCriteria.documentCategory && matchingCriteria.documentCategory.length > 0) {
      parts.push(`Category: ${matchingCriteria.documentCategory.join(', ')}`)
    }
    if (matchingCriteria.titlePattern) {
      parts.push(`Title: "${matchingCriteria.titlePattern}"`)
    }

    return parts.length > 0 ? parts.join(' • ') : 'All items'
  }

  const activeRulesCount = filteredRules.filter(r => r.enabled).length
  const totalRulesCount = filteredRules.length

  return (
    <div className="space-y-6">
      {/* Stats and Actions Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Active Rules</p>
              <p className="text-2xl font-bold text-foreground">{activeRulesCount}</p>
            </div>
          </div>
          <div className="h-12 w-px bg-border" />
          <div>
            <p className="text-sm text-muted-foreground">Total Rules</p>
            <p className="text-2xl font-bold text-foreground">{totalRulesCount}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Select value={entityFilter} onValueChange={(v) => setEntityFilter(v as any)}>
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="task">Tasks</SelectItem>
              <SelectItem value="document">Documents</SelectItem>
              <SelectItem value="stage">Stages</SelectItem>
            </SelectContent>
          </Select>
          <AddApprovalRuleDialog scope={scope} projectId={projectId} />
        </div>
      </div>

      {/* Info Banner */}
      {scope === 'global' && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <CardTitle className="text-base">Global Approval Rules</CardTitle>
                <CardDescription className="mt-1">
                  These rules apply to all projects. Project-specific rules can override or complement global rules.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>
      )}

      {scope === 'project' && currentProject && (
        <Card className="border-secondary/20 bg-secondary/5">
          <CardHeader className="pb-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-secondary mt-0.5" />
              <div>
                <CardTitle className="text-base">Project-Specific Rules</CardTitle>
                <CardDescription className="mt-1">
                  These rules apply only to {currentProject.name}. They supplement global rules.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>
      )}

      {/* Rules List */}
      {filteredRules.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Shield className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium text-foreground mb-2">No approval rules yet</p>
            <p className="text-sm text-muted-foreground mb-4">
              Create your first {scope} approval rule to automate approval workflows
            </p>
            <AddApprovalRuleDialog scope={scope} projectId={projectId} />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredRules.map((rule) => (
            <Card
              key={rule.id}
              className={`transition-all ${
                rule.enabled
                  ? 'border-l-4 border-l-primary'
                  : 'border-l-4 border-l-muted opacity-60'
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  {/* Rule Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">{getEntityIcon(rule.entityType)}</span>
                      <h3 className="text-base font-semibold text-foreground truncate">
                        {rule.name}
                      </h3>
                      <Badge
                        variant={rule.enabled ? 'default' : 'outline'}
                        className="ml-auto"
                      >
                        {rule.enabled ? 'Active' : 'Disabled'}
                      </Badge>
                    </div>

                    {rule.description && (
                      <p className="text-sm text-muted-foreground mb-3">
                        {rule.description}
                      </p>
                    )}

                    {/* Criteria */}
                    <div className="space-y-2 mb-3">
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <Badge variant="outline" className="capitalize">
                          {rule.entityType}s
                        </Badge>
                        {rule.approvalConfigs.length > 0 && (
                          <Badge variant="secondary">
                            {getApproverTypeLabel(rule)}
                          </Badge>
                        )}
                        {rule.autoApply && (
                          <Badge className="bg-success/20 text-success border-success">
                            Auto-apply
                          </Badge>
                        )}
                        {rule.approvalConfigs[0]?.required && (
                          <Badge className="bg-warning/20 text-warning border-warning">
                            Required
                          </Badge>
                        )}
                      </div>

                      <p className="text-xs text-muted-foreground">
                        {getCriteriaDescription(rule)}
                      </p>
                    </div>

                    {/* Metadata */}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>
                        Created: {new Date(rule.createdAt).toLocaleDateString()}
                      </span>
                      {rule.approvalConfigs.length > 1 && (
                        <span>
                          {rule.approvalConfigs.length}-level approval
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleRule(rule.id)}
                      title={rule.enabled ? 'Disable rule' : 'Enable rule'}
                    >
                      {rule.enabled ? (
                        <Power className="h-4 w-4 text-success" />
                      ) : (
                        <PowerOff className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteClick(rule.id)}
                      title="Delete rule"
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Approval Rule?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the approval rule. Any existing approval requests
              created by this rule will remain, but new items will no longer trigger approvals.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setRuleToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
