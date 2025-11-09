import type { TemplateTask, TemplateFile, TemplateDocument, TemplateStage, ProjectTemplate } from '@/types'

/**
 * Template Converter Utility
 *
 * Converts the residential template data format to ProjectTemplate format
 * for use in the TemplateContext and template editor UI.
 */

interface ResidentialTemplateData {
  name: string
  description: string
  projectType: string
  tasks: Record<string, any[]>
  requiredFiles: any[]
  stageDocuments: any[]
  stages?: any[]
}

/**
 * Convert residential template to ProjectTemplate format
 */
export function convertResidentialTemplate(
  templateData: ResidentialTemplateData
): Omit<ProjectTemplate, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'> {
  // Flatten tasks from nested object to array
  const flattenedTasks: TemplateTask[] = []

  Object.values(templateData.tasks).forEach((taskArray) => {
    taskArray.forEach((task) => {
      flattenedTasks.push(convertTaskToTemplateTask(task))
    })
  })

  // Convert required files
  const templateFiles: TemplateFile[] = templateData.requiredFiles.map((file) => ({
    fileName: file.fileName,
    requiredFrom: file.requiredFrom,
    status: file.status || 'pending',
    description: file.description,
  }))

  // Convert stage documents
  const templateDocuments: TemplateDocument[] = templateData.stageDocuments.map((doc) => ({
    title: doc.title,
    category: doc.category,
    stage: doc.stage,
    status: doc.status || 'pending',
    description: doc.description,
    requiredForProgression: doc.requiredForProgression,
    linkedTaskId: doc.linkedTaskId,
  }))

  // Convert stages if present
  const templateStages: TemplateStage[] | undefined = templateData.stages?.map((stage) => ({
    stage: stage.stage,
    status: stage.status,
    priority: stage.priority,
    startDate: stage.startDate,
    dueDate: stage.dueDate,
    departmentHeadRole: stage.departmentHeadRole,
    notes: stage.notes,
  }))

  return {
    name: templateData.name,
    description: templateData.description,
    projectType: templateData.projectType,
    isBuiltIn: true,
    tasks: flattenedTasks,
    requiredFiles: templateFiles,
    stageDocuments: templateDocuments,
    stages: templateStages,
    thumbnail: `https://ui-avatars.com/api/?name=${encodeURIComponent(templateData.name)}&background=3b82f6&color=fff`,
    tags: ['residential', 'interior-design', 'built-in'],
  }
}

/**
 * Convert a Task to TemplateTask format (removes IDs, timestamps, actual assignees)
 */
function convertTaskToTemplateTask(task: any): TemplateTask {
  return {
    title: task.title,
    description: task.description,
    dueDate: task.dueDate,
    status: task.status,
    priority: task.priority,
    stage: task.stage,
    checklistItems: task.checklistItems?.map((item: any) => ({
      label: item.label,
      completed: item.completed,
    })),
    subtasks: task.subtasks?.map((subtask: any) => ({
      label: subtask.label,
      description: subtask.description,
      completed: subtask.completed,
      status: subtask.status,
      priority: subtask.priority,
      dueDate: subtask.dueDate,
      attachments: subtask.attachments,
    })),
    attachments: task.attachments,
  }
}
