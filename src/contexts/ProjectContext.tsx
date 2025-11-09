import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { Project, ProjectContextType, CreateProjectForm, TeamMember, ProjectStage, WorkflowStage } from '@/types'
import { STAGE_TO_DEPARTMENT } from '@/types'
import { generateId, saveToLocalStorage, loadFromLocalStorage } from '@/lib/helpers'
import { loadTemplate } from '@/lib/templateLoader'

const WORKFLOW_STAGES: WorkflowStage[] = [
  'Sales',
  'Design',
  'Technical Design',
  'Procurement',
  'Production',
  'Execution',
  'Post Installation',
]

// Sample data for initial project
const sampleTeamMembers: TeamMember[] = [
  {
    id: 'tm1',
    name: 'Anna Kendrick',
    role: 'Designer',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCoGw7tAQeOx48j_5f1hTWtyDe34JzGEVYQFE6AGTq39fSa9-H3kRb7CTheBrrF_ZO4pcb45Bn83DRC8DCR40l2hzlaHYFfmZbO0d6k6FpJsdZGx78qrwMVz2WW8gM7-QR1HpWO0rGC13Rorn1fgbGAaE75UXt5oqbkMbBWBPIBMCA_OGpJd-R0M-OrBeC9eug_fhPOxPkVpKRX5N-7bWIK-0czunK9hj2uNNVglqsREFaISqnSC9TjBqLfk86Pdq_klNvUHPt804oE',
  },
  {
    id: 'tm2',
    name: 'Sam Wilson',
    role: 'Project Manager',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCmbd2lpY_EcxDwHAyoMCR0oETzzQMKcDHsTZbwv2FMgstnYB9iRRT1CPtzKlt8qhbfM-PVHJxQGWqP7f-muB5BhXX5_fECbX6mdAiUv1sCVhtoYzDKytJ-cb_B186OQA8XrB6lRMa-dQUdBaqIjZNuIUNHsgAsTUT3XvzwGZKyLWrZxQVa-kEJSZrP8Mn0jV9T3Hsj5A9mUI345hI4X2mf336ao4mf-PeygabO_GHjYDe3QLkkhJWsP-iE_JAGiJASIT8HNlz8HhE8',
  },
  {
    id: 'tm3',
    name: 'Jane Foster',
    role: 'Technical Designer',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuASZJ1z4o0GO9MWHkKew0IngEEN3d3m-oU17gIMLZ8oJI6a3uM3K0Xe5piACWvgO8knkCp-ewAmNLOnvy5yYupjkc8XBoreCkxgjbhtPZWIx-OAq6_57k-9DYFp6vSK1FhhOzr6pqDRsT_-Gl9YSPFJ0rlDztPgI-76ohrSZ_ZGgc9pdxQVHiAnO500vKh4LcjU7iY-f9qy1c2g-eX2cQKDI2bTzT1C7L53nHk7Hb9OCj7Z1eHngkjz2DyoriwBHAbnrN499I4d1VyR',
  },
]

const initialProjectStages: ProjectStage[] = WORKFLOW_STAGES.map((stage, index) => ({
  id: `p1-${stage.toLowerCase().replace(/\s+/g, '-')}`,
  stage,
  status: index < 2 ? 'completed' : index === 2 ? 'active' : 'pending',
  priority: index === 2 ? 'high' : 'medium',
  startDate: index < 3 ? '12 Sep 2023' : null,
  dueDate: null,
  completedDate: index < 2 ? '20 Sep 2023' : null,
  departmentHead: sampleTeamMembers.find(tm =>
    tm.role.toLowerCase().includes(STAGE_TO_DEPARTMENT[stage].toLowerCase())
  ) || null,
  createdAt: new Date('2023-09-12'),
  updatedAt: new Date(),
}))

