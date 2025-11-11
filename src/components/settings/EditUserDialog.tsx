/**
 * Edit User Dialog Component
 * Form for editing existing user details and role assignments
 */

import { useState, useEffect } from 'react'
import { useUser } from '@/contexts/UserContext'
import { useRBAC } from '@/contexts/RBACContext'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Edit, X, Save } from 'lucide-react'
import type { Department, User } from '@/types'

interface EditUserDialogProps {
  user: User
  open: boolean
  onClose: () => void
}

export function EditUserDialog({ user, open, onClose }: EditUserDialogProps) {
  const { updateUser } = useUser()
  const { roles, assignRoleToUser, removeRoleFromUser, getUserRoles } = useRBAC()

  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    department: user.department,
    roleIds: user.roleIds || [],
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Reset form when user changes
  useEffect(() => {
    setFormData({
      name: user.name,
      email: user.email,
      department: user.department,
      roleIds: user.roleIds || [],
    })
  }, [user])

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format'
    }

    if (formData.roleIds.length === 0) {
      newErrors.roles = 'At least one role is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return

    // Map department to legacy role field
    const legacyRoleMap: Record<Department, any> = {
      Admin: 'admin',
      Sales: 'sales',
      Design: 'designer',
      Technical: 'technical-designer',
      Procurement: 'procurement',
      Production: 'production',
      Execution: 'execution',
    }

    // Update user basic info
    updateUser(user.id, {
      name: formData.name,
      email: formData.email,
      department: formData.department,
      role: legacyRoleMap[formData.department],
      roleIds: formData.roleIds,
    })

    // Update role assignments
    const currentRoleIds = user.roleIds || []
    const rolesToAdd = formData.roleIds.filter(id => !currentRoleIds.includes(id))
    const rolesToRemove = currentRoleIds.filter(id => !formData.roleIds.includes(id))

    rolesToAdd.forEach(roleId => assignRoleToUser(user.id, roleId))
    rolesToRemove.forEach(roleId => removeRoleFromUser(user.id, roleId))

    onClose()
  }

  const toggleRole = (roleId: string) => {
    setFormData(prev => ({
      ...prev,
      roleIds: prev.roleIds.includes(roleId)
        ? prev.roleIds.filter(id => id !== roleId)
        : [...prev.roleIds, roleId],
    }))
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="w-5 h-5" />
            Edit User
          </DialogTitle>
          <DialogDescription>
            Update user details and role assignments
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Full Name*</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="John Doe"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
            </div>

            <div>
              <Label htmlFor="edit-email">Email Address*</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="john.doe@company.com"
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
            </div>

            <div>
              <Label htmlFor="edit-department">Department*</Label>
              <select
                id="edit-department"
                value={formData.department}
                onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value as Department }))}
                className="w-full h-10 px-3 rounded-md border border-border bg-background text-foreground"
              >
                <option value="Sales">Sales</option>
                <option value="Design">Design</option>
                <option value="Technical">Technical</option>
                <option value="Procurement">Procurement</option>
                <option value="Production">Production</option>
                <option value="Execution">Execution</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
          </div>

          {/* Role Assignment */}
          <div>
            <Label>Assigned Roles*</Label>
            <p className="text-xs text-muted-foreground mb-3">
              User can have multiple roles with cumulative permissions
            </p>
            {errors.roles && <p className="text-xs text-red-600 mb-2">{errors.roles}</p>}

            <div className="space-y-2 border rounded-lg p-4 max-h-96 overflow-y-auto">
              {roles.map(role => (
                <div
                  key={role.id}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted cursor-pointer"
                  onClick={() => toggleRole(role.id)}
                >
                  <Checkbox
                    checked={formData.roleIds.includes(role.id)}
                    onCheckedChange={() => toggleRole(role.id)}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground">{role.name}</p>
                      {role.isSystem && (
                        <Badge variant="secondary" className="text-xs">System</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{role.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        {role.permissions.includes('*') ? 'All Permissions' : `${role.permissions.length} permissions`}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
