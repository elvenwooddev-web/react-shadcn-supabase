/**
 * Permission Constants and Utilities
 * Defines all available permissions in the InteriorsFlow system
 */

import type { Permission, PermissionCategory } from '@/types/rbac'

// ============================================================================
// PROJECT PERMISSIONS
// ============================================================================

export const PROJECT_PERMISSIONS: Permission[] = [
  {
    id: 'project.view.own',
    name: 'View Own Projects',
    description: 'View projects where user is assigned as team member or PM',
    category: 'project',
    scope: 'own',
  },
  {
    id: 'project.view.department',
    name: 'View Department Projects',
    description: 'View all projects in user\'s department',
    category: 'project',
    scope: 'department',
  },
  {
    id: 'project.view.all',
    name: 'View All Projects',
    description: 'View any project in the system',
    category: 'project',
    scope: 'all',
  },
  {
    id: 'project.create',
    name: 'Create Projects',
    description: 'Create new projects',
    category: 'project',
  },
  {
    id: 'project.edit.own',
    name: 'Edit Own Projects',
    description: 'Edit projects where user is PM',
    category: 'project',
    scope: 'own',
  },
  {
    id: 'project.edit.all',
    name: 'Edit All Projects',
    description: 'Edit any project',
    category: 'project',
    scope: 'all',
  },
  {
    id: 'project.delete.own',
    name: 'Delete Own Projects',
    description: 'Delete projects where user is PM',
    category: 'project',
    scope: 'own',
  },
  {
    id: 'project.delete.all',
    name: 'Delete All Projects',
    description: 'Delete any project',
    category: 'project',
    scope: 'all',
    requiresAdmin: true,
  },
  {
    id: 'project.manage_team',
    name: 'Manage Project Team',
    description: 'Add/remove team members from projects',
    category: 'project',
  },
  {
    id: 'project.change_status',
    name: 'Change Project Status',
    description: 'Modify project status (active/on-hold/completed/archived)',
    category: 'project',
  },
]

// ============================================================================
// TASK PERMISSIONS
// ============================================================================

export const TASK_PERMISSIONS: Permission[] = [
  {
    id: 'task.view.own',
    name: 'View Own Tasks',
    description: 'View tasks assigned to user',
    category: 'task',
    scope: 'own',
  },
  {
    id: 'task.view.department',
    name: 'View Department Tasks',
    description: 'View all tasks in user\'s department stages',
    category: 'task',
    scope: 'department',
  },
  {
    id: 'task.view.all',
    name: 'View All Tasks',
    description: 'View any task in the system',
    category: 'task',
    scope: 'all',
  },
  {
    id: 'task.create',
    name: 'Create Tasks',
    description: 'Create new tasks',
    category: 'task',
  },
  {
    id: 'task.edit.own',
    name: 'Edit Own Tasks',
    description: 'Edit tasks assigned to user',
    category: 'task',
    scope: 'own',
  },
  {
    id: 'task.edit.department',
    name: 'Edit Department Tasks',
    description: 'Edit tasks in user\'s department',
    category: 'task',
    scope: 'department',
  },
  {
    id: 'task.edit.all',
    name: 'Edit All Tasks',
    description: 'Edit any task',
    category: 'task',
    scope: 'all',
  },
  {
    id: 'task.delete.own',
    name: 'Delete Own Tasks',
    description: 'Delete tasks created by user',
    category: 'task',
    scope: 'own',
  },
  {
    id: 'task.delete.all',
    name: 'Delete All Tasks',
    description: 'Delete any task',
    category: 'task',
    scope: 'all',
  },
  {
    id: 'task.assign',
    name: 'Assign Tasks',
    description: 'Assign tasks to team members',
    category: 'task',
  },
  {
    id: 'task.change_status',
    name: 'Change Task Status',
    description: 'Modify task status',
    category: 'task',
  },
  {
    id: 'task.change_priority',
    name: 'Change Task Priority',
    description: 'Modify task priority',
    category: 'task',
  },
  {
    id: 'task.manage_subtasks',
    name: 'Manage Subtasks',
    description: 'Create, edit, delete subtasks',
    category: 'task',
  },
  {
    id: 'task.manage_checklists',
    name: 'Manage Checklists',
    description: 'Create, edit, delete checklist items',
    category: 'task',
  },
]

// ============================================================================
// FILE PERMISSIONS
// ============================================================================

