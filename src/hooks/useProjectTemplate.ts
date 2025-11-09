import { useCallback } from 'react'
import type { Project } from '@/types'
import { loadTemplate } from '@/lib/templateLoader'
import { saveToLocalStorage, loadFromLocalStorage } from '@/lib/helpers'

/**
 * Hook to initialize a project with template data
 * This hook coordinates between multiple contexts to load template tasks, files, and documents
 */
export function useProjectTemplate() {
  const initializeProjectTemplate = useCallback(
    (project: Project, templateType: 'residential' | 'retail') => {
      // Load the template data
      const templateData = loadTemplate(templateType, project.id, project.teamMembers)

      // Load existing data from localStorage
      const existingTasks: Record<string, any> = loadFromLocalStorage('tasks', {})
      const existingFiles: Record<string, any> = loadFromLocalStorage('files', {})
      const existingDocuments: Record<string, any> = loadFromLocalStorage('documents', {})

      // Add template data to the project
      existingTasks[project.id] = templateData.tasks
      existingFiles[project.id] = templateData.files
      existingDocuments[project.id] = templateData.documents

      // Save back to localStorage
      saveToLocalStorage('tasks', existingTasks)
      saveToLocalStorage('files', existingFiles)
      saveToLocalStorage('documents', existingDocuments)

      return templateData
    },
    []
  )

  return { initializeProjectTemplate }
}
