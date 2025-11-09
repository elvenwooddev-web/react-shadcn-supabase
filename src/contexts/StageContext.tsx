import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { ProjectStage, StageContextType, WorkflowStage, StageStatus, TaskPriority, TeamMember } from '@/types'
import { STAGE_TO_DEPARTMENT } from '@/types'
import { generateId, saveToLocalStorage, loadFromLocalStorage } from '@/lib/helpers'
import { useProjects } from './ProjectContext'
import { useTasks } from './TaskContext'

const WORKFLOW_STAGES: WorkflowStage[] = [
  'Sales',
  'Design',
  'Technical Design',
  'Procurement',
  'Production',
  'Execution',
  'Post Installation',
]

const StageContext = createContext<StageContextType | undefined>(undefined)

export function StageProvider({ children }: { children: ReactNode }) {
  const { currentProject } = useProjects()
  const { tasks } = useTasks()

  const [allStages, setAllStages] = useState<Record<string, ProjectStage[]>>(() =>
    loadFromLocalStorage('stages', {})
  )

  const stages = currentProject ? allStages[currentProject.id] || [] : []

  useEffect(() => {
    saveToLocalStorage('stages', allStages)
  }, [allStages])

  // Initialize stages for a project if they don't exist
  useEffect(() => {
    if (currentProject && (!allStages[currentProject.id] || allStages[currentProject.id].length === 0)) {
      const projectStages: ProjectStage[] = WORKFLOW_STAGES.map((stage, index) => {
        const owningDepartment = STAGE_TO_DEPARTMENT[stage]
        const departmentHead = currentProject.teamMembers.find(
          tm => tm.role.toLowerCase().includes(owningDepartment.toLowerCase())
        )

        return {
          id: generateId(),
          stage,
          status: index === 0 ? 'active' : 'pending',
          priority: 'medium',
          startDate: index === 0 ? currentProject.startDate : null,
          dueDate: null,
          completedDate: null,
          departmentHead: departmentHead || null,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      })

      setAllStages(prev => ({
        ...prev,
        [currentProject.id]: projectStages
      }))
    }
  }, [currentProject])

  const updateStage = (stageId: string, data: Partial<ProjectStage>) => {
    if (!currentProject) return

    setAllStages(prev => ({
      ...prev,
      [currentProject.id]: prev[currentProject.id].map(stage =>
        stage.id === stageId
          ? { ...stage, ...data, updatedAt: new Date() }
          : stage
      )
    }))
  }

  const updateStageStatus = (stageName: WorkflowStage, status: StageStatus) => {
    if (!currentProject) return

    setAllStages(prev => ({
      ...prev,
      [currentProject.id]: prev[currentProject.id].map(stage =>
        stage.stage === stageName
          ? {
              ...stage,
              status,
              completedDate: status === 'completed' ? new Date().toISOString().split('T')[0] : stage.completedDate,
              updatedAt: new Date()
            }
          : stage
      )
    }))
  }

  const updateStagePriority = (stageName: WorkflowStage, priority: TaskPriority) => {
    if (!currentProject) return

    setAllStages(prev => ({
      ...prev,
      [currentProject.id]: prev[currentProject.id].map(stage =>
        stage.stage === stageName
          ? { ...stage, priority, updatedAt: new Date() }
          : stage
      )
    }))
  }

  const updateStageDates = (stageName: WorkflowStage, startDate: string | null, dueDate: string | null) => {
    if (!currentProject) return

    setAllStages(prev => ({
      ...prev,
      [currentProject.id]: prev[currentProject.id].map(stage =>
        stage.stage === stageName
          ? { ...stage, startDate, dueDate, updatedAt: new Date() }
          : stage
      )
    }))
  }

  const updateStageDepartmentHead = (stageName: WorkflowStage, departmentHead: TeamMember | null) => {
    if (!currentProject) return

    setAllStages(prev => ({
      ...prev,
      [currentProject.id]: prev[currentProject.id].map(stage =>
        stage.stage === stageName
          ? { ...stage, departmentHead, updatedAt: new Date() }
          : stage
      )
    }))
  }

  const completeStage = (stageName: WorkflowStage) => {
    if (!currentProject) return

    setAllStages(prev => ({
      ...prev,
      [currentProject.id]: prev[currentProject.id].map(stage =>
        stage.stage === stageName
          ? {
              ...stage,
              status: 'completed',
              completedDate: new Date().toISOString().split('T')[0],
              updatedAt: new Date()
            }
          : stage
      )
    }))
  }

  const getStageByName = (stageName: WorkflowStage): ProjectStage | undefined => {
    return stages.find(stage => stage.stage === stageName)
  }

  const getStageProgress = (stageName: WorkflowStage) => {
    const stageTasks = tasks.filter(task => task.stage === stageName)
    const completedTasks = stageTasks.filter(task => task.status === 'completed').length
    const totalTasks = stageTasks.length
    const percentComplete = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

    return {
      tasksComplete: completedTasks,
      tasksTotal: totalTasks,
      percentComplete,
    }
  }

  return (
    <StageContext.Provider
      value={{
        stages,
        updateStage,
        updateStageStatus,
        updateStagePriority,
        updateStageDates,
        updateStageDepartmentHead,
        completeStage,
        getStageByName,
        getStageProgress,
      }}
    >
      {children}
    </StageContext.Provider>
  )
}

export function useStages() {
  const context = useContext(StageContext)
  if (context === undefined) {
    throw new Error('useStages must be used within a StageProvider')
  }
  return context
}
