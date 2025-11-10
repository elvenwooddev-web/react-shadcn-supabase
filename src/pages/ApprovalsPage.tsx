import { useState } from 'react'
import { Shield, CheckCircle, Clock, XCircle, TrendingUp } from 'lucide-react'
import { useApprovals } from '@/contexts/ApprovalContext'
import { useUser } from '@/contexts/UserContext'
import { useProjects } from '@/contexts/ProjectContext'
import { LeftSidebar } from '@/components/LeftSidebar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { ApprovalsList } from '@/components/ApprovalsList'

type ApprovalsView = 'all' | 'my-approvals'

export function ApprovalsPage() {
  const [view, setView] = useState<ApprovalsView>('my-approvals')
  const { approvalRequests, getPendingApprovals, getMyApprovals } = useApprovals()
  const { currentUser } = useUser()
  const { currentProject } = useProjects()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const myApprovals = currentUser ? getMyApprovals(currentUser.id) : []
  const pendingApprovals = getPendingApprovals()
  const approvedCount = approvalRequests.filter((r) => r.status === 'approved').length
  const rejectedCount = approvalRequests.filter((r) => r.status === 'rejected').length

  // Calculate average approval time (mock for now)
  const avgApprovalTime = '2.5 days'

  return (
    <div className="flex min-h-screen bg-background">
      <LeftSidebar
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      <div className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="container mx-auto max-w-6xl">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Shield className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold text-foreground">Approvals</h1>
            </div>
            <p className="text-muted-foreground">
              Manage approval requests across {currentProject ? 'this project' : 'all projects'}
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>My Pending Approvals</CardDescription>
                <CardTitle className="text-3xl">{myApprovals.length}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-warning">
                  <Clock className="h-4 w-4" />
                  Awaiting your action
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>All Pending</CardDescription>
                <CardTitle className="text-3xl">{pendingApprovals.length}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-primary">
                  <Clock className="h-4 w-4" />
                  In progress
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Approved</CardDescription>
                <CardTitle className="text-3xl">{approvedCount}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-success">
                  <CheckCircle className="h-4 w-4" />
                  Completed
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Rejected</CardDescription>
                <CardTitle className="text-3xl">{rejectedCount}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-danger">
                  <XCircle className="h-4 w-4" />
                  Needs revision
                </div>
              </CardContent>
            </Card>
          </div>

          {/* View Toggle */}
          <div className="flex items-center justify-between mb-6">
            <Tabs value={view} onValueChange={(v) => setView(v as ApprovalsView)}>
              <TabsList>
                <TabsTrigger value="my-approvals" className="gap-2">
                  My Approvals
                  {myApprovals.length > 0 && (
                    <Badge variant="default" className="ml-1 px-1.5 h-5 text-xs">
                      {myApprovals.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="all">
                  All Approvals
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Avg Approval Time */}
            <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              <span>Avg. approval time: <span className="font-medium text-foreground">{avgApprovalTime}</span></span>
            </div>
          </div>

          {/* Approvals List */}
          <ApprovalsList showMyApprovals={view === 'my-approvals'} />
        </div>
      </div>
    </div>
  )
}
