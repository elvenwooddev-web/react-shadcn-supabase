import { useState } from 'react'
import { Plus, Check, X, Edit, Trash2, AlertCircle } from 'lucide-react'
import { useWorkflowRules } from '@/contexts/WorkflowRulesContext'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AddRuleDialog } from '@/components/settings/AddRuleDialog'
import { DeleteConfirmDialog } from '@/components/DeleteConfirmDialog'
import type { AnyWorkflowRule } from '@/types'

interface WorkflowRulesTabProps {
  scope: 'global' | 'project'
  projectId?: string
}

export function WorkflowRulesTab({ scope, projectId }: WorkflowRulesTabProps) {
  const { rules, globalRules, projectRules, toggleRuleEnabled, deleteRule } = useWorkflowRules()
  const [showAddDialog, setShowAddDialog] = useState(false)

  const displayRules = scope === 'global' ? globalRules : projectRules

  const ruleTypeLabels: Record<string, string> = {
    'stage-transition': 'Stage Transition',
    'auto-assignment': 'Auto-Assignment',
    'approval': 'Approval Required',
    'validation': 'Validation',
  }

  const ruleTypeColors: Record<string, string> = {
    'stage-transition': 'bg-primary/20 text-primary',
    'auto-assignment': 'bg-success/20 text-success',
    'approval': 'bg-warning/20 text-warning',
    'validation': 'bg-danger/20 text-danger',
  }

  const getRulesByType = (type: string) => {
    return displayRules.filter(rule => rule.ruleType === type)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Workflow Rules</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Configure automation and validation rules for your workflow stages
          </p>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Rule
        </Button>
      </div>

      {/* Rules by Type */}
      {Object.keys(ruleTypeLabels).map((ruleType) => {
        const typeRules = getRulesByType(ruleType)

        return (
          <div key={ruleType}>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Badge className={`${ruleTypeColors[ruleType]} border-0`}>
                {ruleTypeLabels[ruleType]}
              </Badge>
              <span className="text-sm text-muted-foreground">({typeRules.length})</span>
            </h3>

            {typeRules.length === 0 ? (
              <Card className="p-6">
                <p className="text-sm text-muted-foreground text-center">
                  No {ruleTypeLabels[ruleType].toLowerCase()} rules configured
                </p>
              </Card>
            ) : (
              <div className="space-y-3">
                {typeRules.map((rule) => (
                  <Card key={rule.id} className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        {/* Enable/Disable Toggle */}
                        <button
                          onClick={() => toggleRuleEnabled(rule.id)}
                          className={`mt-1 flex items-center justify-center size-5 rounded border-2 transition-colors ${
                            rule.enabled
                              ? 'bg-success border-success'
                              : 'border-muted bg-background'
                          }`}
                        >
                          {rule.enabled && <Check className="h-3 w-3 text-white" />}
                        </button>

                        {/* Rule Info */}
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{rule.name}</h4>
                            {!rule.enabled && (
                              <Badge variant="outline" className="text-xs">Disabled</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {rule.description}
                          </p>

                          {/* Rule Details */}
                          {'applicableStages' in rule && rule.applicableStages.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {rule.applicableStages.slice(0, 3).map((stage) => (
                                <Badge key={stage} variant="outline" className="text-xs">
                                  {stage}
                                </Badge>
                              ))}
                              {rule.applicableStages.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{rule.applicableStages.length - 3} more
                                </Badge>
                              )}
                            </div>
                          )}

                          {/* Conditions Summary for Stage Transition */}
                          {rule.ruleType === 'stage-transition' && 'conditions' in rule && (
                            <div className="mt-2 space-y-1">
                              {rule.conditions.requireAllTasksComplete && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <AlertCircle className="h-3 w-3" />
                                  Requires all tasks completed
                                </div>
                              )}
                              {rule.conditions.requireAllFilesUploaded && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <AlertCircle className="h-3 w-3" />
                                  Requires all files uploaded
                                </div>
                              )}
                              {rule.conditions.requireDepartmentHeadApproval && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <AlertCircle className="h-3 w-3" />
                                  Requires department head approval
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-1">
                        <DeleteConfirmDialog
                          onConfirm={() => deleteRule(rule.id)}
                          title="Delete Rule"
                          description={`Are you sure you want to delete "${rule.name}"?`}
                        >
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-danger/10 hover:text-danger"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </DeleteConfirmDialog>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )
      })}

      {displayRules.length === 0 && (
        <Card className="p-12">
          <div className="text-center">
            <Workflow className="h-12 w-12 text-muted mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">No workflow rules configured yet</p>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Rule
            </Button>
          </div>
        </Card>
      )}

      <AddRuleDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        scope={scope}
        projectId={projectId}
      />
    </div>
  )
}
