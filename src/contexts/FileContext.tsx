import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { RequiredFile, FileContextType, WorkflowStage } from '@/types'
import { generateId, saveToLocalStorage, loadFromLocalStorage } from '@/lib/helpers'
import { useProjects } from './ProjectContext'
import { useUser } from './UserContext'

const initialFiles: RequiredFile[] = [
  {
    id: 'rf1',
    fileName: 'Client Brief Document',
    uploadDate: '14 Sep 2023',
    requiredFrom: 'Sales',
    status: 'received',
  },
  {
    id: 'rf2',
    fileName: 'Site Measurement Files',
    uploadDate: '16 Sep 2023',
    requiredFrom: 'Sales',
    status: 'received',
  },
  {
    id: 'rf3',
    fileName: 'Finalized Moodboard',
    uploadDate: '28 Sep 2023',
    requiredFrom: 'Design',
    status: 'received',
  },
  {
    id: 'rf4',
    fileName: '2D Layouts (AutoCAD)',
    uploadDate: null,
    requiredFrom: 'Design',
    status: 'pending',
  },
  {
    id: 'rf5',
    fileName: '3D Renders',
    uploadDate: null,
    requiredFrom: 'Design',
    status: 'missing',
  },
]

const FileContext = createContext<FileContextType | undefined>(undefined)

export function FileProvider({ children }: { children: ReactNode }) {
  const { currentProject } = useProjects()
  const { canAccessStage } = useUser()
  const [allFiles, setAllFiles] = useState<Record<string, RequiredFile[]>>(() =>
    loadFromLocalStorage('files', { p1: initialFiles })
  )

  // Filter files based on user's department permissions
  const allProjectFiles = currentProject ? allFiles[currentProject.id] || [] : []
  const files = allProjectFiles.filter((file) => canAccessStage(file.requiredFrom))

  useEffect(() => {
    saveToLocalStorage('files', allFiles)
  }, [allFiles])

  const uploadFile = async (file: File, stage: WorkflowStage) => {
    if (!currentProject) return

    // Create a blob URL for the file (in a real app, you'd upload to Supabase Storage)
    const fileUrl = URL.createObjectURL(file)

    const newFile: RequiredFile = {
      id: generateId(),
      fileName: file.name,
      uploadDate: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }),
      requiredFrom: stage,
      status: 'received',
      fileUrl,
    }

    setAllFiles((prev) => ({
      ...prev,
      [currentProject.id]: [...(prev[currentProject.id] || []), newFile],
    }))
  }

  const deleteFile = (id: string) => {
    if (!currentProject) return

    setAllFiles((prev) => ({
      ...prev,
      [currentProject.id]: prev[currentProject.id].filter((f) => f.id !== id),
    }))
  }

  const updateFileStatus = (id: string, status: 'received' | 'pending' | 'missing') => {
    if (!currentProject) return

    setAllFiles((prev) => ({
      ...prev,
      [currentProject.id]: prev[currentProject.id].map((f) =>
        f.id === id ? { ...f, status } : f
      ),
    }))
  }

  return (
    <FileContext.Provider
      value={{
        files,
        uploadFile,
        deleteFile,
        updateFileStatus,
      }}
    >
      {children}
    </FileContext.Provider>
  )
}

export function useFiles() {
  const context = useContext(FileContext)
  if (context === undefined) {
    throw new Error('useFiles must be used within a FileProvider')
  }
  return context
}