const initialProjects: Project[] = [
  {
    id: 'p1',
    projectCode: 'MIL',
    name: 'Miller Residence',
    description: '3BHK luxury apartment interior design and execution',
    clientName: 'The Miller Family',
    projectType: '3BHK',
    startDate: '12 Sep 2023',
    estimatedCompletion: '15 Jan 2024',
    currentStage: 'Technical Design',
    stages: initialProjectStages,
    status: 'active',
    projectManager: sampleTeamMembers[1],
    teamMembers: sampleTeamMembers,
    logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCLK-XTosv8BP4U_le6d-r1SExTXx_iH6BJTPJtN0ff4M_Xn-_d_EMD6PdeAE4vHffvsZ4N6esOi4dDII5ymV1pQyRTwuma5slVsDeicDjA3N6Kbwc6LLZGrLkHh4uWeyZrRgdwQzYChJimdFuI_muP-6QwywpOVZeKWZkzUqQjh9YF8h4tF-_u9SZ7ST5MIQGg53c4axqeTy4s7DZUY1Ol56t44thRIC23l4WC2IQX-vxMbIAx9aBS6U1-2coYtued_vj5Pxpmrh4G',
    taskCounter: 0,
    subtaskCounter: 0,
    issueCounter: 0,
    createdAt: new Date('2023-09-12'),
    updatedAt: new Date(),
  },
]

const ProjectContext = createContext<ProjectContextType | undefined>(undefined)

