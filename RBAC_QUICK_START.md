# RBAC Quick Start Guide

This guide will help you quickly test and understand the RBAC (Role-Based Access Control) system in InteriorsFlow.

## Prerequisites

- Dev server running: `npm run dev`
- Browser open at: `http://localhost:5173`

---

## Step 1: Access RBAC Settings

1. Navigate to **http://localhost:5173/settings**
2. Click on the **"Team & Access"** tab
3. You'll see two sub-tabs:
   - **Roles & Permissions**: Permission matrix view
   - **User Management**: User administration

---

## Step 2: View Existing Users

1. Click on **"User Management"** sub-tab
2. You'll see default users:
   - **Admin User** (Admin department)
   - **Sales Manager** (Sales department)
   - **Anna Kendrick** (Design department)
   - **Jane Foster** (Technical department)
   - **Procurement Lead** (Procurement department)
   - **Production Manager** (Production department)
   - **Site Supervisor** (Execution department)

3. **User Statistics** shown at top:
   - Total Users
   - Active Users
   - Inactive Users

---

## Step 3: Create a New User

1. Click **"Add User"** button (top right)
2. Fill in the form:
   - **Name**: John Smith
   - **Email**: john.smith@company.com
   - **Department**: Design
   - **Roles**: Check "Design Manager" and "Team Member"
3. Click **"Create User"**
4. New user appears in the list with assigned roles

---

## Step 4: View Role Permissions

1. Click on **"Roles & Permissions"** sub-tab
2. You'll see a matrix with:
   - **Rows**: Permissions grouped by category
   - **Columns**: Available roles
   - **Checkboxes**: Permission assignments

3. **Permission Categories**:
   - Project Management (11 permissions)
   - Task Management (13 permissions)
   - File Management (7 permissions)
   - Document Management (9 permissions)
   - Stage Management (7 permissions)
   - Issue Management (9 permissions)
   - Approval Management (10 permissions)

4. **Hover** over permission names to see descriptions

---

## Step 5: Test Permission Scoping

### Scenario: Compare Admin vs Team Member

1. **Admin User** (already exists):
   - Has `*` (wildcard) permission = ALL permissions
   - Can view/edit/delete everything
   - Full system access

2. **Create Team Member User**:
   - Name: "Test User"
   - Role: "Team Member"
   - Expected permissions:
     - ✅ View department resources
     - ✅ Edit/delete OWN resources only
     - ❌ Can't delete other users' tasks
     - ❌ Can't edit all projects

### Test the Difference:

1. **As Admin**:
   - Go to `/projects`
   - Click on a project
   - Create a task
   - Notice: Can edit ANY task

2. **Simulate Team Member** (via DepartmentSwitcher):
   - Use the department switcher in the sidebar
   - Switch to "Design" department
   - Notice: Can only see Design stage tasks
   - Try to edit other users' tasks (permission denied in console)

---

## Step 6: Test User Management Operations

### Edit a User

1. In User Management tab, find a user
2. Click the **Edit** icon (pencil)
3. Modify:
   - Name
   - Email
   - Department
   - Roles (add/remove)
4. Click **"Update User"**
5. Changes reflect immediately

### Deactivate a User

1. Find user in list (not yourself!)
2. Click the **Deactivate** icon (X circle, orange)
3. User status changes to "Inactive"
4. Badge shows "Inactive" (gray)

### Reactivate a User

1. Filter by **"Inactive Only"** dropdown
2. Click the **Activate** icon (check circle, green)
3. User status changes to "Active"

### Delete a User

1. Find user in list (not yourself!)
2. Click the **Delete** icon (trash, red)
3. Confirmation dialog appears
4. Type exact user name to confirm
5. Click **"Delete User"**
6. User removed from list

### Protection Features

- ❌ Cannot edit yourself (Edit button disabled)
- ❌ Cannot deactivate yourself
- ❌ Cannot delete yourself
- ✅ Shows "You" badge next to your user

---

## Step 7: Test Search and Filters

