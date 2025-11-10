import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Shield, CheckCircle2, Activity, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LeftSidebar } from '@/components/LeftSidebar'
import { ApprovalRulesTab } from '@/components/settings/ApprovalRulesTab'
import { useProjects } from '@/contexts/ProjectContext'
import { useApprovalRules } from '@/contexts/ApprovalRuleContext'
import { useApprovals } from '@/contexts/ApprovalContext'

type ApprovalSettingsTab = 'rules' | 'stats' | 'help'

export function ApprovalsSettingsPage() {
  const { projectId } = useParams<{ projectId?: string }>()
  const navigate = useNavigate()
  const { currentProject } = useProjects()
  const { getGlobalRules, getProjectRules, getActiveRules } = useApprovalRules()
  const { approvalRequests } = useApprovals()
  const [activeTab, setActiveTab] = useState<ApprovalSettingsTab>('rules')

  const isProjectSettings = !!projectId
  const scope = isProjectSettings ? 'project' : 'global'

  // Stats
  const scopedRules = isProjectSettings && projectId
    ? getProjectRules(projectId)
    : getGlobalRules()

  const activeRules = isProjectSettings && projectId
    ? getActiveRules('project', projectId)
    : getActiveRules('global')

  const totalRules = scopedRules.length
  const activeRulesCount = activeRules.length
  const disabledRulesCount = totalRules - activeRulesCount

  // Count approval requests created by rules
  const ruleBasedApprovals = approvalRequests.filter(
    (req) => req.source === 'global-rule' || req.source === 'project-rule'
  )
  const ruleApprovalsCount = isProjectSettings && projectId
    ? ruleBasedApprovals.filter((req) => req.projectId === projectId).length
    : ruleBasedApprovals.length

  const handleBack = () => {
    if (isProjectSettings && projectId) {
      navigate(`/projects/${projectId}/workflow`)
    } else {
      navigate('/')
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      {!isProjectSettings && <LeftSidebar />}

      <div className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="container mx-auto max-w-6xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <Button
                variant="ghost"
                onClick={handleBack}
                className="mb-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to {isProjectSettings ? 'Project' : 'Home'}
              </Button>
              <div className="flex items-center gap-3 mb-2">
                <Shield className="h-8 w-8 text-primary" />
                <h1 className="text-3xl font-bold text-foreground">
                  {isProjectSettings ? `${currentProject?.name} - ` : ''}Approval Settings
                </h1>
              </div>
              <p className="text-muted-foreground">
                {isProjectSettings
                  ? 'Configure approval rules and workflows for this project'
                  : 'Manage global approval rules that apply across all projects'
                }
              </p>
            </div>
            <Badge variant={isProjectSettings ? 'default' : 'secondary'} className="h-fit">
              {isProjectSettings ? 'Project Scope' : 'Global Scope'}
            </Badge>
          </div>

          {/* Quick Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Total Rules
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-foreground">{totalRules}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  Active Rules
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-success">{activeRulesCount}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-warning" />
                  Disabled Rules
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-muted-foreground">{disabledRulesCount}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Applied Approvals
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-primary">{ruleApprovalsCount}</p>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as ApprovalSettingsTab)}>
            <TabsList className="mb-6">
              <TabsTrigger value="rules" className="gap-2">
                <Shield className="h-4 w-4" />
                Approval Rules
              </TabsTrigger>
              <TabsTrigger value="stats" className="gap-2">
                <Activity className="h-4 w-4" />
                Statistics
              </TabsTrigger>
              <TabsTrigger value="help" className="gap-2">
                <BookOpen className="h-4 w-4" />
                Documentation
              </TabsTrigger>
            </TabsList>

            {/* Rules Tab */}
            <TabsContent value="rules">
              <ApprovalRulesTab scope={scope} projectId={projectId} />
            </TabsContent>

            {/* Stats Tab */}
            <TabsContent value="stats">
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Rule Distribution</CardTitle>
                    <CardDescription>
                      Breakdown of approval rules by entity type
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {['task', 'document', 'stage'].map((entityType) => {
                        const count = scopedRules.filter((r) => r.entityType === entityType).length
                        const activeCount = activeRules.filter((r) => r.entityType === entityType).length
                        const percentage = totalRules > 0 ? Math.round((count / totalRules) * 100) : 0

                        return (
                          <div key={entityType} className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                              <span className="capitalize font-medium">{entityType}s</span>
                              <span className="text-muted-foreground">
                                {activeCount} active / {count} total ({percentage}%)
                              </span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary rounded-full transition-all"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Rule Effectiveness</CardTitle>
                    <CardDescription>
                      How many approvals have been created from rules
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <p className="text-5xl font-bold text-primary mb-2">
                        {ruleApprovalsCount}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Total approvals created by {scope} rules
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {isProjectSettings && (
                  <Card className="border-primary/20 bg-primary/5">
                    <CardHeader>
                      <CardTitle className="text-base">Combined Rules</CardTitle>
                      <CardDescription>
                        This project is affected by both global and project-specific rules
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-around">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-foreground">
                            {getGlobalRules().length}
                          </p>
                          <p className="text-xs text-muted-foreground">Global Rules</p>
                        </div>
                        <div className="h-12 w-px bg-border" />
                        <div className="text-center">
                          <p className="text-2xl font-bold text-foreground">
                            {totalRules}
                          </p>
                          <p className="text-xs text-muted-foreground">Project Rules</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* Help/Documentation Tab */}
            <TabsContent value="help">
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>About Approval Rules</CardTitle>
                    <CardDescription>
                      Automate approval workflows with intelligent rule-based approvals
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2">What are Approval Rules?</h3>
                      <p className="text-sm text-muted-foreground">
                        Approval rules automatically create approval requests when certain conditions are met.
                        This eliminates manual approval creation and ensures consistent governance across your projects.
                      </p>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2">How do they work?</h3>
                      <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                        <li>Define matching criteria (stages, priority, categories, etc.)</li>
                        <li>Configure who should approve (department head, specific user, etc.)</li>
                        <li>Enable auto-apply to automatically create approvals</li>
                        <li>Rules evaluate new items and create approval requests</li>
                        <li>Approvers receive notifications and can approve/reject</li>
                      </ol>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2">Rule Scope</h3>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <p>
                          <strong className="text-foreground">Global Rules:</strong> Apply to all projects.
                          Perfect for company-wide policies and standards.
                        </p>
                        <p>
                          <strong className="text-foreground">Project Rules:</strong> Apply to specific projects only.
                          Use these for project-specific approval requirements.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Best Practices</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                        <span>Start with global rules for common approval patterns</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                        <span>Use specific matching criteria to avoid over-triggering</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                        <span>Enable auto-reminders to keep approvals moving</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                        <span>Mark critical approvals as "required" to block progression</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                        <span>Review disabled rules periodically and remove unused ones</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border-primary/20 bg-primary/5">
                  <CardHeader>
                    <CardTitle className="text-base">Need Help?</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    <p>
                      For more detailed documentation on approval rules, multi-level approvals,
                      and advanced configurations, check out the help center or contact support.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
