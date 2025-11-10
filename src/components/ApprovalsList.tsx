import { useState } from 'react'
import { Filter, Shield } from 'lucide-react'
import { useApprovals } from '@/contexts/ApprovalContext'
import { useUser } from '@/contexts/UserContext'
import type { ApprovalEntityType, ApprovalStatus, WorkflowStage } from '@/types'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ApprovalRequestCard } from '@/components/ApprovalRequestCard'

interface ApprovalsListProps {
  filterByStage?: WorkflowStage
  showMyApprovals?: boolean
  compact?: boolean
}

export function ApprovalsList({ filterByStage, showMyApprovals = false, compact = false }: ApprovalsListProps) {
  const { approvalRequests, getApprovalsByStage, getMyApprovals, getPendingApprovals } = useApprovals()
  const { currentUser } = useUser()
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')
  const [entityTypeFilter, setEntityTypeFilter] = useState<ApprovalEntityType | 'all'>('all')

  // Get base list
  let filteredApprovals = filterByStage
    ? getApprovalsByStage(filterByStage)
    : showMyApprovals && currentUser
    ? getMyApprovals(currentUser.id)
    : approvalRequests

  // Filter by status tab
  if (activeTab !== 'all') {
    filteredApprovals = filteredApprovals.filter((req) => req.status === activeTab)
  }

  // Filter by entity type
  if (entityTypeFilter !== 'all') {
    filteredApprovals = filteredApprovals.filter((req) => req.entityType === entityTypeFilter)
  }

  // Group by stage for better organization
  const groupedByStage = filteredApprovals.reduce((acc, req) => {
    if (!acc[req.stage]) {
      acc[req.stage] = []
    }
    acc[req.stage].push(req)
    return acc
  }, {} as Record<WorkflowStage, typeof filteredApprovals>)

  const stages = Object.keys(groupedByStage) as WorkflowStage[]

  const counts = {
    all: approvalRequests.length,
    pending: approvalRequests.filter((r) => r.status === 'pending' || r.status === 'delegated').length,
    approved: approvalRequests.filter((r) => r.status === 'approved').length,
    rejected: approvalRequests.filter((r) => r.status === 'rejected').length,
  }

  return (
    <div className="space-y-4">
      {/* Tabs for Status Filter */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <TabsList>
            <TabsTrigger value="all" className="gap-2">
              All
              {counts.all > 0 && (
                <span className="ml-1 text-xs bg-muted px-1.5 rounded">{counts.all}</span>
              )}
            </TabsTrigger>
            <TabsTrigger value="pending" className="gap-2">
              Pending
              {counts.pending > 0 && (
                <span className="ml-1 text-xs bg-warning/20 text-warning px-1.5 rounded">{counts.pending}</span>
              )}
            </TabsTrigger>
            <TabsTrigger value="approved" className="gap-2">
              Approved
              {counts.approved > 0 && (
                <span className="ml-1 text-xs bg-success/20 text-success px-1.5 rounded">{counts.approved}</span>
              )}
            </TabsTrigger>
            <TabsTrigger value="rejected" className="gap-2">
              Rejected
              {counts.rejected > 0 && (
                <span className="ml-1 text-xs bg-danger/20 text-danger px-1.5 rounded">{counts.rejected}</span>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Entity Type Filter */}
          <select
            value={entityTypeFilter}
            onChange={(e) => setEntityTypeFilter(e.target.value as ApprovalEntityType | 'all')}
            className="h-9 px-3 rounded-md border border-input bg-background text-sm"
          >
            <option value="all">All Types</option>
            <option value="task">Tasks</option>
            <option value="document">Documents</option>
            <option value="stage">Stages</option>
          </select>
        </div>

        {/* Empty State */}
        {filteredApprovals.length === 0 && (
          <Card className="mt-4">
            <CardContent className="py-12 text-center">
              <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No Approvals Found</h3>
              <p className="text-sm text-muted-foreground">
                {activeTab === 'all'
                  ? 'No approval requests configured yet'
                  : `No ${activeTab} approvals`}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Approval Cards Grouped by Stage */}
        {filteredApprovals.length > 0 && (
          <div className="space-y-6 mt-4">
            {stages.map((stage) => (
              <div key={stage} className="space-y-3">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-sm text-muted-foreground">{stage}</h3>
                  <div className="h-px flex-1 bg-border" />
                  <span className="text-xs text-muted-foreground">
                    {groupedByStage[stage].length} approval{groupedByStage[stage].length !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {groupedByStage[stage].map((request) => (
                    <ApprovalRequestCard
                      key={request.id}
                      request={request}
                      showActions={!compact}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </Tabs>
    </div>
  )
}
