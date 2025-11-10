import { ChevronDown, Download, CheckCircle, Clock, X, FileCheck, AlertCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useDocuments } from '@/contexts/DocumentContext'
import { useProjects } from '@/contexts/ProjectContext'
import type { DocumentCategory, DocumentStatus } from '@/types'
import { cn } from '@/lib/utils'

const categories: { name: DocumentCategory; label: string }[] = [
  { name: 'contract', label: 'Contracts' },
  { name: 'report', label: 'Reports' },
  { name: 'specification', label: 'Specifications' },
  { name: 'checklist', label: 'Checklists' },
]

const getCategoryIcon = (category: DocumentCategory) => {
  switch (category) {
    case 'contract':
      return '📄'
    case 'report':
      return '📊'
    case 'specification':
      return '📋'
    case 'checklist':
      return '✅'
    default:
      return '📁'
  }
}

const getStatusBadge = (status: DocumentStatus) => {
  switch (status) {
    case 'uploaded':
      return (
        <Badge variant="success" className="flex items-center gap-1.5 text-xs">
          <CheckCircle className="h-3 w-3" />
          <span>Uploaded</span>
        </Badge>
      )
    case 'pending':
      return (
        <Badge variant="warning" className="flex items-center gap-1.5 text-xs">
          <Clock className="h-3 w-3" />
          <span>Pending</span>
        </Badge>
      )
    case 'approved':
      return (
        <Badge variant="success" className="flex items-center gap-1.5 text-xs">
          <FileCheck className="h-3 w-3" />
          <span>Approved</span>
        </Badge>
      )
    case 'rejected':
      return (
        <Badge className="flex items-center gap-1.5 text-xs bg-danger/20 text-danger">
          <X className="h-3 w-3" />
          <span>Rejected</span>
        </Badge>
      )
    default:
      return null
  }
}

export function StageDocumentsTab() {
  const { documents: allDocuments, updateDocumentStatus } = useDocuments()
  const { currentProject } = useProjects()

  // Filter documents by current stage
  const currentStage = currentProject?.currentStage
  const documents = allDocuments.filter((doc) => doc.stage === currentStage)

  // Group documents by category
  const categoryDocuments = categories.map((category) => {
    const categoryDocs = documents.filter((doc) => doc.category === category.name)
    const approved = categoryDocs.filter((doc) => doc.status === 'approved').length
    return {
      category: category.name,
      label: category.label,
      approved,
      total: categoryDocs.length,
      documents: categoryDocs,
      isOpen: categoryDocs.some((doc) => doc.status === 'rejected' || doc.status === 'pending'),
    }
  }).filter((cat) => cat.total > 0)

  const handleStatusUpdate = (id: string, newStatus: DocumentStatus) => {
    updateDocumentStatus(id, newStatus)
  }

  if (documents.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No stage documents available yet.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {categoryDocuments.map((category) => (
        <details
          key={category.category}
          className="group bg-card rounded-xl border border-border"
          open={category.isOpen}
        >
          <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted rounded-t-xl list-none">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{getCategoryIcon(category.category)}</span>
              <h3 className="font-semibold text-foreground">
                {category.label}
              </h3>
              {category.approved === category.total ? (
                <Badge variant="success" className="text-xs">
                  {category.total} Document{category.total !== 1 ? 's' : ''}
                </Badge>
              ) : (
                <Badge
                  className="text-xs bg-muted text-muted-foreground"
                >
                  {category.total} Document{category.total !== 1 ? 's' : ''}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Expand</span>
              <ChevronDown className="h-5 w-5 transition-transform group-open:rotate-180" />
            </div>
          </summary>
          <div className="border-t border-border p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {category.documents.map((doc) => (
                <div
                  key={doc.id}
                  className={cn(
                    "border rounded-lg p-4 hover:bg-muted transition-colors",
                    doc.requiredForProgression
                      ? "border-orange-500/50 bg-orange-500/5"
                      : "border-border"
                  )}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <span className="text-3xl">{getCategoryIcon(doc.category)}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-foreground truncate">
                          {doc.title}
                        </h4>
                        {doc.requiredForProgression && (
                          <Badge variant="outline" className="text-xs bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/50 shrink-0">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Required
                          </Badge>
                        )}
                      </div>
                      {doc.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                          {doc.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {doc.uploadDate ? `Uploaded: ${doc.uploadDate}` : 'Not uploaded'}
                      </span>
                      {getStatusBadge(doc.status)}
                    </div>
                    <div className="flex items-center gap-2">
                      {doc.status === 'uploaded' || doc.status === 'approved' ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 h-8 text-xs"
                        >
                          <Download className="h-3 w-3 mr-1" />
                          Download
                        </Button>
                      ) : null}
                      {doc.status === 'uploaded' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 h-8 text-xs bg-success/10 hover:bg-success/20 text-success border-success/20"
                            onClick={() => handleStatusUpdate(doc.id, 'approved')}
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Approve
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 h-8 text-xs bg-danger/10 hover:bg-danger/20 text-danger border-danger/20"
                            onClick={() => handleStatusUpdate(doc.id, 'rejected')}
                          >
                            <X className="h-3 w-3 mr-1" />
                            Reject
                          </Button>
                        </>
                      )}
                      {doc.status === 'rejected' && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 h-8 text-xs"
                          onClick={() => handleStatusUpdate(doc.id, 'pending')}
                        >
                          <Clock className="h-3 w-3 mr-1" />
                          Resubmit
                        </Button>
                      )}
                      {doc.status === 'pending' && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 h-8 text-xs"
                          disabled
                        >
                          <Clock className="h-3 w-3 mr-1" />
                          Awaiting Upload
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </details>
      ))}
    </div>
  )
}
