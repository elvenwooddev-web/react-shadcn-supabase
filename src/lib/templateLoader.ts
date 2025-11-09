import type { Task, RequiredFile, StageDocument, TeamMember, TemplateStage } from '@/types'
import { generateId } from '@/lib/helpers'
import { residentialTemplate } from '@/data/templates/residentialTemplate'

/**
 * Template Loading System
 *
 * This module provides functionality to initialize new projects with pre-defined template data.
 * It loads tasks, files, documents, and stage configuration from template definitions.
 */

export interface TemplateData {
  tasks: Task[]
  files: RequiredFile[]
  documents: StageDocument[]
  stages?: TemplateStage[]
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
  _projectId: string,
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

  return {
    tasks,
    files,
    documents,
    stages,
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
      // Assign a team member based on the stage
      const assignee = assignTeamMemberToTask(templateTask.stage, teamMembers)

      const task: Task = {
        id: generateId(),
        title: templateTask.title,
        description: templateTask.description,
        dueDate: templateTask.dueDate,
        assignee,
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
          assigneeId: assignee.id,
          avatar: assignee.avatar,
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
