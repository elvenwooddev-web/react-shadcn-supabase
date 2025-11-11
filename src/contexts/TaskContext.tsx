import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { Task, TaskContextType, CreateTaskForm, CreateSubtaskForm, AttachedFile, ChecklistItem } from '@/types'
import { generateId, saveToLocalStorage, loadFromLocalStorage } from '@/lib/helpers'
import { useProjects } from './ProjectContext'
import { useUser } from './UserContext'
import { useApprovalRules } from './ApprovalRuleContext'
import { useRBAC } from './RBACContext'

const initialTasks: Task[] = [
  {
    id: 't1',
    trackingId: 'MIL-TASK-001',
    title: 'Create GFC drawings',
    dueDate: '25 Oct 2023',
    assignee: {
      id: 'tm1',
      name: 'Anna',
      role: 'Designer',
      avatar:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuDoc1fP5de-e6Fo3TNBYRFX3j0j6-_G4nFgOfEECPe_de8ryDu5IxecDpqbXzeeFDmBsJ9xoM9cr1M_7EdbjQZx32SwebL0vuG3BdHciR7h01GwSLcVEvDTq4H5MsnL-CtxDehhxJBgNtC7isyGjaihPT9mu9gqYDJEuv2ss2q83G3oHNUhWA3eWDBfqLqephNWd0N5qVe0SN90v2w6_SAjXxvP8RuTJAOW3P4K9jprz3bbPwE15cqxc94yCfQF1LF2WA5gBv2CB285',
    },
    status: 'completed',
    priority: 'high',
    stage: 'Technical Design',
    checklistItems: [
      { id: 'c1-1', label: 'Prepare floor plan GFC', completed: true },
      { id: 'c1-2', label: 'Add furniture layout to drawings', completed: true },
    ],
    createdAt: new Date('2023-10-20'),
    updatedAt: new Date('2023-10-25'),
  },
  {
    id: 't2',
    trackingId: 'MIL-TASK-002',
    title: 'Finalize electrical layout',
    dueDate: '28 Oct 2023',
    assignee: {
      id: 'tm2',
      name: 'Sam',
      role: 'Project Manager',
      avatar:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuA9Bs1IwWE6c4QmJyy-6X-tgGEYphrHWl03-EG0ILDpEkJIo3tVWwxD0psqzNhZGu7hgwdYgYuInfOlZfWESWulHWLkQN32liEKNkKBkZtS0GDRWhNuUrKH32bGrs5CoBJwDq4WrhDemhNf0IAm_o4RxQjGlMQ4Xz5lwxRBsMzGsRyipMb2wi9BRK6w_jGuAXl63yVXNYrLFGq58o2ZvGIbfWfn8FDJk3VfZwbuCYyf_iwlrJWw55LQVPZvs2rWE0AvEksO2Y5qYOjw',
    },
    status: 'in-progress',
    priority: 'urgent',
    stage: 'Technical Design',
    subtasks: [
      {
        id: 's2-1',
        trackingId: 'MIL-SUB-001',
        label: 'Draft switchboard locations',
        completed: true,
        status: 'completed',
        priority: 'medium',
        assigneeId: 'tm3',
        avatar:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuBfwFajECFmWo-rM-moBTNXmq3a-104Hqxh8Hb2N0Ap6GJnshoqCFD9AHFREUKMeS522sVLiLg3MJxCvgjFYP39SUnOjaFDKVJ7U2-OkK6OaUIIwPuOVB4MGMi6twceTtAsX4pr6SZSAcVMAa00w_NFfKq-KZLBMPsPGerK4DMzodPkZOf4QhwW8WG_gCNpkktdlekdgVMbmRAXWVdRkk94Lq0_kIzSXCtLyJyUVT9cjkps6nxsAu7LJFgyODFfBxWOSXQVVwAHtJgd',
        attachments: [],
        createdAt: new Date('2023-10-22'),
        updatedAt: new Date('2023-10-25'),
      },
      {
        id: 's2-2',
        trackingId: 'MIL-SUB-002',
        label: 'Get client sign-off',
        completed: false,
        status: 'in-progress',
        priority: 'high',
        assigneeId: 'tm2',
        avatar:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuA9Bs1IwWE6c4QmJyy-6X-tgGEYphrHWl03-EG0ILDpEkJIo3tVWwxD0psqzNhZGu7hgwdYgYuInfOlZfWESWulHWLkQN32liEKNkKBkZtS0GDRWhNuUrKH32bGrs5CoBJwDq4WrhDemhNf0IAm_o4RxQjGlMQ4Xz5lwxRBsMzGsRyipMb2wi9BRK6w_jGuAXl63yVXNYrLFGq58o2ZvGIbfWfn8FDJk3VfZwbuCYyf_iwlrJWw55LQVPZvs2rWE0AvEksO2Y5qYOjw',
        attachments: [],
        createdAt: new Date('2023-10-22'),
        updatedAt: new Date('2023-10-27'),
      },
    ],
    createdAt: new Date('2023-10-22'),
    updatedAt: new Date('2023-10-27'),
  },
]

