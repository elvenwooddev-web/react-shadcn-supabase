import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { useProjects } from '@/contexts/ProjectContext'
import { useUser } from '@/contexts/UserContext'
import { useTeam } from '@/contexts/TeamContext'
import type {
  ApprovalRequest,
  ApprovalContextType,
  ApprovalEntityType,
  ApprovalStatus,
  WorkflowStage,
  ApprovalComment,
  ApprovalHistoryEntry,
  TeamMember,
} from '@/types'
import { saveToLocalStorage, loadFromLocalStorage } from '@/lib/helpers'

const ApprovalContext = createContext<ApprovalContextType | undefined>(undefined)

export function ApprovalProvider({ children }: { children: ReactNode }) {
  const { currentProject } = useProjects()
  const { currentUser } = useUser()
  const { teamMembers } = useTeam()

  // Load approvals for current project
  const [approvalRequests, setApprovalRequests] = useState<ApprovalRequest[]>(() => {
    if (!currentProject) return []
    return loadFromLocalStorage(`approvalRequests-${currentProject.id}`, [])
  })

  // Persist to localStorage when approvals change
  useEffect(() => {
    if (currentProject) {
      saveToLocalStorage(`approvalRequests-${currentProject.id}`, approvalRequests)
    }
  }, [approvalRequests, currentProject])

  // Reload approvals when project changes
  useEffect(() => {
    if (currentProject) {
      const projectApprovals = loadFromLocalStorage<ApprovalRequest[]>(
        `approvalRequests-${currentProject.id}`,
        []
      )
      setApprovalRequests(projectApprovals)
    } else {
      setApprovalRequests([])
    }
  }, [currentProject?.id])

  // Create new approval request
  const createApprovalRequest = (
    request: Omit<ApprovalRequest, 'id' | 'createdAt' | 'updatedAt' | 'history' | 'comments' | 'remindersSent'>
  ): void => {
    const newRequest: ApprovalRequest = {
      ...request,
      id: `approval-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      comments: [],
      remindersSent: 0,
      history: [
        {
          id: `history-${Date.now()}`,
          action: 'requested',
          actor: request.requestedBy,
          timestamp: new Date(),
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    setApprovalRequests((prev) => [...prev, newRequest])
  }

  // Update approval request
  const updateApprovalRequest = (id: string, data: Partial<ApprovalRequest>): void => {
    setApprovalRequests((prev) =>
      prev.map((req) =>
        req.id === id ? { ...req, ...data, updatedAt: new Date() } : req
      )
    )
  }

  // Add history entry
  const addHistoryEntry = (requestId: string, entry: Omit<ApprovalHistoryEntry, 'id'>): void => {
    setApprovalRequests((prev) =>
      prev.map((req) => {
        if (req.id === requestId) {
          const newEntry: ApprovalHistoryEntry = {
            ...entry,
            id: `history-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          }
          return {
            ...req,
            history: [...req.history, newEntry],
            updatedAt: new Date(),
          }
        }
        return req
      })
    )
  }

  // Approve request (handle sequential chains)
  const approveRequest = (id: string, comment?: string): void => {
    const request = approvalRequests.find((req) => req.id === id)
    if (!request || !currentUser) return

    // Add comment if provided
    if (comment) {
      const newComment: ApprovalComment = {
        id: `comment-${Date.now()}`,
        author: currentUser,
        text: comment,
        createdAt: new Date(),
      }
      updateApprovalRequest(id, {
        comments: [...request.comments, newComment],
      })
    }

    // Add history entry
    addHistoryEntry(id, {
      action: 'approved',
      actor: currentUser,
      timestamp: new Date(),
      note: comment,
    })

    // Check if there are more approval levels in the chain
    const nextLevel = request.currentApprovalLevel + 1
    const hasMoreApprovers = nextLevel < request.approvalConfigs.length

    if (hasMoreApprovers) {
      // Move to next approver in chain
      const nextConfig = request.approvalConfigs[nextLevel]
      const nextApprover = assignApprover(nextConfig)

      updateApprovalRequest(id, {
        currentApprovalLevel: nextLevel,
        assignedTo: nextApprover,
        status: 'pending', // Still pending, waiting for next approver
      })

      // Add history for delegation to next approver
      addHistoryEntry(id, {
        action: 'delegated',
        actor: currentUser,
        timestamp: new Date(),
        note: `Moved to next approval level: ${nextConfig.name}`,
      })
    } else {
      // All approvers have approved - mark as fully approved
      updateApprovalRequest(id, {
        status: 'approved',
        approvedBy: currentUser,
        approvedAt: new Date(),
      })
    }
  }

  // Reject request
  const rejectRequest = (id: string, reason: string, comment?: string): void => {
    const request = approvalRequests.find((req) => req.id === id)
    if (!request || !currentUser) return

    // Add comment if provided
    if (comment) {
      const newComment: ApprovalComment = {
        id: `comment-${Date.now()}`,
        author: currentUser,
        text: comment,
        createdAt: new Date(),
      }
      updateApprovalRequest(id, {
        comments: [...request.comments, newComment],
      })
    }

    // Add history entry
    addHistoryEntry(id, {
      action: 'rejected',
      actor: currentUser,
      timestamp: new Date(),
      note: `Reason: ${reason}${comment ? ` | ${comment}` : ''}`,
    })

    // Mark as rejected (stops the approval chain)
    updateApprovalRequest(id, {
      status: 'rejected',
      rejectedBy: currentUser,
      rejectedAt: new Date(),
      rejectionReason: reason,
    })
  }

  // Delegate request to another user
  const delegateRequest = (id: string, toUserId: string): void => {
    const request = approvalRequests.find((req) => req.id === id)
    if (!request || !currentUser) return

    const delegatedUser = teamMembers.find((tm) => tm.id === toUserId)
    if (!delegatedUser) return

    // Update assigned user
    updateApprovalRequest(id, {
      assignedTo: delegatedUser,
      delegatedTo: delegatedUser,
      delegatedAt: new Date(),
      status: 'delegated',
    })

    // Add history entry
    addHistoryEntry(id, {
      action: 'delegated',
      actor: currentUser,
      timestamp: new Date(),
      note: `Delegated to ${delegatedUser.name}`,
    })
  }

  // Add comment to approval request
  const addComment = (requestId: string, text: string): void => {
    const request = approvalRequests.find((req) => req.id === requestId)
    if (!request || !currentUser) return

    const newComment: ApprovalComment = {
      id: `comment-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      author: currentUser,
      text,
      createdAt: new Date(),
    }

    updateApprovalRequest(requestId, {
      comments: [...request.comments, newComment],
    })

    addHistoryEntry(requestId, {
      action: 'commented',
      actor: currentUser,
      timestamp: new Date(),
    })
  }

  // Helper: Assign approver based on ApprovalConfig
  const assignApprover = (config: any): TeamMember => {
    // Default to first team member if assignment fails
    let approver = teamMembers[0]

    switch (config.approverType) {
      case 'department-head':
        // Find department head from config.approverRole
        approver = teamMembers.find((tm) => tm.role.includes(config.approverRole)) || teamMembers[0]
        break
      case 'project-manager':
        approver = teamMembers.find((tm) => tm.role === 'Project Manager') || teamMembers[0]
        break
      case 'admin':
        approver = teamMembers.find((tm) => tm.role === 'Admin') || teamMembers[0]
        break
      case 'specific-user':
        approver = teamMembers.find((tm) => tm.id === config.approverUserId) || teamMembers[0]
        break
      case 'client':
      case 'external':
        // For client/external, create placeholder approver
        approver = {
          id: 'client-1',
          name: 'Client',
          role: 'Client',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Client',
        }
        break
    }

    return approver
  }

  // Get pending approvals
  const getPendingApprovals = (): ApprovalRequest[] => {
    return approvalRequests.filter((req) => req.status === 'pending' || req.status === 'delegated')
  }

  // Get approvals by stage
  const getApprovalsByStage = (stage: WorkflowStage): ApprovalRequest[] => {
    return approvalRequests.filter((req) => req.stage === stage)
  }

  // Get approvals by entity
  const getApprovalsByEntity = (
    entityType: ApprovalEntityType,
    entityId: string
  ): ApprovalRequest[] => {
    return approvalRequests.filter(
      (req) => req.entityType === entityType && req.entityId === entityId
    )
  }

  // Get approvals assigned to specific user
  const getMyApprovals = (userId: string): ApprovalRequest[] => {
    return approvalRequests.filter(
      (req) =>
        (req.status === 'pending' || req.status === 'delegated') &&
        req.assignedTo.id === userId
    )
  }

  // Check if user can approve a request
  const canApprove = (requestId: string, userId: string): boolean => {
    const request = approvalRequests.find((req) => req.id === requestId)
    if (!request) return false

    // Only pending/delegated requests can be approved
    if (request.status !== 'pending' && request.status !== 'delegated') return false

    // Must be assigned to this user
    return request.assignedTo.id === userId
  }

  // Check if entity has approval configured
  const hasEntityApproval = (entityType: ApprovalEntityType, entityId: string): boolean => {
    return approvalRequests.some(
      (req) => req.entityType === entityType && req.entityId === entityId
    )
  }

  // Get approval status for entity
  const getApprovalStatus = (
    entityType: ApprovalEntityType,
    entityId: string
  ): ApprovalStatus | null => {
    const entityApprovals = getApprovalsByEntity(entityType, entityId)
    if (entityApprovals.length === 0) return null

    // If any required approval is rejected, return rejected
    if (entityApprovals.some((req) => req.status === 'rejected' && req.approvalConfigs[req.currentApprovalLevel]?.required)) {
      return 'rejected'
    }

    // If all required approvals are approved, return approved
    const requiredApprovals = entityApprovals.filter((req) =>
      req.approvalConfigs.some((config) => config.required)
    )
    if (
      requiredApprovals.length > 0 &&
      requiredApprovals.every((req) => req.status === 'approved')
    ) {
      return 'approved'
    }

    // If any are pending, return pending
    if (entityApprovals.some((req) => req.status === 'pending' || req.status === 'delegated')) {
      return 'pending'
    }

    return 'approved' // All non-required approvals done
  }

  const value: ApprovalContextType = {
    approvalRequests,
    createApprovalRequest,
    updateApprovalRequest,
    approveRequest,
    rejectRequest,
    delegateRequest,
    addComment,
    getPendingApprovals,
    getApprovalsByStage,
    getApprovalsByEntity,
    getMyApprovals,
    canApprove,
    hasEntityApproval,
    getApprovalStatus,
  }

  return <ApprovalContext.Provider value={value}>{children}</ApprovalContext.Provider>
}

export function useApprovals() {
  const context = useContext(ApprovalContext)
  if (context === undefined) {
    throw new Error('useApprovals must be used within an ApprovalProvider')
  }
  return context
}