export const FILE_PERMISSIONS: Permission[] = [
  {
    id: 'file.view',
    name: 'View Files',
    description: 'View required files',
    category: 'file',
  },
  {
    id: 'file.upload',
    name: 'Upload Files',
    description: 'Upload files to fulfill requirements',
    category: 'file',
  },
  {
    id: 'file.download',
    name: 'Download Files',
    description: 'Download uploaded files',
    category: 'file',
  },
  {
    id: 'file.delete',
    name: 'Delete Files',
    description: 'Delete uploaded files',
    category: 'file',
  },
  {
    id: 'file.mark_received',
    name: 'Mark Files as Received',
    description: 'Mark required files as received',
    category: 'file',
  },
]

// ============================================================================
// DOCUMENT PERMISSIONS
// ============================================================================

export const DOCUMENT_PERMISSIONS: Permission[] = [
  {
    id: 'document.view',
    name: 'View Documents',
    description: 'View stage documents',
    category: 'document',
  },
  {
    id: 'document.upload',
    name: 'Upload Documents',
    description: 'Upload stage documents',
    category: 'document',
  },
  {
    id: 'document.download',
    name: 'Download Documents',
    description: 'Download documents',
    category: 'document',
  },
  {
    id: 'document.delete',
    name: 'Delete Documents',
    description: 'Delete documents',
    category: 'document',
  },
  {
    id: 'document.approve',
    name: 'Approve Documents',
    description: 'Approve/reject stage documents',
    category: 'document',
  },
]

// ============================================================================
// APPROVAL PERMISSIONS
// ============================================================================

export const APPROVAL_PERMISSIONS: Permission[] = [
  {
    id: 'approval.view.own',
    name: 'View Own Approvals',
    description: 'View approval requests assigned to user',
    category: 'approval',
    scope: 'own',
  },
  {
    id: 'approval.view.all',
    name: 'View All Approvals',
    description: 'View all approval requests',
    category: 'approval',
    scope: 'all',
  },
  {
    id: 'approval.create',
    name: 'Create Approval Requests',
    description: 'Create manual approval requests',
    category: 'approval',
  },
  {
    id: 'approval.approve',
    name: 'Approve Requests',
    description: 'Approve approval requests assigned to user',
    category: 'approval',
  },
  {
    id: 'approval.reject',
    name: 'Reject Requests',
    description: 'Reject approval requests',
    category: 'approval',
  },
  {
    id: 'approval.delegate',
    name: 'Delegate Approvals',
    description: 'Delegate approval requests to other users',
    category: 'approval',
  },
  {
    id: 'approval.manage_rules',
    name: 'Manage Approval Rules',
    description: 'Create/edit/delete approval rules',
    category: 'approval',
  },
]

// ============================================================================
// ISSUE PERMISSIONS
// ============================================================================

export const ISSUE_PERMISSIONS: Permission[] = [
  {
    id: 'issue.view.own',
    name: 'View Own Issues',
    description: 'View issues assigned to user or created by user',
    category: 'issue',
    scope: 'own',
  },
  {
    id: 'issue.view.all',
    name: 'View All Issues',
    description: 'View all issues across projects',
    category: 'issue',
    scope: 'all',
  },
  {
    id: 'issue.create',
    name: 'Create Issues',
    description: 'Create new issues from tasks',
    category: 'issue',
  },
  {
    id: 'issue.edit.own',
    name: 'Edit Own Issues',
    description: 'Edit issues created by user',
    category: 'issue',
    scope: 'own',
  },
  {
    id: 'issue.edit.all',
    name: 'Edit All Issues',
    description: 'Edit any issue',
    category: 'issue',
    scope: 'all',
  },
  {
    id: 'issue.delete',
    name: 'Delete Issues',
    description: 'Delete issues',
    category: 'issue',
  },
  {
    id: 'issue.resolve',
    name: 'Resolve Issues',
    description: 'Mark issues as resolved',
    category: 'issue',
  },
]

// ============================================================================
// TEAM PERMISSIONS
// ============================================================================

export const TEAM_PERMISSIONS: Permission[] = [
  {
    id: 'team.view',
    name: 'View Team Members',
    description: 'View team member list',
    category: 'team',
  },
  {
    id: 'team.invite',
    name: 'Invite Team Members',
    description: 'Add team members to projects',
    category: 'team',
  },
  {
    id: 'team.remove',
    name: 'Remove Team Members',
    description: 'Remove team members from projects',
    category: 'team',
  },
  {
    id: 'team.view_activity',
    name: 'View Activity Feed',
    description: 'View team activity and history',
    category: 'team',
  },
]

// ============================================================================
// SETTINGS PERMISSIONS
// ============================================================================

