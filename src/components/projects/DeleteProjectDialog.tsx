import { useState, type FormEvent } from 'react'
import { Trash2, AlertTriangle } from 'lucide-react'
import type { Project } from '@/types'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface DeleteProjectDialogProps {
  project: Project
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

export function DeleteProjectDialog({
  project,
  open,
  onOpenChange,
  onConfirm,
}: DeleteProjectDialogProps) {
  const [confirmText, setConfirmText] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()

    if (confirmText !== project.name) {
      setError('Project name does not match. Please type the exact project name.')
      return
    }

    onConfirm()
    setConfirmText('')
    setError('')
    onOpenChange(false)
  }

  const handleCancel = () => {
    setConfirmText('')
    setError('')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-danger">
            <Trash2 className="h-5 w-5" />
            Delete Project
          </DialogTitle>
          <DialogDescription className="pt-2">
            This action cannot be undone. This will permanently delete the project and all associated data.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          {/* Project Info */}
          <div className="p-4 bg-danger/10 border border-danger/20 rounded-lg space-y-2">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="h-5 w-5 text-danger" />
              <p className="font-semibold text-sm text-danger">
                You are about to delete:
              </p>
            </div>
            <div className="space-y-1 text-sm pl-7">
              <div className="flex items-start gap-2">
                <span className="text-muted-foreground min-w-20">Project:</span>
                <span className="font-bold text-foreground">{project.name}</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-muted-foreground min-w-20">Client:</span>
                <span className="font-medium">{project.clientName}</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-muted-foreground min-w-20">Type:</span>
                <span className="font-medium">{project.projectType}</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-muted-foreground min-w-20">Status:</span>
                <span className="font-medium capitalize">{project.status}</span>
              </div>
            </div>
          </div>

          {/* Confirmation Input */}
          <div className="space-y-2">
            <Label htmlFor="confirm-name" className="text-sm font-semibold">
              Type the project name to confirm deletion:
            </Label>
            <div className="p-2 bg-muted rounded text-sm font-mono text-center mb-2">
              {project.name}
            </div>
            <Input
              id="confirm-name"
              value={confirmText}
              onChange={(e) => {
                setConfirmText(e.target.value)
                setError('')
              }}
              placeholder="Type project name here..."
              className={error ? 'border-danger focus-visible:ring-danger' : ''}
              autoComplete="off"
            />
            {error && (
              <p className="text-xs text-danger flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                {error}
              </p>
            )}
          </div>

          {/* Warning Text */}
          <div className="bg-warning/10 border border-warning/20 rounded-lg p-3">
            <p className="text-xs text-muted-foreground">
              <strong className="text-warning">Warning:</strong> This will delete all tasks, files, documents,
              activities, stages, and workflow rules associated with this project. This action is irreversible.
            </p>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="destructive"
              disabled={confirmText !== project.name}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete Project
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