### Search Users

1. Use search box: "Search users by name or email..."
2. Type: "anna"
3. List filters to matching users

### Filter by Status

1. Click **"All Status"** dropdown
2. Select **"Active Only"** or **"Inactive Only"**
3. List updates

### Filter by Department

1. Click **"All Departments"** dropdown
2. Select a department (e.g., "Design")
3. Only users in that department shown

### Combine Filters

1. Search: "manager"
2. Status: "Active Only"
3. Department: "Sales"
4. Result: Only active Sales managers

---

## Step 8: Understand Permission Enforcement

### Permission Checking in Console

Open browser console (F12) and perform actions:

#### Create Project without Permission

```javascript
// 1. Remove create permission from current user's role
// 2. Try to create a project
// Console output: "Permission denied: Cannot create projects"
```

#### Edit Another User's Task

```javascript
// 1. As Team Member role
// 2. Try to edit task not assigned to you
// Console output: "Permission denied: Cannot edit this task"
```

#### Delete Project without Permission

```javascript
// 1. As non-admin user
// 2. Try to delete a project
// Console output: "Permission denied: Cannot delete this project"
```

### UI Enforcement

Notice buttons/actions are hidden/disabled based on permissions:

- **No "Add User" button** if you lack `user.create` permission
- **No "Delete" icon** if you lack `user.delete` permission
- **Edit button disabled** for your own user

---

## Step 9: Create Custom Role

Let's create a "Quality Inspector" role:

1. Go to **Roles & Permissions** tab
2. Currently, roles are predefined
3. **To create custom role** (via code):

```typescript
// In browser console or component:
const { createRole } = useRBAC()

createRole({
  name: "Quality Inspector",
  description: "QA specialist with limited permissions",
  permissions: [
    "project.view.all",
    "task.view.all",
    "task.create",
    "issue.create",
    "issue.view.all",
    "document.view.all",
    "document.approve",
    "document.reject"
  ],
  isSystem: false
})
```

4. Refresh page to see new role in matrix
5. Assign to users via User Management

---

## Step 10: Verify localStorage Persistence

### Check Stored Data

1. Open browser DevTools (F12)
2. Go to **Application** → **Local Storage**
3. Check keys:
   - `roles` - All system roles
   - `users` - All users with roleIds
   - `currentUser` - Currently logged-in user

### Test Persistence

1. Create a new user
2. Refresh page (F5)
3. User still exists ✅
4. Clear localStorage:
   ```javascript
   localStorage.clear()
   ```
5. Refresh page
6. Default data reloads ✅

---

## Common Test Scenarios

### Scenario 1: Department Lead Access

**Setup**:
- Create user: "Design Lead"
- Department: Design
- Role: Design Manager

**Expected Behavior**:
- ✅ Can view ALL Design stage tasks
- ✅ Can edit Design stage tasks
- ❌ Cannot view Sales/Production stage tasks
- ✅ Can approve Design documents
- ❌ Cannot delete projects

**Test**:
1. Switch to Design department
2. Go to project → Workflow page
3. Filter tasks by stage
4. Verify only Design/Technical tasks visible

---

### Scenario 2: Read-Only User

**Setup**:
- Create user: "Observer"
- Role: Create custom role with only view permissions:
  ```typescript
  permissions: [
    "project.view.all",
    "task.view.all",
    "file.view.all",
    "document.view.all"
  ]
  ```

**Expected Behavior**:
- ✅ Can view everything
- ❌ Cannot create anything
- ❌ Cannot edit anything
- ❌ Cannot delete anything

**Test**:
1. Assign Observer role to test user
2. No "Add Task" buttons visible
3. No "Edit" or "Delete" icons visible
4. All data visible but read-only

---

### Scenario 3: External Client

**Setup**:
- Create user: "Client Smith"
- Department: Sales (or create "Client" department)
- Role: Client

