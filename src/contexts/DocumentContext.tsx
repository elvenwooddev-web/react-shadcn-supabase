import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { StageDocument, WorkflowStage } from '@/types'
import { generateId, saveToLocalStorage, loadFromLocalStorage } from '@/lib/helpers'
import { useProjects } from './ProjectContext'
import { useUser } from './UserContext'
import { residentialTemplate } from '@/data/templates/residentialTemplate'

interface DocumentContextType {
  documents: StageDocument[]
  uploadDocument: (doc: Omit<StageDocument, 'id'>) => void
  updateDocumentStatus: (id: string, status: StageDocument['status']) => void
  deleteDocument: (id: string) => void
  getRequiredDocumentsForStage: (stage: WorkflowStage) => StageDocument[]
  getApprovedRequiredDocuments: (stage: WorkflowStage) => number
  getTotalRequiredDocuments: (stage: WorkflowStage) => number
}

const DocumentContext = createContext<DocumentContextType | undefined>(undefined)

export function DocumentProvider({ children }: { children: ReactNode }) {
  const { currentProject } = useProjects()
  const { canAccessStage } = useUser()

  const [allDocuments, setAllDocuments] = useState<Record<string, StageDocument[]>>(() =>
    loadFromLocalStorage('documents', {
      p1: residentialTemplate.stageDocuments.map(doc => ({
        ...doc,
        id: `doc-${Math.random().toString(36).substr(2, 9)}`
      }))
    })
  )

  const allProjectDocs = currentProject ? allDocuments[currentProject.id] || [] : []
  const documents = allProjectDocs.filter((doc) => canAccessStage(doc.stage))

  useEffect(() => {
    saveToLocalStorage('documents', allDocuments)
  }, [allDocuments])

  const uploadDocument = (doc: Omit<StageDocument, 'id'>) => {
    if (!currentProject) return

    const newDoc: StageDocument = {
      ...doc,
      id: generateId(),
    }

    setAllDocuments((prev) => ({
      ...prev,
      [currentProject.id]: [...(prev[currentProject.id] || []), newDoc],
    }))
  }

  const updateDocumentStatus = (id: string, status: StageDocument['status']) => {
    if (!currentProject) return

    setAllDocuments((prev) => ({
      ...prev,
      [currentProject.id]: prev[currentProject.id].map((doc) =>
        doc.id === id ? { ...doc, status } : doc
      ),
    }))
  }

  const deleteDocument = (id: string) => {
    if (!currentProject) return

    setAllDocuments((prev) => ({
      ...prev,
      [currentProject.id]: prev[currentProject.id].filter((doc) => doc.id !== id),
    }))
  }

  const getRequiredDocumentsForStage = (stage: WorkflowStage): StageDocument[] => {
    return allProjectDocs.filter((doc) => doc.stage === stage && doc.requiredForProgression === true)
  }

  const getApprovedRequiredDocuments = (stage: WorkflowStage): number => {
    return allProjectDocs.filter(
      (doc) => doc.stage === stage && doc.requiredForProgression === true && doc.status === 'approved'
    ).length
  }

  const getTotalRequiredDocuments = (stage: WorkflowStage): number => {
    return allProjectDocs.filter((doc) => doc.stage === stage && doc.requiredForProgression === true).length
  }

  return (
    <DocumentContext.Provider
      value={{
        documents,
        uploadDocument,
        updateDocumentStatus,
        deleteDocument,
        getRequiredDocumentsForStage,
        getApprovedRequiredDocuments,
        getTotalRequiredDocuments,
      }}
    >
      {children}
    </DocumentContext.Provider>
  )
}

export function useDocuments() {
  const context = useContext(DocumentContext)
  if (!context) {
    throw new Error('useDocuments must be used within DocumentProvider')
  }
  return context
}
