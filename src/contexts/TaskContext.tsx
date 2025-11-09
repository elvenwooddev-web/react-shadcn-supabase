import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { Task, TaskContextType, CreateTaskForm, CreateSubtaskForm, AttachedFile, ChecklistItem } from '@/types'
import { generateId, saveToLocalStorage, loadFromLocalStorage } from '@/lib/helpers'
import { useProjects } from './ProjectContext'
import { useUser } from './UserContext'

const initialTasks: Task[] = [
  {
    id: 't1',
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
        label: 'Draft switchboard locations',
        completed: true,
        assigneeId: 'tm3',
        avatar:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuBfwFajECFmWo-rM-moBTNXmq3a-104Hqxh8Hb2N0Ap6GJnshoqCFD9AHFREUKMeS522sVLiLg3MJxCvgjFYP39SUnOjaFDKVJ7U2-OkK6OaUIIwPuOVB4MGMi6twceTtAsX4pr6SZSAcVMAa00w_NFfKq-KZLBMPsPGerK4DMzodPkZOf4QhwW8WG_gCNpkktdlekdgVMbmRAXWVdRkk94Lq0_kIzSXCtLyJyUVT9cjkps6nxsAu7LJFgyODFfBxWOSXQVVwAHtJgd',
      },
      {
        id: 's2-2',
        label: 'Get client sign-off',
        completed: false,
        assigneeId: 'tm2',
        avatar:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuA9Bs1IwWE6c4QmJyy-6X-tgGEYphrHWl03-EG0ILDpEkJIo3tVWwxD0psqzNhZGu7hgwdYgYuInfOlZfWESWulHWLkQN32liEKNkKBkZtS0GDRWhNuUrKH32bGrs5CoBJwDq4WrhDemhNf0IAm_o4RxQjGlMQ4Xz5lwxRBsMzGsRyipMb2wi9BRK6w_jGuAXl63yVXNYrLFGq58o2ZvGIbfWfn8FDJk3VfZwbuCYyf_iwlrJWw55LQVPZvs2rWE0AvEksO2Y5qYOjw',
      },
    ],
    createdAt: new Date('2023-10-22'),
    updatedAt: new Date('2023-10-27'),
  },
]

const TaskContext = createContext<TaskContextType | undefined>(undefined)

export function TaskProvider({ children }: { children: ReactNode }) {
  const { currentProject } = useProjects()
  const { canAccessStage } = useUser()
  const [allTasks, setAllTasks] = useState<Record<string, Task[]>>(() =>
    loadFromLocalStorage('tasks', { p1: initialTasks })
  )

  // Filter tasks based on user's department permissions
  const allProjectTasks = currentProject ? allTasks[currentProject.id] || [] : []
  const tasks = allProjectTasks.filter((task) => canAccessStage(task.stage))

  useEffect(() => {
    saveToLocalStorage('tasks', allTasks)
  }, [allTasks])

  const createTask = (data: CreateTaskForm) => {
    if (!currentProject) return

    const newTask: Task = {
      id: generateId(),
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
  }

  const updateTask = (id: string, data: Partial<Task>) => {
    if (!currentProject) return

    setAllTasks((prev) => ({
      ...prev,
      [currentProject.id]: prev[currentProject.id].map((task) =>
        task.id === id ? { ...task, ...data, updatedAt: new Date() } : task
      ),
    }))
  }

  const deleteTask = (id: string) => {
    if (!currentProject) return

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
          const newSubtask = {
            id: generateId(),
            label: data.label,
            completed: false,
            assigneeId: data.assigneeId,
            avatar: assignee?.avatar || '',
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
              st.id === subtaskId ? { ...st, completed: !st.completed } : st
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
              st.id === subtaskId ? { ...st, assigneeId, avatar } : st
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
        updateSubtaskAssignee,
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
