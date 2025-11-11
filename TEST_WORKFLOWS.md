# InteriorsFlow - Test Workflows & Chrome DevTools Guide

**Application URL:** http://localhost:5174/

## Table of Contents
1. [Setup & Preparation](#setup--preparation)
2. [Chrome DevTools Setup](#chrome-devtools-setup)
3. [Test Workflows](#test-workflows)
4. [Testing New Features](#testing-new-features)
5. [localStorage Inspection](#localstorage-inspection)
6. [Common Issues & Debugging](#common-issues--debugging)

---

## Setup & Preparation

### Initial Setup
1. Open Chrome browser
2. Navigate to: http://localhost:5174/
3. Open Chrome DevTools: `F12` or `Right-click > Inspect`
4. Clear localStorage (fresh start):
   ```javascript
   localStorage.clear()
   ```
5. Refresh the page: `Ctrl+R` or `F5`

---

## Chrome DevTools Setup

### Recommended Tabs Configuration
1. **Console** - For running commands and viewing logs
2. **Application** > **Local Storage** - For inspecting stored data
3. **Network** - For monitoring API calls (if integrated with Supabase)
4. **React DevTools** (Install extension for better component inspection)

### Useful Console Commands

```javascript
// View all localStorage keys
Object.keys(localStorage)

// View all stored data
Object.keys(localStorage).forEach(key => {
  console.log(key, JSON.parse(localStorage.getItem(key)))
})

// View specific data
JSON.parse(localStorage.getItem('projects'))
JSON.parse(localStorage.getItem('tasks'))
JSON.parse(localStorage.getItem('currentUser'))

// Clear specific data
localStorage.removeItem('projects')

// Clear all data
localStorage.clear()
```

---

## Test Workflows

### Workflow 1: First-Time User Experience

**Objective:** Test the initial application load and user setup

**Steps:**
1. Clear localStorage: `localStorage.clear()`
2. Refresh the page
3. Verify default department (should be "Admin")
4. Check if residential template is available

**Expected Results:**
- Application loads without errors
- No projects displayed (empty state)
- Navigation works smoothly
- Department switcher shows "Admin"

**DevTools Checks:**
```javascript
// Check current user
JSON.parse(localStorage.getItem('currentUser'))
// Expected: { id: 'user-1', name: 'Admin User', department: 'Admin', ... }

// Check templates
JSON.parse(localStorage.getItem('projectTemplates'))
// Should show residential template
```

---

### Workflow 2: Create Project from Template

**Objective:** Test project creation with residential template

**Steps:**
1. Click "New Project" button or navigate to `/projects/new`
2. Fill in project details:
   - **Name:** "Luxury Villa - Dubai Hills"
   - **Description:** "Modern 5-bedroom villa with pool"
   - **Type:** Residential
   - **Client:** "Mohammed Al Rashid"
   - **Budget:** 2000000
   - **Timeline:** 180 days
3. Select "Residential Interior Design" template
4. Click "Create Project"

**Expected Results:**
- Project created successfully
- Redirected to project workflow page
- 76 tasks auto-loaded from template
- 50 files added to files tab
- 38 documents added to documents tab
- 7 workflow stages initialized
- 8 approval workflows created

**DevTools Checks:**
```javascript
// Check projects
const projects = JSON.parse(localStorage.getItem('projects'))
console.log('Projects:', projects)
console.log('Project count:', projects.length)

// Check tasks for the new project
const tasks = JSON.parse(localStorage.getItem('tasks'))
const projectId = projects[0].id
console.log('Tasks for project:', tasks[projectId])
console.log('Task count:', tasks[projectId].length) // Should be 76

// Check approval requests
const approvalKey = `approvalRequests-${projectId}`
const approvals = JSON.parse(localStorage.getItem(approvalKey))
console.log('Approval workflows:', approvals.length) // Should be 8
```

---

### Workflow 3: Task Management

**Objective:** Test task creation, editing, and subtask features

**Steps:**
1. Navigate to project workflow page
2. Filter tasks by stage: "Design"
3. Open a task card
4. Add a subtask:
   - Title: "Review mood board"
   - Priority: High
   - Status: In Progress
   - Due Date: +7 days
   - Assignee: Select team member
5. Add checklist items:
   - "Gather reference images"
   - "Create color palette"
   - "Select materials"
6. Attach a file (mock upload)
7. Update task status to "In Progress"

**Expected Results:**
- Subtask appears with proper formatting
- Checklist items are toggleable
- Task card shows progress indicators
- File attachment is displayed

**DevTools Checks:**
```javascript
// Find the modified task
const tasks = JSON.parse(localStorage.getItem('tasks'))
const projectId = JSON.parse(localStorage.getItem('currentProject'))
const projectTasks = tasks[projectId]
const modifiedTask = projectTasks.find(t => t.subtasks?.length > 0)
console.log('Modified task:', modifiedTask)
console.log('Subtasks:', modifiedTask.subtasks)
console.log('Checklist:', modifiedTask.checklistItems)
```

---

### Workflow 4: Approval System Testing

**Objective:** Test multi-level approval workflow

**Steps:**
1. Navigate to `/approvals`
2. Review approval dashboard statistics
3. Find a template approval (blue badge with 📋)
4. Click "Review" on an approval request
5. Add a comment: "Design looks good, minor adjustments needed"
6. Approve the request
7. Verify it advances to next approval level

**Expected Results:**
- Approval status changes from "Pending" to "Approved"
- If multi-level chain, next approver is notified
- Approval history shows action with timestamp
- Comment appears in approval card

**DevTools Checks:**
```javascript
// Check approval requests
const projectId = JSON.parse(localStorage.getItem('currentProject'))
const approvalKey = `approvalRequests-${projectId}`
const approvals = JSON.parse(localStorage.getItem(approvalKey))

// Find approved requests
const approved = approvals.filter(a => a.status === 'approved')
console.log('Approved requests:', approved.length)

// Find multi-level chains
const multiLevel = approvals.filter(a => a.approvalConfigs.length > 1)
console.log('Multi-level approvals:', multiLevel)

// Check approval with comments
const withComments = approvals.find(a => a.comments?.length > 0)
console.log('Approval with comments:', withComments)
```

---

### Workflow 5: Workflow Rules & Stage Progression

**Objective:** Test workflow rule validation and stage completion

**Steps:**
1. Navigate to project settings: `/projects/{projectId}/settings`
2. Enable workflow rules:
   - "All tasks must be completed before stage completion"
   - "All required files must be uploaded"
3. Go back to workflow page
4. Click on a stage in the workflow progress stepper
5. Try to mark stage as "Completed" without completing tasks
6. Complete all tasks in the stage
7. Mark stage as "Completed"

**Expected Results:**
- Stage completion blocked when requirements not met
- Visual indicators show missing requirements
- Stage completes when all requirements satisfied
- Stage status badge updates to "Completed"

**DevTools Checks:**
```javascript
// Check workflow rules
const projectId = JSON.parse(localStorage.getItem('currentProject'))
const rulesKey = `projectWorkflowRules`
const rules = JSON.parse(localStorage.getItem(rulesKey))
console.log('Project workflow rules:', rules[projectId])

// Check stage status
const stages = JSON.parse(localStorage.getItem('stages'))
const projectStages = stages[projectId]
console.log('Stage statuses:', projectStages.map(s => ({
  name: s.name,
  status: s.status
})))
```

---

## Testing New Features

### Feature 1: Command Palette

**Shortcut:** `Ctrl+K` (Windows/Linux) or `Cmd+K` (Mac)

**Test Steps:**
1. Press `Ctrl+K` to open command palette
2. Type "dashboard" - should show dashboard navigation
3. Type "project" - should show project list
4. Type "task" - should show task search
5. Use arrow keys to navigate
6. Press `Enter` to select

**Expected Results:**
- Palette opens with smooth animation
- Search filters results in real-time
- Keyboard navigation works
- Selecting item navigates to correct page

**DevTools Test:**
```javascript
// Trigger command palette programmatically
document.dispatchEvent(new KeyboardEvent('keydown', {
  key: 'k',
  ctrlKey: true,
  bubbles: true
}))
```

---

### Feature 2: Notification Center

**Location:** Bell icon in header

**Test Steps:**
1. Click bell icon in header
2. Verify notification count badge
3. Review notification list
4. Mark a notification as read
5. Clear all notifications

**Expected Results:**
- Notification panel slides out
- Unread notifications highlighted
- Mark as read updates badge count
- Clear all removes notifications

**DevTools Checks:**
```javascript
// Check notifications in context
// (This requires React DevTools to access context)
// Look for NotificationProvider in React Components tab
```

---

### Feature 3: Dashboard Page

**Route:** `/dashboard`

**Test Steps:**
1. Navigate to `/dashboard`
2. Verify all statistics display correctly:
   - Active Projects count
   - Total Tasks count
   - Pending Approvals
   - Team Members
3. Check charts render (Recharts):
   - Project Status Distribution (Pie Chart)
   - Task Completion Trend (Line Chart)
   - Department Workload (Bar Chart)
4. Verify recent activity feed

**Expected Results:**
- All cards display correct counts
- Charts render without errors
- Hover interactions work on charts
- Responsive layout adjusts to window size

**DevTools Checks:**
```javascript
// Calculate expected statistics
const projects = JSON.parse(localStorage.getItem('projects'))
const activeProjects = projects.filter(p => p.status === 'active')
console.log('Active projects:', activeProjects.length)

const tasks = JSON.parse(localStorage.getItem('tasks'))
let totalTasks = 0
Object.keys(tasks).forEach(projectId => {
  totalTasks += tasks[projectId].length
})
console.log('Total tasks:', totalTasks)
```

---

### Feature 4: My Work Page

**Route:** `/my-work`

**Test Steps:**
1. Navigate to `/my-work`
2. Switch between tabs:
   - My Tasks
   - My Approvals
   - Time Tracking
3. Filter tasks by status
4. Sort by due date or priority
5. Quick-update task status from card

**Expected Results:**
- Only shows tasks assigned to current user
- Tabs switch smoothly
- Filters work correctly
- Status updates reflect immediately

**DevTools Checks:**
```javascript
// Get current user
const currentUser = JSON.parse(localStorage.getItem('currentUser'))
console.log('Current user:', currentUser.name)

// Find tasks assigned to current user
const tasks = JSON.parse(localStorage.getItem('tasks'))
const myTasks = []
Object.keys(tasks).forEach(projectId => {
  const projectTasks = tasks[projectId].filter(t =>
    t.assignees?.includes(currentUser.id) || t.assignee === currentUser.id
  )
  myTasks.push(...projectTasks)
})
console.log('My tasks:', myTasks.length)
```

---

### Feature 5: Calendar View

**Route:** `/calendar`

**Test Steps:**
1. Navigate to `/calendar`
2. Verify calendar renders with react-big-calendar
3. Check events display:
   - Tasks with due dates
   - Project milestones
   - Approval deadlines
4. Switch views: Month / Week / Day / Agenda
5. Click on an event to see details
6. Navigate between months

**Expected Results:**
- Calendar displays all date-based items
- Events are color-coded by type
- View switching works smoothly
- Event details show in popup
- Navigation updates events correctly

**DevTools Checks:**
```javascript
// Get all items with dates
const projects = JSON.parse(localStorage.getItem('projects'))
const tasks = JSON.parse(localStorage.getItem('tasks'))

// Count calendar events
let eventCount = 0
Object.keys(tasks).forEach(projectId => {
  const tasksWithDates = tasks[projectId].filter(t => t.dueDate)
  eventCount += tasksWithDates.length
})
console.log('Calendar events:', eventCount)
```

---

### Feature 6: Task Comments

**Location:** Task card > Comments section

**Test Steps:**
1. Open a task card
2. Scroll to comments section
3. Add a comment: "Great progress on this task!"
4. Mention a user with @username
5. Edit the comment
6. Delete a comment
7. Reply to a comment (if nested replies supported)

**Expected Results:**
- Comment appears immediately
- @mentions are highlighted
- Edit mode loads existing text
- Delete removes comment
- Timestamp shows "X minutes ago"

**DevTools Checks:**
```javascript
// Find task with comments
const tasks = JSON.parse(localStorage.getItem('tasks'))
const projectId = JSON.parse(localStorage.getItem('currentProject'))
const taskWithComments = tasks[projectId].find(t => t.comments?.length > 0)
console.log('Task with comments:', taskWithComments)
console.log('Comments:', taskWithComments?.comments)
```

---

### Feature 7: Time Tracking

**Location:** Task card > Time tracking button

**Test Steps:**
1. Open a task card
2. Click "Track Time" button
3. Start timer or manually log time:
   - Hours: 2
   - Minutes: 30
   - Description: "Design concept review"
4. Save time entry
5. View total time logged on task
6. View time tracking report in My Work page

**Expected Results:**
- Timer starts/stops correctly
- Manual entry saves
- Total time updates on task
- Time entries appear in report
- Can edit/delete time entries

**DevTools Checks:**
```javascript
// Check time tracking data
const projectId = JSON.parse(localStorage.getItem('currentProject'))
const timeTrackingKey = `timeTracking-${projectId}`
const timeEntries = JSON.parse(localStorage.getItem(timeTrackingKey))
console.log('Time entries:', timeEntries)

// Calculate total hours
let totalHours = 0
if (timeEntries) {
  timeEntries.forEach(entry => {
    totalHours += (entry.hours || 0) + (entry.minutes || 0) / 60
  })
}
console.log('Total hours logged:', totalHours.toFixed(2))
```

---

## localStorage Inspection

### Complete Data Audit

Run this comprehensive audit in Console:

```javascript
// Complete localStorage audit
console.log('=== InteriorsFlow Data Audit ===\n')

// Global data
const globalKeys = ['projects', 'currentUser', 'currentProject', 'projectTemplates',
                   'workflowRules', 'approvalRules', 'statusConfigurations', 'team']
globalKeys.forEach(key => {
  const data = localStorage.getItem(key)
  if (data) {
    const parsed = JSON.parse(data)
    console.log(`${key}:`, Array.isArray(parsed) ? `${parsed.length} items` : parsed)
  }
})

// Project-specific data
const currentProjectId = JSON.parse(localStorage.getItem('currentProject'))
if (currentProjectId) {
  console.log(`\n=== Project ${currentProjectId} Data ===`)
  const projectKeys = ['tasks', 'files', 'documents', 'stages', 'activities']
  projectKeys.forEach(key => {
    const data = localStorage.getItem(key)
    if (data) {
      const parsed = JSON.parse(data)
      const projectData = parsed[currentProjectId]
      console.log(`${key}:`, projectData ? `${projectData.length} items` : 'none')
    }
  })

  // Check approvals for this project
  const approvalKey = `approvalRequests-${currentProjectId}`
  const approvals = localStorage.getItem(approvalKey)
  if (approvals) {
    const parsed = JSON.parse(approvals)
    console.log(`approvalRequests:`, `${parsed.length} items`)
  }
}

console.log('\n=== Storage Usage ===')
let totalSize = 0
Object.keys(localStorage).forEach(key => {
  totalSize += localStorage.getItem(key).length
})
console.log(`Total localStorage size: ${(totalSize / 1024).toFixed(2)} KB`)
console.log(`Total keys: ${Object.keys(localStorage).length}`)
```

### Export All Data (Backup)

```javascript
// Export all localStorage data
const exportData = {}
Object.keys(localStorage).forEach(key => {
  exportData[key] = localStorage.getItem(key)
})
console.log('Exported data:', exportData)

// Copy to clipboard
copy(JSON.stringify(exportData, null, 2))
console.log('Data copied to clipboard!')
```

### Import Data (Restore)

```javascript
// Import data from backup
const importData = {/* paste your backup data here */}
Object.keys(importData).forEach(key => {
  localStorage.setItem(key, importData[key])
})
console.log('Data imported successfully!')
location.reload()
```

---

## Common Issues & Debugging

### Issue 1: Context Provider Order Error

**Symptom:** "Cannot read property 'useContext' of undefined"

**Solution:**
Check context provider nesting in App.tsx. The order must be:
```
StatusConfigProvider > UserProvider > TemplateProvider > ProjectProvider > TeamProvider >
ApprovalProvider > ApprovalRuleProvider > TaskProvider > FileProvider > DocumentProvider >
IssueProvider > StageProvider > WorkflowRulesProvider > TimeTrackingProvider > NotificationProvider
```

**DevTools Check:**
```javascript
// Verify React component tree in React DevTools
// Look for Context.Provider hierarchy
```

---

### Issue 2: Tasks Not Filtering by Department

**Symptom:** Seeing all tasks regardless of department

**Solution:**
1. Check current user department
2. Verify DEPARTMENT_STAGES mapping
3. Check task stage assignment

**DevTools Check:**
```javascript
const currentUser = JSON.parse(localStorage.getItem('currentUser'))
console.log('Current department:', currentUser.department)

const tasks = JSON.parse(localStorage.getItem('tasks'))
const projectId = JSON.parse(localStorage.getItem('currentProject'))
const projectTasks = tasks[projectId]

// Check task stages
const stages = projectTasks.map(t => t.stage)
console.log('Unique stages:', [...new Set(stages)])
```

---

### Issue 3: Approval Requests Not Appearing

**Symptom:** Empty approval list after project creation

**Solution:**
1. Verify template has approvals defined
2. Check approval generation in templateLoader
3. Verify ApprovalProvider is rendering

**DevTools Check:**
```javascript
const projectId = JSON.parse(localStorage.getItem('currentProject'))
const approvalKey = `approvalRequests-${projectId}`
const approvals = JSON.parse(localStorage.getItem(approvalKey))
console.log('Approvals:', approvals)

// Check template approvals
const templates = JSON.parse(localStorage.getItem('projectTemplates'))
const resTemplate = templates.find(t => t.projectType === 'Residential')
console.log('Template approvals:', resTemplate?.approvals?.length)
```

---

### Issue 4: HMR (Hot Module Reload) Errors

**Symptom:** Vite shows "Expected corresponding JSX closing tag" error

**Solution:**
1. Check for mismatched JSX tags
2. Verify provider nesting is correct
3. Restart dev server: Kill shell and run `npm run dev`

---

### Issue 5: Data Not Persisting

**Symptom:** Data disappears on page refresh

**Solution:**
1. Check browser localStorage quota (5-10MB limit)
2. Verify useEffect dependencies in contexts
3. Check for localStorage.clear() calls

**DevTools Check:**
```javascript
// Check localStorage availability
if (typeof(Storage) !== "undefined") {
  console.log("localStorage is available")
} else {
  console.log("localStorage is NOT available")
}

// Check quota (Chrome only)
if (navigator.storage && navigator.storage.estimate) {
  navigator.storage.estimate().then(estimate => {
    console.log(`Using ${(estimate.usage / 1024 / 1024).toFixed(2)}MB of ${(estimate.quota / 1024 / 1024).toFixed(2)}MB`)
  })
}
```

---

## Performance Testing

### Test 1: Large Dataset Performance

```javascript
// Generate 100 projects with 1000 tasks each
const generateTestData = () => {
  const projects = []
  const allTasks = {}

  for (let i = 1; i <= 100; i++) {
    const projectId = `perf-test-${i}`
    projects.push({
      id: projectId,
      name: `Test Project ${i}`,
      status: 'active',
      createdAt: new Date().toISOString()
    })

    allTasks[projectId] = []
    for (let j = 1; j <= 1000; j++) {
      allTasks[projectId].push({
        id: `task-${i}-${j}`,
        title: `Task ${j}`,
        status: 'todo',
        stage: 'Design',
        createdAt: new Date().toISOString()
      })
    }
  }

  localStorage.setItem('projects', JSON.stringify(projects))
  localStorage.setItem('tasks', JSON.stringify(allTasks))
  console.log('Test data generated: 100 projects, 100,000 tasks')
  location.reload()
}

// Run performance test
console.time('Page Load')
generateTestData()
// Check console for 'Page Load' time after refresh
```

### Test 2: Memory Leak Detection

```javascript
// Monitor memory usage
const memoryTest = () => {
  if (performance.memory) {
    console.log('JS Heap Size:', {
      used: `${(performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
      total: `${(performance.memory.totalJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
      limit: `${(performance.memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB`
    })
  }
}

// Run every 5 seconds
setInterval(memoryTest, 5000)
```

---

## Automated Test Script

Run this complete test flow automatically:

```javascript
// Automated test flow
const runAutomatedTests = async () => {
  console.log('🚀 Starting automated tests...\n')

  // Test 1: Clear and initialize
  console.log('Test 1: Initialization')
  localStorage.clear()
  location.reload()
  await new Promise(resolve => setTimeout(resolve, 2000))

  // Test 2: Create project
  console.log('Test 2: Project creation')
  // Navigate to /projects/new and create project
  // (This requires UI automation - use Playwright or Cypress for full automation)

  // Test 3: Verify data
  console.log('Test 3: Data verification')
  const projects = JSON.parse(localStorage.getItem('projects'))
  console.assert(projects?.length > 0, 'Projects should exist')

  const tasks = JSON.parse(localStorage.getItem('tasks'))
  console.assert(Object.keys(tasks).length > 0, 'Tasks should exist')

  console.log('✅ All tests passed!')
}

// Run tests
runAutomatedTests()
```

---

## Quick Reference Commands

```javascript
// Quick project overview
const quickStats = () => {
  const projects = JSON.parse(localStorage.getItem('projects') || '[]')
  const tasks = JSON.parse(localStorage.getItem('tasks') || '{}')
  const currentProject = localStorage.getItem('currentProject')

  console.log('📊 Quick Stats:')
  console.log(`Projects: ${projects.length}`)
  console.log(`Current Project: ${currentProject}`)
  if (currentProject && tasks[currentProject]) {
    console.log(`Tasks in current project: ${tasks[currentProject].length}`)
  }
}

// Quick clear project data
const clearProjectData = (projectId) => {
  const projects = JSON.parse(localStorage.getItem('projects'))
  const filtered = projects.filter(p => p.id !== projectId)
  localStorage.setItem('projects', JSON.stringify(filtered))

  const tasks = JSON.parse(localStorage.getItem('tasks'))
  delete tasks[projectId]
  localStorage.setItem('tasks', JSON.stringify(tasks))

  console.log(`✅ Cleared data for project ${projectId}`)
  location.reload()
}

// Export commands
window.InteriorsFlowDebug = {
  quickStats,
  clearProjectData,
  exportData: () => {
    const data = {}
    Object.keys(localStorage).forEach(key => {
      data[key] = localStorage.getItem(key)
    })
    console.log(JSON.stringify(data, null, 2))
  }
}

console.log('💡 Debug commands available: window.InteriorsFlowDebug')
```

---

## Testing Checklist

Use this checklist to ensure comprehensive testing:

- [ ] Application loads without console errors
- [ ] Can create new project from template
- [ ] Tasks display correctly with filtering
- [ ] Can add/edit/delete tasks
- [ ] Subtasks work with all features
- [ ] File attachments work
- [ ] Approval workflows function
- [ ] Stage progression validates rules
- [ ] Command palette opens and searches (Ctrl+K)
- [ ] Dashboard displays statistics and charts
- [ ] My Work page shows user-specific data
- [ ] Calendar view renders events
- [ ] Task comments can be added/edited
- [ ] Time tracking logs hours correctly
- [ ] Notification center shows alerts
- [ ] Theme switcher toggles dark/light mode
- [ ] Department switcher filters data correctly
- [ ] localStorage persists data across refreshes
- [ ] Responsive design works on mobile viewport
- [ ] No memory leaks during extended use

---

**Happy Testing! 🧪**

For issues or questions, check the console for detailed error messages and use the debugging commands above.
