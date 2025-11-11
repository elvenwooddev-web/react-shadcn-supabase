/**
 * RBAC (Role-Based Access Control) Type Definitions
 * Enterprise-level permission and role management system
 */

import type { Department } from './index'

// Permission scope levels
export type PermissionScope = 'own' | 'department' | 'all'

// Permission categories
export type PermissionCategory =
  | 'project'
  | 'task'
  | 'file'
  | 'document'
  | 'approval'
  | 'settings'
  | 'team'
  | 'issue'

// Permission definition
export interface Permission {
  id: string // e.g., 'project.create', 'task.edit.own'
  name: string
  description: string
  category: PermissionCategory
  scope?: PermissionScope // For resource-level permissions
  requiresAdmin?: boolean // If true, only admins can have this permission
}

// Field-level permission (for granular control)
export interface FieldPermission {
  id: string // e.g., 'task.field.priority', 'project.field.budget'
  fieldName: string
  allowedActions: ('view' | 'edit')[]
}

// Role definition
export interface Role {
  id: string
  name: string
  description: string
  isSystem: boolean // System roles (Admin, Manager, etc.) cannot be deleted
  permissions: string[] // Array of permission IDs
  fieldPermissions?: FieldPermission[] // Optional field-level permissions
  department?: Department // Optional department restriction
  createdAt: string
  updatedAt: string
}

// Permission group for UI organization
export interface PermissionGroup {
  category: PermissionCategory
  label: string
  icon?: string
  permissions: Permission[]
  expanded?: boolean
}

// User with RBAC
export interface RBACUser {
  id: string
  name: string
  email: string
  avatar: string
  department: Department
  roleIds: string[] // Multiple roles supported
  isActive: boolean
  createdAt: string
  updatedAt: string
  lastLogin?: string
}

// Permission check result
export interface PermissionCheckResult {
  granted: boolean
  reason?: string // Why permission was denied
  scope?: PermissionScope // Granted scope level
}

// Effective permissions (computed from all user roles)
export interface EffectivePermissions {
  userId: string
  permissions: Set<string>
  fieldPermissions: Map<string, FieldPermission>
  highestScope: Map<string, PermissionScope> // Track highest scope per permission
}

// Role assignment
export interface RoleAssignment {
  userId: string
  roleId: string
  assignedBy: string
  assignedAt: string
}

// Permission audit log
export interface PermissionAuditLog {
  id: string
  userId: string
  action: string // 'role.assign', 'role.remove', 'permission.grant', 'permission.revoke'
  targetUserId?: string
  targetRoleId?: string
  performedBy: string
  timestamp: string
  details?: Record<string, any>
}

// RBAC Context Type
export interface RBACContextType {
  // Roles
  roles: Role[]
  createRole: (role: Omit<Role, 'id' | 'createdAt' | 'updatedAt'>) => Role
  updateRole: (id: string, updates: Partial<Role>) => void
  deleteRole: (id: string) => void
  getRole: (id: string) => Role | undefined

  // Permissions
  getAllPermissions: () => Permission[]
  getPermissionsByCategory: (category: PermissionCategory) => Permission[]
  getRolePermissions: (roleId: string) => Permission[]

  // Permission checking
  hasPermission: (userId: string, permissionId: string) => boolean
  hasAnyPermission: (userId: string, permissionIds: string[]) => boolean
  hasAllPermissions: (userId: string, permissionIds: string[]) => boolean
  canPerformAction: (userId: string, action: string, resource?: any) => PermissionCheckResult

  // Field permissions
  canEditField: (userId: string, resource: string, fieldName: string) => boolean
  canViewField: (userId: string, resource: string, fieldName: string) => boolean

  // User role assignment
  assignRoleToUser: (userId: string, roleId: string) => void
  removeRoleFromUser: (userId: string, roleId: string) => void
  getUserRoles: (userId: string) => Role[]
  getEffectivePermissions: (userId: string) => EffectivePermissions

  // Utilities
  isAdmin: (userId: string) => boolean
  canAccessResource: (userId: string, resourceType: string, resourceId: string) => boolean
}

// Permission action types
export type PermissionAction =
  | 'view'
  | 'create'
  | 'edit'
  | 'delete'
  | 'assign'
  | 'approve'
  | 'delegate'
  | 'export'
  | 'import'

// Resource types for permission checking
export type ResourceType =
  | 'project'
  | 'task'
  | 'subtask'
  | 'file'
  | 'document'
  | 'issue'
  | 'approval'
  | 'user'
  | 'role'
  | 'settings'
  | 'workflow_rule'
  | 'template'