// Helper function to generate project code from name
function generateProjectCode(name: string, existingProjects: Project[]): string {
  // Take first 3-4 letters of first word(s) and uppercase
  const words = name.trim().split(/\s+/)
  let code = ''

  if (words.length === 1) {
    code = words[0].substring(0, 4).toUpperCase()
  } else {
    // Take first 2 letters of first two words
    code = (words[0].substring(0, 2) + words[1].substring(0, 2)).toUpperCase()
  }

  // Ensure uniqueness
  let finalCode = code
  let counter = 1
  while (existingProjects.some(p => p.projectCode === finalCode)) {
    finalCode = `${code}${counter}`
    counter++
  }

  return finalCode
}

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>(() => {
    const loadedProjects = loadFromLocalStorage('projects', initialProjects)

    // Migration: Add projectCode and counters to existing projects
    return loadedProjects.map((project) => {
      if (!project.projectCode) {
        return {
          ...project,
          projectCode: generateProjectCode(project.name, loadedProjects),
          taskCounter: project.taskCounter ?? 0,
          subtaskCounter: project.subtaskCounter ?? 0,
          issueCounter: project.issueCounter ?? 0,
        }
      }
      return {
        ...project,
        taskCounter: project.taskCounter ?? 0,
        subtaskCounter: project.subtaskCounter ?? 0,
        issueCounter: project.issueCounter ?? 0,
      }
    })
  })

  const [currentProject, setCurrentProject] = useState<Project | null>(() => {
    const loaded = loadFromLocalStorage('currentProject', projects[0] || null)
    if (loaded && !loaded.projectCode) {
      return {
        ...loaded,
        projectCode: generateProjectCode(loaded.name, projects),
        taskCounter: loaded.taskCounter ?? 0,
        subtaskCounter: loaded.subtaskCounter ?? 0,
        issueCounter: loaded.issueCounter ?? 0,
      }
    }
    return loaded
  })

  // Save to localStorage whenever projects change
  useEffect(() => {
    saveToLocalStorage('projects', projects)
  }, [projects])

  useEffect(() => {
    saveToLocalStorage('currentProject', currentProject)
  }, [currentProject])

  const createProject = (data: CreateProjectForm) => {
    const projectManager = sampleTeamMembers.find((tm) => tm.id === data.projectManagerId) || sampleTeamMembers[0]
    const projectId = generateId()

    // Load template data if template type is provided
    let templateStages = data.templateType ? loadTemplate(data.templateType, projectId, [projectManager]).stages : undefined

    // Initialize stages with metadata (use template stages if available)
    const projectStages: ProjectStage[] = WORKFLOW_STAGES.map((stage, index) => {
      const templateStage = templateStages?.find(ts => ts.stage === stage)

      if (templateStage) {
        // Use template stage configuration
        const departmentHead = sampleTeamMembers.find(
          tm => tm.role.toLowerCase().includes(templateStage.departmentHeadRole.toLowerCase())
        )

        // Calculate due date from project start
        const dueDate = templateStage.dueDate
          ? (() => {
              const d = new Date(data.startDate)
              d.setDate(d.getDate() + parseInt(templateStage.dueDate))
              return d.toISOString().split('T')[0]
            })()
          : null

        return {
          id: `${projectId}-${stage.toLowerCase().replace(/\s+/g, '-')}`,
          stage,
          status: index === 0 ? 'active' : templateStage.status,
          priority: templateStage.priority,
          startDate: index === 0 ? data.startDate : null,
          dueDate,
          completedDate: null,
          departmentHead: departmentHead || null,
          notes: templateStage.notes,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      } else {
        // Fall back to auto-initialization
        const owningDepartment = STAGE_TO_DEPARTMENT[stage]
        const departmentHead = sampleTeamMembers.find(
          tm => tm.role.toLowerCase().includes(owningDepartment.toLowerCase())
        )

        return {
          id: `${projectId}-${stage.toLowerCase().replace(/\s+/g, '-')}`,
          stage,
          status: index === 0 ? 'active' : 'pending',
          priority: 'medium',
          startDate: index === 0 ? data.startDate : null,
          dueDate: null,
          completedDate: null,
          departmentHead: departmentHead || null,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      }
    })

    const newProject: Project = {
      id: projectId,
      projectCode: data.projectCode || generateProjectCode(data.name, projects),
      name: data.name,
      description: data.description,
      clientName: data.clientName,
      projectType: data.projectType,
      startDate: data.startDate,
      estimatedCompletion: data.estimatedCompletion,
      currentStage: 'Sales',
      stages: projectStages,
      status: 'active',
      projectManager,
      teamMembers: [projectManager],
      logo: `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name)}&background=1193d4&color=fff`,
      taskCounter: 0,
      subtaskCounter: 0,
      issueCounter: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    // Initialize project with template data if template type is provided
    if (data.templateType) {
      const templateData = loadTemplate(data.templateType, newProject.id, newProject.teamMembers)

      // Load existing data from localStorage
      const existingTasks: Record<string, any> = loadFromLocalStorage('tasks', {})
      const existingFiles: Record<string, any> = loadFromLocalStorage('files', {})
      const existingDocuments: Record<string, any> = loadFromLocalStorage('documents', {})

      // Add template data to the new project
      existingTasks[newProject.id] = templateData.tasks
      existingFiles[newProject.id] = templateData.files
      existingDocuments[newProject.id] = templateData.documents

      // Save back to localStorage
      saveToLocalStorage('tasks', existingTasks)
      saveToLocalStorage('files', existingFiles)
      saveToLocalStorage('documents', existingDocuments)
    }

    setProjects((prev) => [...prev, newProject])
    setCurrentProject(newProject)
  }

  const updateProject = (id: string, data: Partial<Project>) => {
    setProjects((prev) =>
      prev.map((project) =>
        project.id === id
          ? { ...project, ...data, updatedAt: new Date() }
          : project
      )
    )
    if (currentProject?.id === id) {
      setCurrentProject((prev) => (prev ? { ...prev, ...data, updatedAt: new Date() } : null))
    }
  }

  const deleteProject = (id: string) => {
    setProjects((prev) => prev.filter((project) => project.id !== id))
    if (currentProject?.id === id) {
      setCurrentProject(projects[0] || null)
    }
  }

  const getNextTaskTrackingId = (): string => {
    if (!currentProject) return 'TASK-000'

    const nextCounter = currentProject.taskCounter + 1
    const trackingId = `${currentProject.projectCode}-TASK-${String(nextCounter).padStart(3, '0')}`

    // Update the counter
    updateProject(currentProject.id, { taskCounter: nextCounter })

    return trackingId
  }

  const getNextSubtaskTrackingId = (): string => {
    if (!currentProject) return 'SUB-000'

    const nextCounter = currentProject.subtaskCounter + 1
    const trackingId = `${currentProject.projectCode}-SUB-${String(nextCounter).padStart(3, '0')}`

    // Update the counter
    updateProject(currentProject.id, { subtaskCounter: nextCounter })

    return trackingId
  }

  const getNextIssueTrackingId = (): string => {
    if (!currentProject) return 'ISS-000'

    const nextCounter = currentProject.issueCounter + 1
    const trackingId = `${currentProject.projectCode}-ISS-${String(nextCounter).padStart(3, '0')}`

    // Update the counter
    updateProject(currentProject.id, { issueCounter: nextCounter })

    return trackingId
  }

  return (
    <ProjectContext.Provider
      value={{
        projects,
        currentProject,
        setCurrentProject,
        createProject,
        updateProject,
        deleteProject,
        getNextTaskTrackingId,
        getNextSubtaskTrackingId,
        getNextIssueTrackingId,
      }}
    >
      {children}
    </ProjectContext.Provider>
  )
}

export function useProjects() {
  const context = useContext(ProjectContext)
  if (context === undefined) {
    throw new Error('useProjects must be used within a ProjectProvider')
  }
  return context
}
