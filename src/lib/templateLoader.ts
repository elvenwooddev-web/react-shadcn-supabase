import type { Task, RequiredFile, StageDocument, TeamMember, TemplateStage, TemplateApproval, ApprovalRequest } from '@/types'
import { generateId } from '@/lib/helpers'
import { residentialTemplate } from '@/data/templates/residentialTemplate'

/**
 * Template Loading System
 *
 * This module provides functionality to initialize new projects with pre-defined template data.
 * It loads tasks, files, documents, stage configuration, and approval workflows from template definitions.
 */

export interface TemplateData {
  tasks: Task[]
  files: RequiredFile[]
  documents: StageDocument[]
  stages?: TemplateStage[]
  approvals?: ApprovalRequest[]
}

/**
 * Load a template and prepare it for a new project
 *
 * @param templateType - The type of template to load (currently only 'residential')
 * @param projectId - The ID of the project to load the template for
 * @param teamMembers - Array of team members to assign tasks to
 * @returns Object containing tasks, files, and documents with new IDs
 */
export function loadTemplate(
  templateType: 'residential',
  projectId: string,
  teamMembers: TeamMember[]
): TemplateData {
  // Use residential template
  const template = residentialTemplate

  // Generate tasks with new IDs and assign team members
  const tasks = generateTasksFromTemplate(template.tasks, teamMembers)

  // Generate files with new IDs
  const files = generateFilesFromTemplate(template.requiredFiles)

  // Generate documents with new IDs
  const documents = generateDocumentsFromTemplate(template.stageDocuments)

  // Get stage configuration from template (if available)
  const stages = template.stages

  // Generate approval requests from template (if available)
  const approvals = template.approvals
    ? generateApprovalsFromTemplate(template.approvals, projectId, tasks, documents, teamMembers)
    : []

  return {
    tasks,
    files,
    documents,
    stages,
    approvals,
  }
}

/**
 * Generate tasks from template with new IDs and team member assignments
 */
function generateTasksFromTemplate(
  templateTasks: any,
  teamMembers: TeamMember[]
): Task[] {
  const tasks: Task[] = []

  // Handle both object format (residential) and array format (retail)
  const taskArrays: any[] = Array.isArray(templateTasks)
    ? [templateTasks]
    : Object.values(templateTasks)

  for (const taskArray of taskArrays) {
    if (!Array.isArray(taskArray)) continue

    for (const templateTask of taskArray) {
      // Leave tasks unassigned - project manager will assign them manually
      const task: Task = {
        id: generateId(),
        trackingId: `T-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        title: templateTask.title,
        description: templateTask.description,
        dueDate: templateTask.dueDate,
        assignee: undefined, // Tasks start unassigned
        status: templateTask.status || 'todo',
        priority: templateTask.priority || 'medium',
        stage: templateTask.stage,
        checklistItems: templateTask.checklistItems?.map((item: any) => ({
          ...item,
          id: generateId(),
        })),
        subtasks: templateTask.subtasks?.map((subtask: any) => ({
          ...subtask,
          id: generateId(),
          trackingId: `ST-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          assigneeId: undefined, // Subtasks also unassigned
          avatar: undefined,
          status: subtask.status || 'todo',
          priority: subtask.priority || 'medium',
          createdAt: new Date(),
          updatedAt: new Date(),
        })),
        attachments: templateTask.attachments?.map((attachment: any) => ({
          ...attachment,
          id: generateId(),
        })),
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      tasks.push(task)
    }
  }

  return tasks
}

/**
 * Generate files from template with new IDs
 */
function generateFilesFromTemplate(
  templateFiles: Omit<RequiredFile, 'id'>[]
): RequiredFile[] {
  return templateFiles.map((file) => ({
    ...file,
    id: generateId(),
  }))
}

/**
 * Generate documents from template with new IDs
 */
function generateDocumentsFromTemplate(
  templateDocuments: Omit<StageDocument, 'id'>[]
): StageDocument[] {
  return templateDocuments.map((doc) => ({
    ...doc,
    id: generateId(),
  }))
}

/**
 * Assign a team member to a task based on the workflow stage
 * This tries to match team members by role/department to appropriate stages
 */