**Expected Behavior**:
- ✅ Can view assigned projects only
- ✅ Can approve/reject documents
- ✅ Can add comments
- ❌ Cannot create projects
- ❌ Cannot edit tasks
- ❌ Cannot manage team

**Test**:
1. Assign Client role
2. Very limited UI access
3. Can only see project overview
4. Can interact with approvals

---

## Debugging Tips

### Issue: User can't see expected data

**Check**:
```javascript
// In browser console:
const { getUserRoles, getEffectivePermissions } = useRBAC()
const { currentUser } = useUser()

// 1. Check user's roles
console.log('User roles:', getUserRoles(currentUser.id))

// 2. Check effective permissions
const perms = getEffectivePermissions(currentUser.id)
console.log('Permissions:', Array.from(perms.permissions))

// 3. Check specific permission
console.log('Can create project?',
  perms.permissions.has('project.create'))
```

### Issue: Permission changes not working

**Solutions**:
1. Hard refresh: Ctrl + Shift + R (Windows) / Cmd + Shift + R (Mac)
2. Clear browser cache
3. Clear localStorage:
   ```javascript
   localStorage.clear()
   location.reload()
   ```
4. Check browser console for warnings

### Issue: Role not showing in matrix

**Check**:
1. Role properly created and saved
2. Check localStorage `roles` key
3. Verify role has valid permissions array
4. Refresh page

### Issue: Can't delete user

**Reasons**:
- Trying to delete yourself (protected)
- User is the current logged-in user
- Check console for warning message

---

## Testing Checklist

Use this checklist to verify RBAC functionality:

### User Management
- [ ] Create new user
- [ ] Edit user name/email
- [ ] Edit user department
- [ ] Add role to user
- [ ] Remove role from user
- [ ] Deactivate user
- [ ] Reactivate user
- [ ] Delete user
- [ ] Search users by name
- [ ] Search users by email
- [ ] Filter by active status
- [ ] Filter by department
- [ ] View user statistics

### Role Management
- [ ] View permission matrix
- [ ] See all default roles
- [ ] Hover to see permission descriptions
- [ ] Identify system roles (cannot delete)
- [ ] Create custom role (via code)

### Permission Enforcement
- [ ] Try to create project without permission (fails)
- [ ] Try to edit another user's task (fails)
- [ ] Try to delete project without permission (fails)
- [ ] UI buttons hidden when lacking permission
- [ ] Console shows permission warnings
- [ ] Admin can do everything

### Scope Testing
- [ ] Own scope: Can only edit assigned tasks
- [ ] Department scope: Can view department tasks
- [ ] All scope: Can view all tasks (admin)

### Persistence
- [ ] Create user → refresh → user persists
- [ ] Update role → refresh → changes persist
- [ ] Clear localStorage → defaults reload

---

## Performance Monitoring

### Check Permission Evaluation Speed

```javascript
// In browser console:
const { hasPermission } = useRBAC()
const { currentUser } = useUser()

console.time('permission-check')
for (let i = 0; i < 1000; i++) {
  hasPermission(currentUser.id, 'project.view.all')
}
console.timeEnd('permission-check')
// Should be < 50ms for 1000 checks
```

### Monitor Context Re-renders

```javascript
// Add to RBACContext:
console.log('RBACContext rendered')

// Should only render on role/permission changes
```

---

## Next Steps

After testing:

1. **Customize Roles**: Create roles specific to your organization
2. **Add More Permissions**: Extend permissions for new features
3. **Backend Integration**: Connect to real authentication system
4. **Audit Logging**: Track permission changes
5. **UI Polish**: Improve permission denial messages
6. **Documentation**: Update team docs with role assignments

---

## Reference

- **Full Documentation**: See `RBAC_DOCUMENTATION.md`
- **Permission List**: Check `src/lib/permissions.ts`
- **Role Definitions**: Check `src/lib/roleTemplates.ts`
- **Type Definitions**: Check `src/types/rbac.ts`

---

**Happy Testing!** 🎉

If you encounter issues, check the browser console for detailed permission warnings and error messages.
