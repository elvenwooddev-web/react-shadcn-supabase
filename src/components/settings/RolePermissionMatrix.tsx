/**
 * Role Permission Matrix Component
 * Enterprise-level permission management UI similar to Jira/Linear
 */

import { useState, useMemo, useCallback, memo, useEffect } from 'react'
import { useRBAC } from '@/contexts/RBACContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  ChevronRight,
  ChevronDown,
  Search,
  Plus,
  Edit,
  Trash2,
  Copy,
  Shield,
  Lock,
} from 'lucide-react'
import { PERMISSION_GROUPS } from '@/lib/permissions'
import type { PermissionCategory, Role, Permission } from '@/types'
import { cn } from '@/lib/utils'

// Memoized checkbox cell for performance
const PermissionCheckbox = memo(({
  roleId,
  permissionId,
  isChecked,
  isDisabled,
  onToggle
}: {
  roleId: string
  permissionId: string
  isChecked: boolean
  isDisabled: boolean
  onToggle: (roleId: string, permissionId: string) => void
}) => {
  return (
    <div className="bg-card flex items-center justify-center min-w-[180px] py-4">
      <div className="mt-[2px]">
        <Checkbox
          checked={isChecked}
          onCheckedChange={() => onToggle(roleId, permissionId)}
          disabled={isDisabled}
          className={cn(isDisabled && 'opacity-50 cursor-not-allowed')}
        />
      </div>
    </div>
  )
})

PermissionCheckbox.displayName = 'PermissionCheckbox'

