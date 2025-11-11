/**
 * RBAC Context
 * Manages roles, permissions, and access control
 */

import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from 'react'
import type {
  Role,
  Permission,
  PermissionCategory,
  EffectivePermissions,
  PermissionCheckResult,
  RBACContextType,
  FieldPermission,
} from '@/types/rbac'
import { ALL_PERMISSIONS, getPermissionsByCategory, parsePermissionId, scopeIncludes } from '@/lib/permissions'
import { DEFAULT_ROLES } from '@/lib/roleTemplates'

const RBACContext = createContext<RBACContextType | null>(null)

export function RBACProvider({ children }: { children: ReactNode }) {
  const [roles, setRoles] = useState<Role[]>([])

  // Load roles from localStorage
  useEffect(() => {
    const storedRoles = localStorage.getItem('roles')
    if (storedRoles) {
      try {
        setRoles(JSON.parse(storedRoles))
      } catch (error) {
        console.error('Failed to parse roles from localStorage:', error)
        setRoles(DEFAULT_ROLES)
      }
    } else {
      // Initialize with default roles
      setRoles(DEFAULT_ROLES)
    }
  }, [])

  // Save roles to localStorage
  useEffect(() => {
    if (roles.length > 0) {
      localStorage.setItem('roles', JSON.stringify(roles))
    }
  }, [roles])

  // ============================================================================
  // ROLE CRUD OPERATIONS
  // ============================================================================

  const createRole = useCallback((roleData: Omit<Role, 'id' | 'createdAt' | 'updatedAt'>): Role => {
    const newRole: Role = {
      ...roleData,
      id: `role-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    setRoles(prev => [...prev, newRole])
    return newRole
  }, [])

  const updateRole = useCallback((id: string, updates: Partial<Role>) => {
    setRoles(prev =>
      prev.map(role =>
        role.id === id
          ? { ...role, ...updates, updatedAt: new Date().toISOString() }
          : role
      )
    )
  }, [])

  const deleteRole = useCallback((id: string) => {
    setRoles(prev => {
      const role = prev.find(r => r.id === id)
      if (role?.isSystem) {
        console.warn('Cannot delete system role:', role.name)
        return prev
      }
      return prev.filter(r => r.id !== id)
    })
  }, [])

  const getRole = useCallback(
    (id: string): Role | undefined => {
      return roles.find(r => r.id === id)
    },
    [roles]
  )

  // ============================================================================
  // PERMISSION QUERIES
  // ============================================================================

  const getAllPermissions = useCallback((): Permission[] => {
    return ALL_PERMISSIONS
  }, [])

  const getPermissionsByCategoryFn = useCallback((category: PermissionCategory): Permission[] => {
    return getPermissionsByCategory(category)
  }, [])

  const getRolePermissions = useCallback(
    (roleId: string): Permission[] => {
      const role = getRole(roleId)
      if (!role) return []

      // Wildcard grants all permissions
      if (role.permissions.includes('*')) {
        return ALL_PERMISSIONS
      }

      return ALL_PERMISSIONS.filter(p => role.permissions.includes(p.id))
    },
    [getRole]
  )

  // ============================================================================
  // USER ROLE MANAGEMENT
  // ============================================================================

  const getUserRoles = useCallback(
    (userId: string): Role[] => {
      // Get user's roleIds from localStorage
      const users = localStorage.getItem('users')
      if (!users) return []

      try {
        const parsedUsers = JSON.parse(users)
        const user = parsedUsers.find((u: any) => u.id === userId)
        if (!user || !user.roleIds) return []

        return user.roleIds
          .map((roleId: string) => getRole(roleId))
          .filter((role): role is Role => role !== undefined)
      } catch (error) {
        console.error('Failed to get user roles:', error)
        return []
      }
    },
    [getRole]
  )

  const assignRoleToUser = useCallback((userId: string, roleId: string) => {
    const users = localStorage.getItem('users')
    if (!users) return

    try {
      const parsedUsers = JSON.parse(users)
      const updatedUsers = parsedUsers.map((u: any) => {
        if (u.id === userId) {
          const currentRoleIds = u.roleIds || []
          if (!currentRoleIds.includes(roleId)) {
            return { ...u, roleIds: [...currentRoleIds, roleId] }
          }
        }
        return u
      })
      localStorage.setItem('users', JSON.stringify(updatedUsers))
    } catch (error) {
      console.error('Failed to assign role:', error)
    }
  }, [])

  const removeRoleFromUser = useCallback((userId: string, roleId: string) => {
    const users = localStorage.getItem('users')
    if (!users) return

    try {
      const parsedUsers = JSON.parse(users)
      const updatedUsers = parsedUsers.map((u: any) => {
        if (u.id === userId) {
          const currentRoleIds = u.roleIds || []
          return { ...u, roleIds: currentRoleIds.filter((id: string) => id !== roleId) }
        }
        return u
      })
      localStorage.setItem('users', JSON.stringify(updatedUsers))
    } catch (error) {
      console.error('Failed to remove role:', error)
    }
  }, [])

  // ============================================================================
  // EFFECTIVE PERMISSIONS CALCULATION
  // ============================================================================

  const getEffectivePermissions = useCallback(
    (userId: string): EffectivePermissions => {
      const userRoles = getUserRoles(userId)
      const permissionSet = new Set<string>()
      const fieldPermissionMap = new Map<string, FieldPermission>()
      const scopeMap = new Map<string, string>()

      // Collect all permissions from all roles
      userRoles.forEach(role => {
        // Handle wildcard permission
        if (role.permissions.includes('*')) {
          ALL_PERMISSIONS.forEach(p => permissionSet.add(p.id))
          return
        }

        // Add individual permissions
        role.permissions.forEach(permId => {
          permissionSet.add(permId)

          // Track highest scope for this permission
          const permission = ALL_PERMISSIONS.find(p => p.id === permId)
          if (permission?.scope) {
            const currentScope = scopeMap.get(permId) || 'own'
            const newScope = permission.scope
            const hierarchy = ['own', 'department', 'all']
            if (hierarchy.indexOf(newScope) > hierarchy.indexOf(currentScope)) {
              scopeMap.set(permId, newScope)
            }
          }
        })

        // Add field permissions
        role.fieldPermissions?.forEach(fp => {
          fieldPermissionMap.set(fp.id, fp)
        })
      })

      return {
        userId,
        permissions: permissionSet,
        fieldPermissions: fieldPermissionMap,
        highestScope: scopeMap as Map<string, any>,
      }
    },
    [getUserRoles]
  )

  // ============================================================================
  // PERMISSION CHECKING
  // ============================================================================

  const hasPermission = useCallback(
    (userId: string, permissionId: string): boolean => {
      const effectivePerms = getEffectivePermissions(userId)
      return effectivePerms.permissions.has(permissionId)
    },
    [getEffectivePermissions]
  )

  const hasAnyPermission = useCallback(
    (userId: string, permissionIds: string[]): boolean => {
      const effectivePerms = getEffectivePermissions(userId)
      return permissionIds.some(id => effectivePerms.permissions.has(id))
    },
    [getEffectivePermissions]
  )

  const hasAllPermissions = useCallback(
    (userId: string, permissionIds: string[]): boolean => {
      const effectivePerms = getEffectivePermissions(userId)
      return permissionIds.every(id => effectivePerms.permissions.has(id))
    },
    [getEffectivePermissions]
  )

  const canPerformAction = useCallback(
    (userId: string, action: string, resource?: any): PermissionCheckResult => {
      // Get user's effective permissions
      const effectivePerms = getEffectivePermissions(userId)

      // Check if user has the permission
      if (!effectivePerms.permissions.has(action)) {
        return {
          granted: false,
          reason: `Missing permission: ${action}`,
        }
      }

      // Get the permission details
      const permission = ALL_PERMISSIONS.find(p => p.id === action)
      if (!permission) {
        return { granted: true }
      }

      // Check scope for resource-level permissions
      if (permission.scope && resource) {
        const { scope: requiredScope } = parsePermissionId(action)
        const grantedScope = effectivePerms.highestScope.get(action) || 'own'

        // Check if granted scope satisfies required scope
        if (!scopeIncludes(grantedScope, requiredScope)) {
          return {
            granted: false,
            reason: `Insufficient scope: requires ${requiredScope}, has ${grantedScope}`,
            scope: grantedScope as any,
          }
        }

        // Check resource ownership for 'own' scope
        if (grantedScope === 'own' && resource) {
          const isOwner = resource.createdBy === userId ||
                          resource.assignee?.userId === userId ||
                          resource.assignees?.some((a: any) => a.userId === userId) ||
                          resource.projectManager?.id === userId

          if (!isOwner) {
            return {
              granted: false,
              reason: 'Not the owner of this resource',
              scope: 'own',
            }
          }
        }

        return { granted: true, scope: grantedScope as any }
      }

      return { granted: true }
    },
    [getEffectivePermissions]
  )

  // ============================================================================
  // FIELD-LEVEL PERMISSIONS
  // ============================================================================

  const canEditField = useCallback(
    (userId: string, resource: string, fieldName: string): boolean => {
      const effectivePerms = getEffectivePermissions(userId)
      const fieldPermId = `${resource}.field.${fieldName}`
      const fieldPerm = effectivePerms.fieldPermissions.get(fieldPermId)

      return fieldPerm?.allowedActions.includes('edit') === true
    },
    [getEffectivePermissions]
  )

  const canViewField = useCallback(
    (userId: string, resource: string, fieldName: string): boolean => {
      const effectivePerms = getEffectivePermissions(userId)
      const fieldPermId = `${resource}.field.${fieldName}`
      const fieldPerm = effectivePerms.fieldPermissions.get(fieldPermId)

      // If no field permission defined, allow view by default
      if (!fieldPerm) return true

      return fieldPerm.allowedActions.includes('view') === true
    },
    [getEffectivePermissions]
  )

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  const isAdmin = useCallback(
    (userId: string): boolean => {
      const userRoles = getUserRoles(userId)
      return userRoles.some(role => role.id === 'role-admin')
    },
    [getUserRoles]
  )

  const canAccessResource = useCallback(
    (userId: string, resourceType: string, resourceId: string): boolean => {
      // Admins can access everything
      if (isAdmin(userId)) return true

      // Check view permission for resource type
      const viewPermissions = [
        `${resourceType}.view.all`,
        `${resourceType}.view.department`,
        `${resourceType}.view.own`,
      ]

      return hasAnyPermission(userId, viewPermissions)
    },
    [isAdmin, hasAnyPermission]
  )

  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================

  const value: RBACContextType = {
    // Roles
    roles,
    createRole,
    updateRole,
    deleteRole,
    getRole,

    // Permissions
    getAllPermissions,
    getPermissionsByCategory: getPermissionsByCategoryFn,
    getRolePermissions,

    // Permission checking
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canPerformAction,

    // Field permissions
    canEditField,
    canViewField,

    // User role assignment
    assignRoleToUser,
    removeRoleFromUser,
    getUserRoles,
    getEffectivePermissions,

    // Utilities
    isAdmin,
    canAccessResource,
  }

  return <RBACContext.Provider value={value}>{children}</RBACContext.Provider>
}

export function useRBAC() {
  const context = useContext(RBACContext)
  if (!context) {
    throw new Error('useRBAC must be used within RBACProvider')
  }
  return context
}