function assignTeamMemberToTask(
  stage: string,
  teamMembers: TeamMember[]
): TeamMember {
  // Default to first team member if no match found
  if (teamMembers.length === 0) {
    throw new Error('No team members available for task assignment')
  }

  // Try to find a team member whose role matches the stage
  const roleMatches: Record<string, string[]> = {
    'Sales': ['sales', 'manager'],
    'Design': ['designer', 'design'],
    'Technical Design': ['technical', 'designer'],
    'Procurement': ['procurement', 'manager'],
    'Production': ['production', 'coordinator'],
    'Execution': ['supervisor', 'execution', 'coordinator'],
    'Post Installation': ['supervisor', 'execution', 'manager'],
  }

  const keywords = roleMatches[stage] || []

  for (const keyword of keywords) {
    const match = teamMembers.find((member) =>
      member.role.toLowerCase().includes(keyword)
    )
    if (match) {
      return match
    }
  }

  // If no match found, return the first team member
  return teamMembers[0]
}

/**
 * Generate approval requests from template approvals
 */
function generateApprovalsFromTemplate(
  templateApprovals: TemplateApproval[],
  projectId: string,
  tasks: Task[],
  documents: StageDocument[],
  teamMembers: TeamMember[]
): ApprovalRequest[] {
  const approvalRequests: ApprovalRequest[] = []

  for (const templateApproval of templateApprovals) {
    let entityId: string | undefined
    let entityName: string | undefined

    // Map entity identifier to actual entity ID
    if (templateApproval.entityType === 'task') {
      const matchedTask = tasks.find((t) => t.title === templateApproval.entityIdentifier)
      if (matchedTask) {
        entityId = matchedTask.id
        entityName = matchedTask.title
      }
    } else if (templateApproval.entityType === 'document') {
      const matchedDoc = documents.find((d) => d.title === templateApproval.entityIdentifier)
      if (matchedDoc) {
        entityId = matchedDoc.id
        entityName = matchedDoc.title
      }
    } else if (templateApproval.entityType === 'stage') {
      // For stages, use the stage name as the entity ID
      entityId = templateApproval.entityIdentifier
      entityName = templateApproval.entityIdentifier
    }

    // Skip if entity not found
    if (!entityId || !entityName) continue

    // Get first approval config to assign initial approver
    const firstConfig = templateApproval.approvalConfigs[0]
    const initialApprover = assignApprover(firstConfig, teamMembers)

    // Create approval request
    const approvalRequest: ApprovalRequest = {
      id: generateId(),
      projectId,
      source: 'template', // Mark as template-based approval
      templateApprovalId: templateApproval.id,
      entityType: templateApproval.entityType,
      entityId,
      entityName,
      stage: templateApproval.stage,
      status: 'pending',
      currentApprovalLevel: 0,
      approvalConfigs: templateApproval.approvalConfigs,
      requestedBy: teamMembers[0], // First team member as requester
      requestedAt: new Date(),
      assignedTo: initialApprover,
      comments: [],
      remindersSent: 0,
      history: [
        {
          id: generateId(),
          action: 'requested',
          actor: teamMembers[0],
          timestamp: new Date(),
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    // Set expiry date if configured
    if (firstConfig.expiryDays) {
      const expiryDate = new Date()
      expiryDate.setDate(expiryDate.getDate() + firstConfig.expiryDays)
      approvalRequest.expiresAt = expiryDate
    }

    approvalRequests.push(approvalRequest)
  }

  return approvalRequests
}

/**
 * Assign approver based on ApprovalConfig
 */
function assignApprover(config: any, teamMembers: TeamMember[]): TeamMember {
  // Default to first team member if assignment fails
  let approver = teamMembers[0]

  switch (config.approverType) {
    case 'department-head':
      // Find team member matching department role
      approver = teamMembers.find((tm) =>
        tm.role.toLowerCase().includes(config.approverRole?.toLowerCase() || '')
      ) || teamMembers[0]
      break
    case 'project-manager':
      approver = teamMembers.find((tm) =>
        tm.role.toLowerCase().includes('manager')
      ) || teamMembers[0]
      break
    case 'admin':
      approver = teamMembers.find((tm) =>
        tm.role.toLowerCase().includes('admin')
      ) || teamMembers[0]
      break
    case 'specific-user':
      approver = teamMembers.find((tm) => tm.id === config.approverUserId) || teamMembers[0]
      break
    case 'client':
    case 'external':
      // Create placeholder for client/external approvers
      approver = {
        id: `${config.approverType}-${Date.now()}`,
        name: config.approverType === 'client' ? 'Client' : 'External Consultant',
        role: config.approverType === 'client' ? 'Client' : 'External Consultant',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${config.approverType}`,
      }
      break
  }

  return approver
}

/**
 * Get template metadata
 */
export function getTemplateInfo(templateType: 'residential') {
  const template = residentialTemplate

  return {
    name: template.name,
    description: template.description,
    projectType: template.projectType,
  }
}