const TaskContext = createContext<TaskContextType | undefined>(undefined)

export function TaskProvider({ children }: { children: ReactNode }) {
  const { currentProject, getNextTaskTrackingId, getNextSubtaskTrackingId } = useProjects()
  const { currentUser, canAccessStage } = useUser()
  const { applyRulesToEntity } = useApprovalRules()
  const { hasPermission, canPerformAction } = useRBAC()
  const [allTasks, setAllTasks] = useState<Record<string, Task[]>>(() => {
    const loaded = loadFromLocalStorage('tasks', { p1: initialTasks })

    // Migrate old subtask data to new format and add tracking IDs
    const migrated: Record<string, Task[]> = {}
    Object.keys(loaded).forEach(projectId => {
      let taskCounter = 1
      let subtaskCounter = 1

      migrated[projectId] = loaded[projectId].map(task => ({
        ...task,
        trackingId: task.trackingId || `TEMP-TASK-${String(taskCounter++).padStart(3, '0')}`,
        subtasks: task.subtasks?.map(st => ({
          ...st,
          trackingId: st.trackingId || `TEMP-SUB-${String(subtaskCounter++).padStart(3, '0')}`,
          status: st.status || (st.completed ? 'completed' : 'todo'),
          priority: st.priority || 'medium',
          description: st.description || undefined,
          dueDate: st.dueDate || undefined,
          attachments: st.attachments || [],
          createdAt: st.createdAt || new Date(),
          updatedAt: st.updatedAt || new Date(),
        }))
      }))
    })

    return migrated
  })

  // Filter tasks based on user's department permissions
  const allProjectTasks = currentProject ? allTasks[currentProject.id] || [] : []
  const tasks = allProjectTasks.filter((task) => canAccessStage(task.stage))

  useEffect(() => {
    saveToLocalStorage('tasks', allTasks)
  }, [allTasks])

  const createTask = (data: CreateTaskForm) => {
    if (!currentProject) return

    // RBAC: Check permission to create tasks
    if (!currentUser || !hasPermission(currentUser.id, 'task.create')) {
      console.warn('Permission denied: Cannot create tasks')
      return
    }

    const newTask: Task = {
      id: generateId(),
      trackingId: getNextTaskTrackingId(),
      title: data.title,
      description: data.description,
      dueDate: data.dueDate,
      assignee: currentProject.teamMembers.find((tm) => tm.id === data.assigneeId) || currentProject.teamMembers[0],
      status: data.status || 'todo',
      priority: data.priority || 'medium',
      stage: data.stage,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    setAllTasks((prev) => ({
      ...prev,
      [currentProject.id]: [...(prev[currentProject.id] || []), newTask],
    }))

    // Apply approval rules to newly created task
    applyRulesToEntity(newTask, currentProject.id)
  }

  const updateTask = (id: string, data: Partial<Task>) => {
    if (!currentProject) return

    // RBAC: Check permission to edit tasks
    if (!currentUser) {
      console.warn('Permission denied: No current user')
      return
    }

    const task = allTasks[currentProject.id]?.find(t => t.id === id)
    if (task) {
      // Check if user can edit this specific task
      const hasEditAll = hasPermission(currentUser.id, 'task.edit.all')
      const hasEditOwn = hasPermission(currentUser.id, 'task.edit.own')

      if (!hasEditAll && (!hasEditOwn || task.assignee?.id !== currentUser.id)) {
        console.warn('Permission denied: Cannot edit this task')
        return
      }
    }

    setAllTasks((prev) => ({
      ...prev,
      [currentProject.id]: prev[currentProject.id].map((task) =>
        task.id === id ? { ...task, ...data, updatedAt: new Date() } : task
      ),
    }))
  }

  const deleteTask = (id: string) => {
    if (!currentProject) return

    // RBAC: Check permission to delete tasks
    if (!currentUser) {
      console.warn('Permission denied: No current user')
      return
    }

    const task = allTasks[currentProject.id]?.find(t => t.id === id)
    if (task) {
      const hasDeleteAll = hasPermission(currentUser.id, 'task.delete.all')
      const hasDeleteOwn = hasPermission(currentUser.id, 'task.delete.own')

      if (!hasDeleteAll && (!hasDeleteOwn || task.assignee?.id !== currentUser.id)) {
        console.warn('Permission denied: Cannot delete this task')
        return
      }
    }

    setAllTasks((prev) => ({
      ...prev,
      [currentProject.id]: prev[currentProject.id].filter((task) => task.id !== id),
    }))
  }

  const toggleTaskStatus = (id: string) => {
    if (!currentProject) return

    setAllTasks((prev) => ({
      ...prev,
      [currentProject.id]: prev[currentProject.id].map((task) => {
        if (task.id === id) {
          const newStatus = task.status === 'completed' ? 'todo' : 'completed'
          return { ...task, status: newStatus, updatedAt: new Date() }
        }
        return task
      }),
    }))
  }

  const addSubtask = (taskId: string, data: CreateSubtaskForm) => {
    if (!currentProject) return

    setAllTasks((prev) => ({
      ...prev,
      [currentProject.id]: prev[currentProject.id].map((task) => {
        if (task.id === taskId) {
          const assignee = currentProject.teamMembers.find((tm) => tm.id === data.assigneeId)
          const assignees = data.assigneeIds
            ? currentProject.teamMembers.filter(tm => data.assigneeIds?.includes(tm.id))
            : undefined

          const newSubtask: Subtask = {
            id: generateId(),
            trackingId: getNextSubtaskTrackingId(),
            label: data.label,
            description: data.description,
            completed: data.status === 'completed',
            status: data.status || 'todo',
            priority: data.priority || 'medium',
            assigneeId: data.assigneeId,
            avatar: assignee?.avatar || '',
            assignees: assignees,
            dueDate: data.dueDate,
            attachments: [],
            createdAt: new Date(),
            updatedAt: new Date(),
          }
          return {
            ...task,
            subtasks: [...(task.subtasks || []), newSubtask],
            updatedAt: new Date(),
          }
        }
        return task
      }),
    }))
  }

  const toggleSubtask = (taskId: string, subtaskId: string) => {
    if (!currentProject) return

    setAllTasks((prev) => ({
      ...prev,
      [currentProject.id]: prev[currentProject.id].map((task) => {
        if (task.id === taskId) {
          return {
            ...task,
            subtasks: task.subtasks?.map((st) =>
              st.id === subtaskId ? {
                ...st,
                completed: !st.completed,
                status: !st.completed ? 'completed' : 'todo',
                updatedAt: new Date()
              } : st
            ),
            updatedAt: new Date(),
          }
        }
        return task
      }),
    }))
  }

  const deleteSubtask = (taskId: string, subtaskId: string) => {
    if (!currentProject) return

    setAllTasks((prev) => ({
      ...prev,
      [currentProject.id]: prev[currentProject.id].map((task) => {
        if (task.id === taskId) {
          return {
            ...task,
            subtasks: task.subtasks?.filter((st) => st.id !== subtaskId),
            updatedAt: new Date(),
          }
        }
        return task
      }),
    }))
  }

  const updateSubtaskAssignee = (taskId: string, subtaskId: string, assigneeId: string, avatar: string) => {
    if (!currentProject) return

    setAllTasks((prev) => ({
      ...prev,
      [currentProject.id]: prev[currentProject.id].map((task) => {
        if (task.id === taskId) {
          return {
            ...task,
            subtasks: task.subtasks?.map((st) =>
              st.id === subtaskId ? { ...st, assigneeId, avatar, updatedAt: new Date() } : st
            ),
            updatedAt: new Date(),
          }
        }
        return task
      }),
    }))
  }

  const updateSubtask = (taskId: string, subtaskId: string, data: Partial<Subtask>) => {
    if (!currentProject) return

    setAllTasks((prev) => ({
      ...prev,
      [currentProject.id]: prev[currentProject.id].map((task) => {
        if (task.id === taskId) {
          return {
            ...task,
            subtasks: task.subtasks?.map((st) =>
              st.id === subtaskId ? { ...st, ...data, updatedAt: new Date() } : st
            ),
            updatedAt: new Date(),
          }
        }
        return task
      }),
    }))
  }

  const updateSubtaskStatus = (taskId: string, subtaskId: string, status: TaskStatus) => {
    if (!currentProject) return

    setAllTasks((prev) => ({
      ...prev,
      [currentProject.id]: prev[currentProject.id].map((task) => {
        if (task.id === taskId) {
          return {
            ...task,
            subtasks: task.subtasks?.map((st) =>
              st.id === subtaskId ? {
                ...st,
                status,
                completed: status === 'completed',
                updatedAt: new Date()
              } : st
            ),
            updatedAt: new Date(),
          }
        }
        return task
      }),
    }))
  }

  const updateSubtaskPriority = (taskId: string, subtaskId: string, priority: TaskPriority) => {
    if (!currentProject) return

    setAllTasks((prev) => ({
      ...prev,
      [currentProject.id]: prev[currentProject.id].map((task) => {
        if (task.id === taskId) {
          return {
            ...task,
            subtasks: task.subtasks?.map((st) =>
              st.id === subtaskId ? { ...st, priority, updatedAt: new Date() } : st
            ),
            updatedAt: new Date(),
          }
        }
        return task
      }),
    }))
  }

  const attachFileToSubtask = (taskId: string, subtaskId: string, file: AttachedFile) => {
    if (!currentProject) return

    setAllTasks((prev) => ({
      ...prev,
      [currentProject.id]: prev[currentProject.id].map((task) => {
        if (task.id === taskId) {
          return {
            ...task,
            subtasks: task.subtasks?.map((st) =>
              st.id === subtaskId ? {
                ...st,
                attachments: [...(st.attachments || []), file],
                updatedAt: new Date()
              } : st
            ),
            updatedAt: new Date(),
          }
        }
        return task
      }),
    }))
  }

  const removeFileFromSubtask = (taskId: string, subtaskId: string, fileId: string) => {
    if (!currentProject) return

    setAllTasks((prev) => ({
      ...prev,
      [currentProject.id]: prev[currentProject.id].map((task) => {
        if (task.id === taskId) {
          return {
            ...task,
            subtasks: task.subtasks?.map((st) =>
              st.id === subtaskId ? {
                ...st,
                attachments: st.attachments?.filter(f => f.id !== fileId),
                updatedAt: new Date()
              } : st
            ),
            updatedAt: new Date(),
          }
        }
        return task
      }),
    }))
  }

  const addChecklistItem = (taskId: string, label: string) => {
    if (!currentProject) return

    setAllTasks((prev) => ({
      ...prev,
      [currentProject.id]: prev[currentProject.id].map((task) => {
        if (task.id === taskId) {
          const newItem: ChecklistItem = {
            id: generateId(),
            label,
            completed: false,
          }
          return {
            ...task,
            checklistItems: [...(task.checklistItems || []), newItem],
            updatedAt: new Date(),
          }
        }
        return task
      }),
    }))
  }

  const toggleChecklistItem = (taskId: string, itemId: string) => {
    if (!currentProject) return

    setAllTasks((prev) => ({
      ...prev,
      [currentProject.id]: prev[currentProject.id].map((task) => {
        if (task.id === taskId) {
          return {
            ...task,
            checklistItems: task.checklistItems?.map((item) =>
              item.id === itemId ? { ...item, completed: !item.completed } : item
            ),
            updatedAt: new Date(),
          }
        }
        return task
      }),
    }))
  }

  const attachFile = (taskId: string, file: AttachedFile) => {
    if (!currentProject) return

    setAllTasks((prev) => ({
      ...prev,
      [currentProject.id]: prev[currentProject.id].map((task) => {
        if (task.id === taskId) {
          return {
            ...task,
            attachments: [...(task.attachments || []), file],
            updatedAt: new Date(),
          }
        }
        return task
      }),
    }))
  }

  const removeFile = (taskId: string, fileId: string) => {
    if (!currentProject) return

    setAllTasks((prev) => ({
      ...prev,
      [currentProject.id]: prev[currentProject.id].map((task) => {
        if (task.id === taskId) {
          return {
            ...task,
            attachments: task.attachments?.filter((f) => f.id !== fileId),
            updatedAt: new Date(),
          }
        }
        return task
      }),
    }))
  }

  const deleteChecklistItem = (taskId: string, itemId: string) => {
    if (!currentProject) return

    setAllTasks((prev) => ({
      ...prev,
      [currentProject.id]: prev[currentProject.id].map((task) => {
        if (task.id === taskId) {
          return {
            ...task,
            checklistItems: task.checklistItems?.filter((item) => item.id !== itemId),
            updatedAt: new Date(),
          }
        }
        return task
      }),
    }))
  }

  return (
    <TaskContext.Provider
      value={{
        tasks,
        createTask,
        updateTask,
        deleteTask,
        toggleTaskStatus,
        addSubtask,
        toggleSubtask,
        deleteSubtask,
        updateSubtask,
        updateSubtaskStatus,
        updateSubtaskPriority,
        updateSubtaskAssignee,
        attachFileToSubtask,
        removeFileFromSubtask,
        addChecklistItem,
        toggleChecklistItem,
        deleteChecklistItem,
        attachFile,
        removeFile,
      }}
    >
      {children}
    </TaskContext.Provider>
  )
}

export function useTasks() {
  const context = useContext(TaskContext)
  if (context === undefined) {
    throw new Error('useTasks must be used within a TaskProvider')
  }
  return context
}
