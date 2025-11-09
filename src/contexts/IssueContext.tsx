import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { Issue, IssueContextType, CreateIssueForm, IssueComment } from '@/types'
import { generateId, saveToLocalStorage, loadFromLocalStorage } from '@/lib/helpers'
import { useProjects } from './ProjectContext'
import { useUser } from './UserContext'
import { useTeam } from './TeamContext'

const IssueContext = createContext<IssueContextType | undefined>(undefined)

export function IssueProvider({ children }: { children: ReactNode }) {
  const { currentProject, projects, getNextIssueTrackingId } = useProjects()
  const { canAccessStage, currentUser } = useUser()
  const { teamMembers } = useTeam()

  const [allIssues, setAllIssues] = useState<Record<string, Issue[]>>(() => {
    const loaded = loadFromLocalStorage('issues', {})
    return loaded
  })

  // Filter issues for current project based on department permissions
  const currentProjectIssues = currentProject ? allIssues[currentProject.id] || [] : []
  const issues = currentProjectIssues.filter((issue) => canAccessStage(issue.stage))

  // Get all issues from all projects (for global issues page)
  const allProjectIssues = projects.flatMap((project) => {
    const projectIssues = allIssues[project.id] || []
    return projectIssues.filter((issue) => canAccessStage(issue.stage))
  })

  useEffect(() => {
    saveToLocalStorage('issues', allIssues)
  }, [allIssues])

  const createIssue = (data: CreateIssueForm) => {
    if (!currentProject || !currentUser) return

    const assignedTo = data.assignedToId
      ? teamMembers.find((tm) => tm.id === data.assignedToId)
      : undefined

    const reportedBy = {
      id: currentUser.id,
      name: currentUser.name,
      role: currentUser.role,
      avatar: currentUser.avatar,
    }

    const newIssue: Issue = {
      id: generateId(),
      trackingId: getNextIssueTrackingId(),
      projectId: currentProject.id,
      projectCode: currentProject.projectCode,
      title: data.title,
      description: data.description,
      severity: data.severity,
      status: 'open',
      sourceType: data.sourceType,
      sourceId: data.sourceId,
      sourceTrackingId: data.sourceTrackingId,
      subtaskId: data.subtaskId,
      subtaskTrackingId: data.subtaskTrackingId,
      stage: currentProject.currentStage,
      reportedBy,
      assignedTo,
      attachments: [],
      comments: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    setAllIssues((prev) => ({
      ...prev,
      [currentProject.id]: [...(prev[currentProject.id] || []), newIssue],
    }))
  }

  const updateIssue = (id: string, data: Partial<Issue>) => {
    if (!currentProject) return

    setAllIssues((prev) => ({
      ...prev,
      [currentProject.id]: prev[currentProject.id]?.map((issue) =>
        issue.id === id ? { ...issue, ...data, updatedAt: new Date() } : issue
      ) || [],
    }))
  }

  const deleteIssue = (id: string) => {
    if (!currentProject) return

    setAllIssues((prev) => ({
      ...prev,
      [currentProject.id]: prev[currentProject.id]?.filter((issue) => issue.id !== id) || [],
    }))
  }

  const resolveIssue = (id: string, note?: string) => {
    if (!currentProject || !currentUser) return

    const resolvedBy = {
      id: currentUser.id,
      name: currentUser.name,
      role: currentUser.role,
      avatar: currentUser.avatar,
    }

    setAllIssues((prev) => ({
      ...prev,
      [currentProject.id]: prev[currentProject.id]?.map((issue) =>
        issue.id === id
          ? {
              ...issue,
              status: 'resolved',
              resolvedAt: new Date(),
              resolvedBy,
              resolutionNote: note,
              updatedAt: new Date(),
            }
          : issue
      ) || [],
    }))
  }

  const reopenIssue = (id: string) => {
    if (!currentProject) return

    setAllIssues((prev) => ({
      ...prev,
      [currentProject.id]: prev[currentProject.id]?.map((issue) =>
        issue.id === id
          ? {
              ...issue,
              status: 'open',
              resolvedAt: undefined,
              resolvedBy: undefined,
              resolutionNote: undefined,
              updatedAt: new Date(),
            }
          : issue
      ) || [],
    }))
  }

  const addComment = (issueId: string, text: string) => {
    if (!currentProject || !currentUser) return

    const author = {
      id: currentUser.id,
      name: currentUser.name,
      role: currentUser.role,
      avatar: currentUser.avatar,
    }

    const newComment: IssueComment = {
      id: generateId(),
      text,
      author,
      createdAt: new Date(),
    }

    setAllIssues((prev) => ({
      ...prev,
      [currentProject.id]: prev[currentProject.id]?.map((issue) =>
        issue.id === issueId
          ? {
              ...issue,
              comments: [...(issue.comments || []), newComment],
              updatedAt: new Date(),
            }
          : issue
      ) || [],
    }))
  }

  const deleteComment = (issueId: string, commentId: string) => {
    if (!currentProject) return

    setAllIssues((prev) => ({
      ...prev,
      [currentProject.id]: prev[currentProject.id]?.map((issue) =>
        issue.id === issueId
          ? {
              ...issue,
              comments: issue.comments?.filter((comment) => comment.id !== commentId),
              updatedAt: new Date(),
            }
          : issue
      ) || [],
    }))
  }

  const getIssuesForTask = (taskId: string): Issue[] => {
    return issues.filter((issue) => issue.sourceId === taskId && issue.sourceType === 'task')
  }

  const getIssuesForSubtask = (taskId: string, subtaskId: string): Issue[] => {
    return issues.filter(
      (issue) =>
        issue.sourceId === taskId &&
        issue.subtaskId === subtaskId &&
        issue.sourceType === 'subtask'
    )
  }

  const getOpenIssuesCount = (): number => {
    return issues.filter((issue) => issue.status === 'open' || issue.status === 'in-progress').length
  }

  const getCriticalIssuesCount = (): number => {
    return issues.filter(
      (issue) =>
        issue.severity === 'critical' &&
        (issue.status === 'open' || issue.status === 'in-progress')
    ).length
  }

  return (
    <IssueContext.Provider
      value={{
        issues,
        allIssues: allProjectIssues,
        createIssue,
        updateIssue,
        deleteIssue,
        resolveIssue,
        reopenIssue,
        addComment,
        deleteComment,
        getIssuesForTask,
        getIssuesForSubtask,
        getOpenIssuesCount,
        getCriticalIssuesCount,
      }}
    >
      {children}
    </IssueContext.Provider>
  )
}

export function useIssues() {
  const context = useContext(IssueContext)
  if (context === undefined) {
    throw new Error('useIssues must be used within an IssueProvider')
  }
  return context
}
