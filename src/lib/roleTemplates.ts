/**
 * Default Role Templates
 * Pre-configured roles for quick setup
 */

import type { Role } from '@/types/rbac'

const timestamp = new Date().toISOString()

// ============================================================================
// SYSTEM ROLES (Cannot be deleted)
// ============================================================================

export const ADMIN_ROLE: Role = {
  id: 'role-admin',
  name: 'Administrator',
  description: 'Full system access with all permissions',
  isSystem: true,
  permissions: ['*'], // Wildcard grants all permissions
  createdAt: timestamp,
  updatedAt: timestamp,
}

export const MANAGER_ROLE: Role = {
  id: 'role-manager',
  name: 'Project Manager',
  description: 'Can manage projects, tasks, team members, and approvals',
  isSystem: true,
  permissions: [
    // Project permissions
    'project.view.all',
    'project.create',
    'project.edit.all',
    'project.delete.own',
    'project.manage_team',
    'project.change_status',

    // Task permissions
    'task.view.all',
    'task.create',
    'task.edit.all',
    'task.delete.all',
    'task.assign',
    'task.change_status',
    'task.change_priority',
    'task.manage_subtasks',
    'task.manage_checklists',

    // File permissions
    'file.view',
    'file.upload',
    'file.download',
    'file.delete',
    'file.mark_received',

    // Document permissions
    'document.view',
    'document.upload',
    'document.download',
    'document.delete',
    'document.approve',

    // Approval permissions
    'approval.view.all',
    'approval.create',
    'approval.approve',
    'approval.reject',
    'approval.delegate',
    'approval.manage_rules',

    // Issue permissions
    'issue.view.all',
    'issue.create',
    'issue.edit.all',
    'issue.delete',
    'issue.resolve',

    // Team permissions
    'team.view',
    'team.invite',
    'team.remove',
    'team.view_activity',

    // Settings permissions (limited)
    'settings.view',
    'settings.workflow_rules',
    'settings.templates',
  ],
  createdAt: timestamp,
  updatedAt: timestamp,
}

export const MEMBER_ROLE: Role = {
  id: 'role-member',
  name: 'Team Member',
  description: 'Standard team member with task and file management access',
  isSystem: true,
  permissions: [
    // Project permissions (limited)
    'project.view.own',
    'project.create',
    'project.edit.own',

    // Task permissions (own/department)
    'task.view.department',
    'task.create',
    'task.edit.own',
    'task.delete.own',
    'task.change_status',
    'task.change_priority',
    'task.manage_subtasks',
    'task.manage_checklists',

    // File permissions
    'file.view',
    'file.upload',
    'file.download',

    // Document permissions
    'document.view',
    'document.upload',
    'document.download',

    // Approval permissions (limited)
    'approval.view.own',
    'approval.create',
    'approval.approve',

    // Issue permissions
    'issue.view.own',
    'issue.create',
    'issue.edit.own',

    // Team permissions
    'team.view',
    'team.view_activity',

    // Settings (view only)
    'settings.view',
  ],
  createdAt: timestamp,
  updatedAt: timestamp,
}

export const VIEWER_ROLE: Role = {
  id: 'role-viewer',
  name: 'Viewer',
  description: 'Read-only access to assigned projects and tasks',
  isSystem: true,
  permissions: [
    // Project permissions (view only)
    'project.view.own',

    // Task permissions (view only)
    'task.view.own',
    'task.change_status', // Can mark own tasks complete

    // File permissions (view + download)
    'file.view',
    'file.download',

    // Document permissions (view only)
    'document.view',
    'document.download',

    // Approval permissions (view only)
    'approval.view.own',

    // Issue permissions (view only)
    'issue.view.own',

    // Team permissions (view only)
    'team.view',
    'team.view_activity',

    // Settings (view only)
    'settings.view',
  ],
  createdAt: timestamp,
  updatedAt: timestamp,
}

// ============================================================================
// DEPARTMENT-SPECIFIC ROLE TEMPLATES
// ============================================================================

export const SALES_LEAD_ROLE: Role = {
  id: 'role-sales-lead',
  name: 'Sales Lead',
  description: 'Sales department head with full sales stage access',
  isSystem: false,
  permissions: [
    'project.view.all',
    'project.create',
    'project.edit.all',
    'project.manage_team',
    'task.view.all',
    'task.create',
    'task.edit.all',
    'task.assign',
    'task.change_status',
    'task.change_priority',
    'file.view',
    'file.upload',
    'file.mark_received',
    'document.view',
    'document.upload',
    'document.approve',
    'approval.view.all',
    'approval.create',
    'approval.approve',
    'approval.delegate',
    'team.view',
    'team.invite',
    'settings.view',
  ],
  createdAt: timestamp,
  updatedAt: timestamp,
}

export const DESIGN_LEAD_ROLE: Role = {
  id: 'role-design-lead',
  name: 'Design Lead',
  description: 'Design department head with full design stage access',
  isSystem: false,
  permissions: [
    'project.view.department',
    'project.edit.own',
    'task.view.department',
    'task.create',
    'task.edit.department',
    'task.assign',
    'task.change_status',
    'task.manage_subtasks',
    'file.view',
    'file.upload',
    'file.download',
    'document.view',
    'document.upload',
    'document.approve',
    'approval.view.all',
    'approval.approve',
    'issue.view.all',
    'issue.create',
    'issue.resolve',
    'team.view',
    'settings.view',
    'settings.templates',
  ],
  createdAt: timestamp,
  updatedAt: timestamp,
}

export const CONTRACTOR_ROLE: Role = {
  id: 'role-contractor',
  name: 'Contractor',
  description: 'External contractor with limited access to specific projects',
  isSystem: false,
  permissions: [
    'project.view.own',
    'task.view.own',
    'task.change_status',
    'file.view',
    'file.upload',
    'document.view',
    'document.upload',
    'team.view',
  ],
  createdAt: timestamp,
  updatedAt: timestamp,
}

// ============================================================================
// ROLE TEMPLATES EXPORT
// ============================================================================

export const DEFAULT_ROLES: Role[] = [
  ADMIN_ROLE,
  MANAGER_ROLE,
  MEMBER_ROLE,
  VIEWER_ROLE,
  SALES_LEAD_ROLE,
  DESIGN_LEAD_ROLE,
  CONTRACTOR_ROLE,
]

/**
 * Get default role by ID
 */
export function getDefaultRole(roleId: string): Role | undefined {
  return DEFAULT_ROLES.find(r => r.id === roleId)
}

/**
 * Get system roles (cannot be deleted)
 */
export function getSystemRoles(): Role[] {
  return DEFAULT_ROLES.filter(r => r.isSystem)
}

/**
 * Get custom role templates (can be modified/deleted)
 */
export function getCustomRoleTemplates(): Role[] {
  return DEFAULT_ROLES.filter(r => !r.isSystem)
}

/**
 * Clone a role with new ID and name
 */
export function cloneRole(role: Role, newName: string): Omit<Role, 'id'> {
  return {
    name: newName,
    description: `Cloned from ${role.name}`,
    isSystem: false,
    permissions: [...role.permissions],
    fieldPermissions: role.fieldPermissions ? [...role.fieldPermissions] : undefined,
    department: role.department,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}

/**
 * Get role template by department
 */
export function getRoleByDepartment(department: string): Role {
  switch (department) {
    case 'Sales':
      return SALES_LEAD_ROLE
    case 'Design':
      return DESIGN_LEAD_ROLE
    case 'Admin':
      return ADMIN_ROLE
    default:
      return MEMBER_ROLE
  }
}
