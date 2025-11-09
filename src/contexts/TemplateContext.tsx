import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { ProjectTemplate, TemplateContextType, CreateTemplateForm, TemplateTask, TemplateFile, TemplateDocument } from '@/types'
import { generateId, saveToLocalStorage, loadFromLocalStorage } from '@/lib/helpers'
import { residentialTemplate } from '@/data/templates/residentialTemplate'
import { convertResidentialTemplate } from '@/lib/templateConverter'

// Built-in templates (populated with actual data from template files)
const residentialTemplateData = convertResidentialTemplate(residentialTemplate)

const builtInTemplates: ProjectTemplate[] = [
  {
    id: 'template-residential',
    ...residentialTemplateData,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    usageCount: 0,
  },
]

const TemplateContext = createContext<TemplateContextType | undefined>(undefined)

export function TemplateProvider({ children }: { children: ReactNode }) {
  const [templates, setTemplates] = useState<ProjectTemplate[]>(() => {
    const saved = loadFromLocalStorage<ProjectTemplate[]>('projectTemplates', [])

    // Merge built-in templates with saved custom templates
    const builtInIds = builtInTemplates.map(t => t.id)
    const customTemplates = saved.filter(t => !builtInIds.includes(t.id))

    return [...builtInTemplates, ...customTemplates]
  })

  useEffect(() => {
    // Only save custom templates (not built-in)
    const customTemplates = templates.filter(t => !t.isBuiltIn)
    saveToLocalStorage('projectTemplates', customTemplates)
  }, [templates])

  const createTemplate = (data: CreateTemplateForm): string => {
    const newTemplate: ProjectTemplate = {
      id: generateId(),
      name: data.name,
      description: data.description,
      projectType: data.projectType,
      isBuiltIn: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      tasks: [],
      requiredFiles: [],
      stageDocuments: [],
      usageCount: 0,
    }

    setTemplates(prev => [...prev, newTemplate])
    return newTemplate.id
  }

  const updateTemplate = (id: string, data: Partial<ProjectTemplate>) => {
    setTemplates(prev => prev.map(template =>
      template.id === id && !template.isBuiltIn
        ? { ...template, ...data, updatedAt: new Date() }
        : template
    ))
  }

  const deleteTemplate = (id: string) => {
    setTemplates(prev => prev.filter(template =>
      template.id !== id || template.isBuiltIn
    ))
  }

  const duplicateTemplate = (id: string, newName: string) => {
    const template = templates.find(t => t.id === id)
    if (!template) return

    const newTemplate: ProjectTemplate = {
      ...template,
      id: generateId(),
      name: newName,
      isBuiltIn: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      usageCount: 0,
    }

    setTemplates(prev => [...prev, newTemplate])
  }

  const getTemplate = (id: string): ProjectTemplate | undefined => {
    return templates.find(t => t.id === id)
  }

  const addTaskToTemplate = (templateId: string, task: TemplateTask) => {
    setTemplates(prev => prev.map(template =>
      template.id === templateId && !template.isBuiltIn
        ? { ...template, tasks: [...template.tasks, task], updatedAt: new Date() }
        : template
    ))
  }

  const updateTemplateTask = (templateId: string, taskIndex: number, data: Partial<TemplateTask>) => {
    setTemplates(prev => prev.map(template =>
      template.id === templateId && !template.isBuiltIn
        ? {
            ...template,
            tasks: template.tasks.map((task, idx) =>
              idx === taskIndex ? { ...task, ...data } : task
            ),
            updatedAt: new Date()
          }
        : template
    ))
  }

  const deleteTemplateTask = (templateId: string, taskIndex: number) => {
    setTemplates(prev => prev.map(template =>
      template.id === templateId && !template.isBuiltIn
        ? {
            ...template,
            tasks: template.tasks.filter((_, idx) => idx !== taskIndex),
            updatedAt: new Date()
          }
        : template
    ))
  }

  const addFileToTemplate = (templateId: string, file: TemplateFile) => {
    setTemplates(prev => prev.map(template =>
      template.id === templateId && !template.isBuiltIn
        ? { ...template, requiredFiles: [...template.requiredFiles, file], updatedAt: new Date() }
        : template
    ))
  }

  const deleteTemplateFile = (templateId: string, fileIndex: number) => {
    setTemplates(prev => prev.map(template =>
      template.id === templateId && !template.isBuiltIn
        ? {
            ...template,
            requiredFiles: template.requiredFiles.filter((_, idx) => idx !== fileIndex),
            updatedAt: new Date()
          }
        : template
    ))
  }

  const addDocumentToTemplate = (templateId: string, doc: TemplateDocument) => {
    setTemplates(prev => prev.map(template =>
      template.id === templateId && !template.isBuiltIn
        ? { ...template, stageDocuments: [...template.stageDocuments, doc], updatedAt: new Date() }
        : template
    ))
  }

  const deleteTemplateDocument = (templateId: string, docIndex: number) => {
    setTemplates(prev => prev.map(template =>
      template.id === templateId && !template.isBuiltIn
        ? {
            ...template,
            stageDocuments: template.stageDocuments.filter((_, idx) => idx !== docIndex),
            updatedAt: new Date()
          }
        : template
    ))
  }

  const updateTemplateStage = (templateId: string, stageIndex: number, data: Partial<TemplateStage>) => {
    setTemplates(prev => prev.map(template =>
      template.id === templateId && !template.isBuiltIn
        ? {
            ...template,
            stages: template.stages?.map((stage, idx) =>
              idx === stageIndex ? { ...stage, ...data } : stage
            ),
            updatedAt: new Date()
          }
        : template
    ))
  }

  return (
    <TemplateContext.Provider
      value={{
        templates,
        createTemplate,
        updateTemplate,
        deleteTemplate,
        duplicateTemplate,
        getTemplate,
        addTaskToTemplate,
        updateTemplateTask,
        deleteTemplateTask,
        addFileToTemplate,
        deleteTemplateFile,
        addDocumentToTemplate,
        deleteTemplateDocument,
        updateTemplateStage,
      }}
    >
      {children}
    </TemplateContext.Provider>
  )
}

export function useTemplates() {
  const context = useContext(TemplateContext)
  if (context === undefined) {
    throw new Error('useTemplates must be used within a TemplateProvider')
  }
  return context
}