export const SETTINGS_PERMISSIONS: Permission[] = [
  {
    id: 'settings.view',
    name: 'View Settings',
    description: 'Access settings page',
    category: 'settings',
  },
  {
    id: 'settings.workflow_rules',
    name: 'Manage Workflow Rules',
    description: 'Create/edit/delete workflow rules',
    category: 'settings',
  },
  {
    id: 'settings.status_config',
    name: 'Manage Status Configuration',
    description: 'Configure custom statuses',
    category: 'settings',
    requiresAdmin: true,
  },
  {
    id: 'settings.templates',
    name: 'Manage Templates',
    description: 'Create/edit/delete project templates',
    category: 'settings',
  },
  {
    id: 'settings.users',
    name: 'Manage Users',
    description: 'Create/edit/delete users',
    category: 'settings',
    requiresAdmin: true,
  },
  {
    id: 'settings.roles',
    name: 'Manage Roles & Permissions',
    description: 'Create/edit/delete roles and assign permissions',
    category: 'settings',
    requiresAdmin: true,
  },
]

// ============================================================================
// ALL PERMISSIONS COMBINED
// ============================================================================

export const ALL_PERMISSIONS: Permission[] = [
  ...PROJECT_PERMISSIONS,
  ...TASK_PERMISSIONS,
  ...FILE_PERMISSIONS,
  ...DOCUMENT_PERMISSIONS,
  ...APPROVAL_PERMISSIONS,
  ...ISSUE_PERMISSIONS,
  ...TEAM_PERMISSIONS,
  ...SETTINGS_PERMISSIONS,
]

// ============================================================================
// PERMISSION GROUPS (for UI organization)
// ============================================================================

export const PERMISSION_GROUPS = [
  { category: 'project' as PermissionCategory, label: 'Project Management', icon: 'Briefcase' },
  { category: 'task' as PermissionCategory, label: 'Task Management', icon: 'CheckSquare' },
  { category: 'file' as PermissionCategory, label: 'File Management', icon: 'FileText' },
  { category: 'document' as PermissionCategory, label: 'Document Management', icon: 'FolderOpen' },
  { category: 'approval' as PermissionCategory, label: 'Approvals', icon: 'Shield' },
  { category: 'issue' as PermissionCategory, label: 'Issues', icon: 'AlertTriangle' },
  { category: 'team' as PermissionCategory, label: 'Team Collaboration', icon: 'Users' },
  { category: 'settings' as PermissionCategory, label: 'Settings & Administration', icon: 'Settings' },
]

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get all permissions for a specific category
 */
export function getPermissionsByCategory(category: PermissionCategory): Permission[] {
  return ALL_PERMISSIONS.filter(p => p.category === category)
}

/**
 * Get permission by ID
 */
export function getPermission(permissionId: string): Permission | undefined {
  return ALL_PERMISSIONS.find(p => p.id === permissionId)
}

/**
 * Check if permission requires admin
 */
export function isAdminPermission(permissionId: string): boolean {
  const permission = getPermission(permissionId)
  return permission?.requiresAdmin === true
}

/**
 * Get all admin-only permissions
 */
export function getAdminPermissions(): Permission[] {
  return ALL_PERMISSIONS.filter(p => p.requiresAdmin === true)
}

/**
 * Parse permission ID into components
 * e.g., 'task.edit.own' => { resource: 'task', action: 'edit', scope: 'own' }
 */
export function parsePermissionId(permissionId: string) {
  const parts = permissionId.split('.')
  return {
    resource: parts[0],
    action: parts[1],
    scope: parts[2] || 'all',
  }
}

/**
 * Check if one scope level includes another
 * e.g., 'all' includes 'department', 'department' includes 'own'
 */
export function scopeIncludes(grantedScope: string, requiredScope: string): boolean {
  const hierarchy = ['own', 'department', 'all']
  const grantedLevel = hierarchy.indexOf(grantedScope)
  const requiredLevel = hierarchy.indexOf(requiredScope)
  return grantedLevel >= requiredLevel
}

/**
 * Get the highest scope from a list of permissions
 */
export function getHighestScope(scopes: string[]): string {
  if (scopes.includes('all')) return 'all'
  if (scopes.includes('department')) return 'department'
  if (scopes.includes('own')) return 'own'
  return 'own'
}

/**
 * Filter permissions by search query
 */
export function searchPermissions(query: string): Permission[] {
  const lowerQuery = query.toLowerCase()
  return ALL_PERMISSIONS.filter(p =>
    p.name.toLowerCase().includes(lowerQuery) ||
    p.description.toLowerCase().includes(lowerQuery) ||
    p.id.toLowerCase().includes(lowerQuery)
  )
}
