# RBAC System Documentation

## Overview

InteriorsFlow now includes a comprehensive Role-Based Access Control (RBAC) system that allows fine-grained permission management for users, roles, and resources. This system provides multi-level scoping, field-level permissions, and dynamic permission evaluation.

## Table of Contents

1. [Architecture](#architecture)
2. [Core Concepts](#core-concepts)
3. [Permission System](#permission-system)
4. [Role Management](#role-management)
5. [User Management](#user-management)
6. [Permission Enforcement](#permission-enforcement)
7. [API Reference](#api-reference)
8. [Usage Examples](#usage-examples)

---

## Architecture

### Context Hierarchy

```
RBACProvider
├── Manages roles and permissions
├── Provides permission checking methods
└── Evaluates effective permissions per user

UserProvider
├── Manages user CRUD operations
├── Stores user role assignments
└── Handles user authentication state
```

### Key Files

- **Types**: `src/types/rbac.ts`
- **Context**: `src/contexts/RBACContext.tsx`
- **Permissions**: `src/lib/permissions.ts`
- **Roles**: `src/lib/roleTemplates.ts`
- **UI Components**: `src/components/settings/`

---

## Core Concepts

### 1. Permissions

A permission defines a specific action that can be performed on a resource.

```typescript
interface Permission {
  id: string                    // e.g., "project.edit.own"
  name: string                  // Human-readable name
  description: string           // What this permission allows
  category: PermissionCategory  // Grouping category
  scope?: PermissionScope       // Access level (own/department/all)
  requiresAdmin?: boolean       // Admin-only flag
}
```

**Permission ID Format**: `{resource}.{action}.{scope?}`

Examples:
- `project.view.all` - View all projects
- `task.edit.own` - Edit tasks you created/are assigned to
- `file.upload` - Upload files (no scope = applies universally)

### 2. Permission Scopes

Three levels of access:

| Scope | Description | Example |
|-------|-------------|---------|
| `own` | Only resources owned/assigned to the user | Tasks assigned to you |
| `department` | Resources in user's department stages | Tasks in Design stage (for Design dept) |
| `all` | All resources in the system | Admin access |

### 3. Roles

A role is a collection of permissions assigned to users.

```typescript
interface Role {
  id: string
  name: string
  description: string
  permissions: string[]           // Permission IDs
  fieldPermissions?: FieldPermission[]
  isSystem: boolean              // System roles can't be deleted
  departmentRestriction?: Department
}
```

### 4. Field Permissions

Control access to specific fields within a resource.

```typescript
interface FieldPermission {
  id: string                    // e.g., "project.field.budget"
  resourceType: string          // Resource name
  fieldName: string             // Field name
  allowedActions: ('view' | 'edit')[]
}
```

---

## Permission System

### Permission Categories

The system includes **80+ permissions** across 7 categories:

#### 1. Project Permissions (11)
- `project.view.{own|department|all}`
- `project.create`
- `project.edit.{own|all}`
- `project.delete.{own|all}`
- `project.manage_team`
- `project.change_status`

#### 2. Task Permissions (13)
- `task.view.{own|department|all}`
- `task.create`
- `task.edit.{own|all}`
- `task.delete.{own|all}`
- `task.assign`
- `task.change_status`
- `task.manage_subtasks`
- `task.manage_checklists`

#### 3. File Permissions (7)
- `file.view.{own|department|all}`
- `file.upload`
- `file.download`
- `file.delete`
- `file.manage_status`

#### 4. Document Permissions (9)
- `document.view.{own|department|all}`
- `document.upload`
- `document.edit.{own|all}`
- `document.delete`
- `document.approve`
- `document.reject`

#### 5. Stage Permissions (7)
- `stage.view`
- `stage.edit`
- `stage.complete`
- `stage.block`
- `stage.manage_metadata`

#### 6. Issue Permissions (9)
- `issue.view.{own|department|all}`
- `issue.create`
- `issue.edit.{own|all}`
- `issue.delete`
- `issue.assign`
- `issue.resolve`

#### 7. Approval Permissions (10)
- `approval.view.{own|department|all}`
- `approval.create`
- `approval.approve`
- `approval.reject`
- `approval.delegate`
- `approval.manage_rules`

### Permission Evaluation

The RBACContext evaluates permissions through:

1. **Direct Check**: `hasPermission(userId, permissionId)`
2. **Action Check**: `canPerformAction(userId, action, resource?)`
3. **Multiple Check**: `hasAnyPermission(userId, permissionIds[])`
4. **All Check**: `hasAllPermissions(userId, permissionIds[])`

**Evaluation Logic**:
```
1. Get user's roles
2. Collect all permissions from all roles
3. Handle wildcard (*) permission
4. Check scope requirements
5. Validate resource ownership
6. Return permission result
```

---

## Role Management

### Default Roles

#### Admin
- **Permissions**: `*` (wildcard - all permissions)
- **Description**: Full system access
- **Use Case**: System administrators

#### Project Manager
- **Permissions**: All project, task, file, document, stage, approval permissions
- **Scope**: Project-wide (all)
- **Use Case**: Project leads managing entire projects

#### Design Manager
- **Department**: Design
- **Permissions**: Department-scoped for Design stages
- **Use Case**: Design team leads

#### Technical Manager
- **Department**: Technical
- **Permissions**: Department-scoped for Technical Design stages
- **Use Case**: Technical team leads

#### Team Member
- **Permissions**: View department, edit/delete own
- **Scope**: Own + department (read-only)
- **Use Case**: Regular team members

#### Client
- **Permissions**: View own, approve documents
- **Scope**: Very limited
- **Use Case**: External clients

### Role CRUD Operations

```typescript
// Create custom role
const role = createRole({
  name: "Quality Inspector",
  description: "Quality control specialist",
  permissions: [
    "task.view.all",
    "issue.create",
    "issue.view.all",
    "document.approve"
  ],
  isSystem: false
})

// Update role
updateRole(roleId, {
  permissions: [...existingPermissions, "approval.approve"]
})

// Delete role (only non-system roles)
deleteRole(roleId)
```

---

## User Management

### User Interface

```typescript
interface User {
  id: string
  name: string
  email: string
  avatar: string
  department: Department
  role: string              // Legacy compatibility
  roleIds?: string[]        // RBAC: Multiple roles
  isActive?: boolean        // Account status
  createdAt?: string
  updatedAt?: string
  lastLogin?: string
}
```

### User CRUD Operations

#### Create User
```typescript
const newUser = createUser({
  name: "Jane Doe",
  email: "jane@company.com",
  avatar: "https://...",
  department: "Design",
  role: "designer",
  roleIds: ["role-designer", "role-team-member"]
})
```

#### Update User
```typescript
updateUser(userId, {
  name: "Jane Smith",
  roleIds: [...existingRoles, "role-design-manager"]
})
```

#### Activate/Deactivate
```typescript
deactivateUser(userId)  // Disable account
activateUser(userId)    // Re-enable account
```

#### Delete User
```typescript
deleteUser(userId)  // Permanent deletion
```

### User-Role Assignment

```typescript
// Assign role to user
assignRoleToUser(userId, roleId)

// Remove role from user
removeRoleFromUser(userId, roleId)

// Get user's roles
const userRoles = getUserRoles(userId)
```

---

## Permission Enforcement

### Context-Level Enforcement

Permission checks are enforced in data contexts:

#### ProjectContext
```typescript
const createProject = (data: CreateProjectForm) => {
  // Permission check
  if (!currentUser || !hasPermission(currentUser.id, 'project.create')) {
    console.warn('Permission denied: Cannot create projects')
    return
  }

  // Create project logic...
}
```

#### TaskContext
```typescript
const updateTask = (id: string, data: Partial<Task>) => {
  // Check if user can edit this specific task
  const task = allTasks[currentProject.id]?.find(t => t.id === id)
  const hasEditAll = hasPermission(currentUser.id, 'task.edit.all')
  const hasEditOwn = hasPermission(currentUser.id, 'task.edit.own')

  if (!hasEditAll && (!hasEditOwn || task.assignee?.id !== currentUser.id)) {
    console.warn('Permission denied: Cannot edit this task')
    return
  }

  // Update task logic...
}
```

#### FileContext
```typescript
const uploadFile = async (file: File, stage: WorkflowStage) => {
  if (!currentUser || !hasPermission(currentUser.id, 'file.upload')) {
    console.warn('Permission denied: Cannot upload files')
    return
  }

  // Upload file logic...
}
```

### UI-Level Enforcement

```typescript
import { useRBAC } from '@/contexts/RBACContext'
import { useUser } from '@/contexts/UserContext'

function MyComponent() {
  const { currentUser } = useUser()
  const { hasPermission } = useRBAC()

  const canCreateProject = currentUser &&
    hasPermission(currentUser.id, 'project.create')

  return (
    <div>
      {canCreateProject && (
        <Button onClick={handleCreate}>Create Project</Button>
      )}
    </div>
  )
}
```

### Resource-Level Checks

```typescript
// Check if user can edit a specific project
const permissionCheck = canPerformAction(
  currentUser.id,
  'project.edit',
  project  // Resource to check ownership
)

if (!permissionCheck.granted) {
  console.log(permissionCheck.reason)  // "Not the owner of this resource"
  console.log(permissionCheck.scope)   // "own"
}
```

---

## API Reference

### RBACContext Hooks

#### useRBAC()

Returns the RBAC context with all permission methods.

```typescript
const {
  // Roles
  roles,
  createRole,
  updateRole,
  deleteRole,
  getRole,

  // Permissions
  getAllPermissions,
  getPermissionsByCategory,
  getRolePermissions,

  // Permission checking
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  canPerformAction,

  // Field permissions
  canEditField,
  canViewField,

  // User role management
  assignRoleToUser,
  removeRoleFromUser,
  getUserRoles,
  getEffectivePermissions,

  // Utilities
  isAdmin,
  canAccessResource
} = useRBAC()
```

### Key Methods

#### hasPermission
```typescript
hasPermission(userId: string, permissionId: string): boolean
```
Check if user has a specific permission.

#### canPerformAction
```typescript
canPerformAction(
  userId: string,
  action: string,
  resource?: any
): PermissionCheckResult
```
Check if user can perform action on a resource, considering scope.

Returns:
```typescript
{
  granted: boolean
  reason?: string
  scope?: PermissionScope
}
```

#### getEffectivePermissions
```typescript
getEffectivePermissions(userId: string): EffectivePermissions
```
Get all permissions from all user's roles combined.

Returns:
```typescript
{
  userId: string
  permissions: Set<string>
  fieldPermissions: Map<string, FieldPermission>
  highestScope: Map<string, PermissionScope>
}
```

---

## Usage Examples

### Example 1: Restrict Button Based on Permission

```typescript
function CreateProjectButton() {
  const { currentUser } = useUser()
  const { hasPermission } = useRBAC()

  const canCreate = currentUser &&
    hasPermission(currentUser.id, 'project.create')

  if (!canCreate) {
    return null  // Hide button
  }

  return (
    <Button onClick={handleCreateProject}>
      Create New Project
    </Button>
  )
}
```

### Example 2: Conditional Rendering Based on Scope

```typescript
function TaskActions({ task }) {
  const { currentUser } = useUser()
  const { hasPermission } = useRBAC()

  const canEditAll = hasPermission(currentUser.id, 'task.edit.all')
  const canEditOwn = hasPermission(currentUser.id, 'task.edit.own')
  const isAssignee = task.assignee?.id === currentUser.id

  const showEdit = canEditAll || (canEditOwn && isAssignee)
  const showDelete = hasPermission(currentUser.id, 'task.delete.all')

  return (
    <div>
      {showEdit && <EditButton task={task} />}
      {showDelete && <DeleteButton task={task} />}
    </div>
  )
}
```

### Example 3: Custom Role for Vendor

```typescript
// Create vendor role with limited permissions
const vendorRole = createRole({
  name: "Vendor",
  description: "External vendor with limited access",
  permissions: [
    "file.view.own",
    "file.upload",
    "document.view.own",
    "document.upload",
    "message.send"
  ],
  isSystem: false
})

// Assign to vendor user
assignRoleToUser(vendorUserId, vendorRole.id)
```

### Example 4: Check Multiple Permissions

```typescript
function ApprovalActions({ approval }) {
  const { currentUser } = useUser()
  const { hasAnyPermission, hasAllPermissions } = useRBAC()

  // User needs any of these to view
  const canView = hasAnyPermission(currentUser.id, [
    'approval.view.all',
    'approval.view.department',
    'approval.view.own'
  ])

  // User needs all of these to manage
  const canManage = hasAllPermissions(currentUser.id, [
    'approval.approve',
    'approval.reject',
    'approval.delegate'
  ])

  return (
    <div>
      {canView && <ApprovalCard approval={approval} />}
      {canManage && <ApprovalActions approval={approval} />}
    </div>
  )
}
```

---

## UI Components

### Settings Page Integration

Navigate to `/settings` → **Team & Access** tab to access RBAC UI.

### Components

#### RBACTab
Main container with two sub-tabs:
- **Roles & Permissions**: Role permission matrix
- **User Management**: User CRUD interface

#### UserManagementTab
Features:
- User statistics (total, active, inactive)
- Search and filter users
- Create/Edit/Delete users
- Activate/Deactivate accounts
- Role assignment

#### RolePermissionMatrix
Visual matrix showing:
- Roles (columns)
- Permissions grouped by category (rows)
- Checkboxes for permission assignment
- Permission descriptions on hover

#### CreateUserDialog
Form with:
- Name, Email, Department
- Role selection (multi-select)
- Auto-generated avatar

#### EditUserDialog
Edit user details and role assignments

#### DeleteUserDialog
Confirmation dialog for user deletion

---

## Best Practices

### 1. Principle of Least Privilege
Assign minimum permissions needed for a role.

```typescript
// Good: Specific permissions
permissions: [
  "task.view.department",
  "task.edit.own",
  "file.view.department"
]

// Bad: Over-permissioned
permissions: ["*"]  // Unless truly admin
```

### 2. Use Scope Appropriately
Choose the narrowest scope that works.

```typescript
// Team member: own scope
"task.edit.own"

// Department lead: department scope
"task.edit.department"

// Admin: all scope
"task.edit.all"
```

### 3. Combine Permissions Logically
Group related permissions in roles.

```typescript
// Good: Logical grouping
const viewerRole = {
  permissions: [
    "project.view.all",
    "task.view.all",
    "file.view.all"
  ]
}

// Bad: Mixed responsibilities
const confusedRole = {
  permissions: [
    "project.view.all",
    "user.delete.all",  // Unrelated
    "file.upload"       // Inconsistent scope
  ]
}
```

### 4. Check Permissions at Multiple Levels

```typescript
// 1. Context level (data layer)
const updateTask = (id, data) => {
  if (!hasPermission(userId, 'task.edit')) return
  // Update logic
}

// 2. UI level (presentation layer)
{canEdit && <EditButton />}

// 3. API level (if using backend)
// Validate permissions server-side as well
```

### 5. Handle Permission Denials Gracefully

```typescript
const handleDelete = () => {
  if (!hasPermission(currentUser.id, 'project.delete.own')) {
    toast.error('You do not have permission to delete this project')
    return
  }

  deleteProject(projectId)
}
```

---

## Troubleshooting

### Issue: User can't see any data

**Check**:
1. User has active status: `user.isActive === true`
2. User has at least one role assigned: `user.roleIds.length > 0`
3. Role has appropriate view permissions
4. Department matches accessible stages (for department-scoped permissions)

### Issue: Permission changes not taking effect

**Solutions**:
1. Refresh the browser to reload context
2. Check if user needs to re-login
3. Verify role was saved to localStorage
4. Check browser console for permission warnings

### Issue: Admin can't perform action

**Check**:
1. Admin role has wildcard permission: `permissions: ['*']`
2. User actually has admin role assigned
3. Context is properly checking `isAdmin(userId)`

### Issue: Performance with many users/roles

**Optimizations**:
1. Memoize permission checks: `useMemo`
2. Cache effective permissions per user
3. Lazy-load permission matrix
4. Paginate user list

---

## Security Considerations

### Client-Side Only
⚠️ **Important**: This RBAC system is client-side only. For production:

1. **Backend Validation**: Always validate permissions on the server
2. **API Security**: Protect API endpoints with auth middleware
3. **Data Filtering**: Filter data server-side based on user permissions
4. **Audit Logs**: Track permission changes and user actions

### localStorage Security
- Permissions stored in browser localStorage
- Can be manipulated by user
- **Never trust client-side permissions for sensitive operations**

### Recommended Backend Integration
```typescript
// Frontend
const canDelete = hasPermission(userId, 'project.delete.all')
if (canDelete) {
  await api.deleteProject(projectId)  // Backend validates again
}

// Backend (example)
app.delete('/api/projects/:id', authenticate, authorize('project.delete'), ...)
```

---

## Future Enhancements

Potential improvements:

1. **Time-Based Permissions**: Permissions valid during certain hours
2. **Resource-Specific Roles**: Roles that apply to specific projects only
3. **Permission Templates**: Quick templates for common role combinations
4. **Permission Inheritance**: Role hierarchies with inherited permissions
5. **Audit Trail**: Log all permission checks and role changes
6. **Permission Request System**: Users can request elevated permissions
7. **Conditional Permissions**: Permissions based on resource state (e.g., only edit draft documents)
8. **Integration with Backend**: Sync with server-side authorization

---

## Support

For questions or issues:
- Check console warnings for permission denial reasons
- Review user roles in Settings → Team & Access
- Verify permission IDs in `src/lib/permissions.ts`
- Check role definitions in `src/lib/roleTemplates.ts`

---

**Version**: 1.0.0
**Last Updated**: November 2025
**Author**: Claude Code AI Assistant