export function RolePermissionMatrix() {
  const { roles, getAllPermissions, updateRole, deleteRole, createRole } = useRBAC()
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [expandedCategories, setExpandedCategories] = useState<Set<PermissionCategory>>(
    new Set(['project', 'task'])
  )
  const [selectedRole, setSelectedRole] = useState<string | null>(null)
  const [showCreateRoleDialog, setShowCreateRoleDialog] = useState(false)
  const [newRoleName, setNewRoleName] = useState('')
  const [newRoleDescription, setNewRoleDescription] = useState('')

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // Filter non-system roles for editing
  const editableRoles = useMemo(() => roles.filter(r => !r.isSystem), [roles])
  const allRoles = useMemo(() => roles, [roles])

  // Create a map of role permissions for fast lookup
  const rolePermissionsMap = useMemo(() => {
    const map = new Map<string, Set<string>>()
    roles.forEach(role => {
      map.set(role.id, new Set(role.permissions))
    })
    return map
  }, [roles])

  // Group permissions by category - using debounced search
  const groupedPermissions = useMemo(() => {
    const allPermissions = getAllPermissions()
    const filtered = debouncedSearch
      ? allPermissions.filter(p =>
          p.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          p.description.toLowerCase().includes(debouncedSearch.toLowerCase())
        )
      : allPermissions

    return PERMISSION_GROUPS.map(group => ({
      ...group,
      permissions: filtered.filter(p => p.category === group.category),
    })).filter(group => group.permissions.length > 0)
  }, [getAllPermissions, debouncedSearch])

  // Toggle category expansion - memoized
  const toggleCategory = useCallback((category: PermissionCategory) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev)
      if (newSet.has(category)) {
        newSet.delete(category)
      } else {
        newSet.add(category)
      }
      return newSet
    })
  }, [])

  // Check if role has permission - memoized with fast lookup
  const hasPermission = useCallback((role: Role, permissionId: string): boolean => {
    const perms = rolePermissionsMap.get(role.id)
    if (!perms) return false
    return perms.has('*') || perms.has(permissionId)
  }, [rolePermissionsMap])

  // Toggle permission for role - memoized
  const togglePermission = useCallback((roleId: string, permissionId: string) => {
    const role = roles.find(r => r.id === roleId)
    if (!role) return

    // Don't allow editing system roles
    if (role.isSystem) {
      console.warn('Cannot edit system role permissions')
      return
    }

    const hasWildcard = role.permissions.includes('*')
    if (hasWildcard) {
      console.warn('Cannot modify permissions for role with wildcard access')
      return
    }

    const currentPermissions = role.permissions
    const hasIt = currentPermissions.includes(permissionId)

    const newPermissions = hasIt
      ? currentPermissions.filter(p => p !== permissionId)
      : [...currentPermissions, permissionId]

    updateRole(roleId, { permissions: newPermissions })
  }, [roles, updateRole])

  // Toggle all permissions in category for role - memoized
  const toggleCategoryForRole = useCallback((roleId: string, category: PermissionCategory) => {
    const role = roles.find(r => r.id === roleId)
    if (!role || role.isSystem) return

    const categoryPermissions = getAllPermissions().filter(p => p.category === category)
    const categoryPermissionIds = categoryPermissions.map(p => p.id)

    const allGranted = categoryPermissionIds.every(id =>
      role.permissions.includes('*') || role.permissions.includes(id)
    )

    if (allGranted) {
      // Remove all category permissions
      const newPermissions = role.permissions.filter(p => !categoryPermissionIds.includes(p))
      updateRole(roleId, { permissions: newPermissions })
    } else {
      // Add all category permissions
      const newPermissions = [...new Set([...role.permissions, ...categoryPermissionIds])]
      updateRole(roleId, { permissions: newPermissions })
    }
  }, [roles, getAllPermissions, updateRole])

  // Handle create role - memoized
  const handleCreateRole = useCallback(() => {
    if (!newRoleName.trim()) return

    createRole({
      name: newRoleName,
      description: newRoleDescription,
      permissions: [],
      isSystem: false,
    })

    // Reset form
    setNewRoleName('')
    setNewRoleDescription('')
    setShowCreateRoleDialog(false)
  }, [newRoleName, newRoleDescription, createRole])

  return (
    <div className="space-y-6">
      {/* Header with Search */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search permissions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => setShowCreateRoleDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Role
        </Button>
      </div>

      {/* Permission Matrix Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Role & Permission Matrix
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-x-auto relative">
            {/* Table Header */}
            <div className="bg-muted border-b sticky top-0 z-10 min-w-max">
              <div className="flex items-stretch gap-px bg-border">
                <div className="bg-muted p-4 sticky left-0 z-20 min-w-[430px] shadow-[2px_0_4px_rgba(0,0,0,0.1)] flex items-center">
                  <p className="text-sm font-semibold text-foreground">Action Permissions</p>
                </div>
                {allRoles.map(role => (
                  <div key={role.id} className="bg-muted py-4 px-2 text-center min-w-[180px] flex items-center justify-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-foreground truncate max-w-[140px]" title={role.name}>
                          {role.name}
                        </p>
                        {role.isSystem && (
                          <Lock className="w-3 h-3 text-muted-foreground flex-shrink-0" title="System role - cannot edit" />
                        )}
                      </div>
                      {!role.isSystem && (
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm" className="h-6 px-2">
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-6 px-2">
                            <Copy className="w-3 h-3" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-6 px-2 text-red-600 hover:text-red-700">
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Permission Rows Grouped by Category */}
            <div className="divide-y divide-border">
              {groupedPermissions.map((group) => {
                const isExpanded = expandedCategories.has(group.category)

                return (
                  <div key={group.category}>
                    {/* Category Header */}
                    <div
                      className="flex items-stretch gap-px bg-border hover:bg-muted/50 cursor-pointer min-w-max"
                      onClick={() => toggleCategory(group.category)}
                    >
                      <div className="bg-card p-4 flex items-center gap-2 sticky left-0 z-10 min-w-[430px] shadow-[2px_0_4px_rgba(0,0,0,0.1)]">
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        )}
                        <p className="text-sm font-semibold text-foreground">{group.label}</p>
                        <Badge variant="secondary" className="text-xs">
                          {group.permissions.length}
                        </Badge>
                      </div>
                      {allRoles.map(role => (
                        <div key={role.id} className="bg-card flex items-center justify-center min-w-[180px] py-3 px-4">
                          {!role.isSystem && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs px-2"
                              onClick={(e) => {
                                e.stopPropagation()
                                toggleCategoryForRole(role.id, group.category)
                              }}
                            >
                              {group.permissions.every(p => hasPermission(role, p.id)) ? 'Clear All' : 'Grant All'}
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Permission Rows */}
                    {isExpanded && group.permissions.map((permission) => (
                      <div
                        key={permission.id}
                        className="flex items-start gap-px bg-border hover:bg-muted/30 min-w-max"
                      >
                        <div className="bg-card p-4 pl-10 sticky left-0 z-10 min-w-[430px] shadow-[2px_0_4px_rgba(0,0,0,0.1)]">
                          <p className="text-sm font-medium text-foreground leading-5">{permission.name}</p>
                          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{permission.description}</p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {permission.scope && (
                              <Badge variant="outline" className="text-xs">
                                Scope: {permission.scope}
                              </Badge>
                            )}
                            {permission.requiresAdmin && (
                              <Badge variant="destructive" className="text-xs">
                                Admin Only
                              </Badge>
                            )}
                          </div>
                        </div>
                        {allRoles.map(role => (
                          <PermissionCheckbox
                            key={role.id}
                            roleId={role.id}
                            permissionId={permission.id}
                            isChecked={hasPermission(role, permission.id)}
                            isDisabled={role.isSystem}
                            onToggle={togglePermission}
                          />
                        ))}
                      </div>
                    ))}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Legend */}
          <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <Lock className="w-3 h-3" />
              <span>System roles cannot be modified</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-3 h-3" />
              <span>Admin-only permissions require administrator role</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Create Role Dialog */}
      <Dialog open={showCreateRoleDialog} onOpenChange={setShowCreateRoleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Role</DialogTitle>
            <DialogDescription>
              Create a custom role with specific permissions. You can assign permissions after creating the role.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="role-name">Role Name</Label>
              <Input
                id="role-name"
                placeholder="e.g., Quality Inspector"
                value={newRoleName}
                onChange={(e) => setNewRoleName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role-description">Description</Label>
              <Textarea
                id="role-description"
                placeholder="Describe the responsibilities of this role..."
                value={newRoleDescription}
                onChange={(e) => setNewRoleDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="rounded-lg bg-muted p-3">
              <p className="text-sm text-muted-foreground">
                After creating the role, use the permission matrix below to assign specific permissions.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateRoleDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateRole} disabled={!newRoleName.trim()}>
              <Plus className="w-4 h-4 mr-2" />
              Create Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
