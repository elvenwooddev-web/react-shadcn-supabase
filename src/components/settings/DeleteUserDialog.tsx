/**
 * Delete User Dialog Component
 * Confirmation dialog for user deletion with warnings
 */

import { useState } from 'react'
import { useUser } from '@/contexts/UserContext'
import { useRBAC } from '@/contexts/RBACContext'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, Trash2, X } from 'lucide-react'
import type { User } from '@/types'

interface DeleteUserDialogProps {
  user: User
  open: boolean
  onClose: () => void
}

export function DeleteUserDialog({ user, open, onClose }: DeleteUserDialogProps) {
  const { deleteUser } = useUser()
  const { getUserRoles } = useRBAC()
  const [confirmText, setConfirmText] = useState('')

  const userRoles = getUserRoles(user.id)
  const isConfirmed = confirmText === user.email

  const handleDelete = () => {
    if (!isConfirmed) return

    deleteUser(user.id)
    onClose()
    setConfirmText('')
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-5 h-5" />
            Delete User
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete the user account.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* User Details */}
          <div className="p-4 bg-muted rounded-lg space-y-3">
            <div>
              <p className="text-xs text-muted-foreground">User Name</p>
              <p className="text-sm font-medium text-foreground">{user.name}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="text-sm font-medium text-foreground">{user.email}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Department</p>
              <Badge variant="outline">{user.department}</Badge>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-2">Assigned Roles</p>
              <div className="flex flex-wrap gap-1">
                {userRoles.map(role => (
                  <Badge key={role.id} variant="default" className="text-xs">
                    {role.name}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Warning Message */}
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded-lg">
            <div className="flex gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-red-900 dark:text-red-200 mb-2">
                  Warning: This will permanently delete
                </p>
                <ul className="text-xs text-red-800 dark:text-red-300 space-y-1 list-disc list-inside">
                  <li>User account and profile</li>
                  <li>All role assignments</li>
                  <li>User activity history</li>
                  <li>Any user-specific data</li>
                </ul>
                <p className="text-xs text-red-800 dark:text-red-300 mt-3">
                  Tasks assigned to this user will become unassigned.
                </p>
              </div>
            </div>
          </div>

          {/* Confirmation Input */}
          <div>
            <Label htmlFor="confirm-email">
              Type <span className="font-mono font-semibold">{user.email}</span> to confirm
            </Label>
            <Input
              id="confirm-email"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="Enter user email to confirm"
              className="mt-2"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={!isConfirmed}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete User
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
