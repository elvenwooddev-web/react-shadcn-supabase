# Quick Start - Testing in Chrome DevTools

## Step 1: Open Application

1. **Open Chrome** browser
2. **Navigate** to: http://localhost:5174/
3. **Open DevTools**: Press `F12` or `Right-click > Inspect`

## Step 2: Load DevTools Helper

1. In DevTools, click the **Console** tab
2. Copy the entire contents of `devtools-helper.js`
3. Paste into Console and press `Enter`
4. You should see:
   ```
   🎨 InteriorsFlow DevTools Helper
   ✅ DevTools Helper Loaded!
   📊 InteriorsFlow Data Overview
   ```

## Step 3: Quick Commands Reference

### Essential Commands

```javascript
// Show overview of all data
IF.overview()

// Show help menu
IF.help()

// Create a test project with sample data
IF.generateTestProject()

// List all projects
IF.projects()

// Show tasks for current project
IF.tasks()

// Clear everything and start fresh
IF.clearAll()
```

## Step 4: Complete Test Workflow

### A. Fresh Start Test

```javascript
// 1. Clear all data
IF.clearAll()

// 2. After page reloads, load helper again and check
IF.overview()

// 3. Generate test project
IF.generateTestProject()

// 4. Reload page to see changes
location.reload()
```

### B. Create Real Project Test

1. **In Browser:** Click "New Project" button
2. **Fill form:**
   - Name: "Luxury Apartment - Dubai Marina"
   - Client: "Sarah Ahmed"
   - Type: Residential
   - Budget: 1500000
   - Timeline: 120 days
3. **Select Template:** "Residential Interior Design"
4. **Click:** "Create Project"

**In Console:**
```javascript
// Verify project was created
IF.projects()

// Check tasks loaded from template (should be 76)
IF.tasks()

// Check approval workflows (should be 8)
IF.approvals()

// Check stages initialized (should be 7)
IF.stages()
```

### C. Test Task Management

**In Browser:**
1. Navigate to Workflow page
2. Click on any task card
3. Add a subtask
4. Add checklist items
5. Change task status

**In Console:**
```javascript
// Get all tasks and filter for ones with subtasks
const tasks = IF.tasks()
const withSubtasks = tasks.filter(t => t.subtasks?.length > 0)
console.log('Tasks with subtasks:', withSubtasks)
```

### D. Test Approvals

**In Browser:**
1. Go to `/approvals` page
2. Click "Review" on any pending approval
3. Add comment and approve

**In Console:**
```javascript
// Check approval status
const approvals = IF.approvals()
const pending = approvals.filter(a => a.status === 'pending')
const approved = approvals.filter(a => a.status === 'approved')
console.log(`Pending: ${pending.length}, Approved: ${approved.length}`)
```

### E. Test New Features

#### Command Palette
```javascript
// Trigger command palette
document.dispatchEvent(new KeyboardEvent('keydown', {
  key: 'k',
  ctrlKey: true,
  bubbles: true
}))
```
**Or** Press `Ctrl+K` manually

#### Dashboard
```javascript
// Navigate to dashboard
window.location.href = '/dashboard'

// Check data
IF.overview()
```

#### My Work
```javascript
// Navigate to My Work page
window.location.href = '/my-work'

// Check current user
JSON.parse(localStorage.getItem('currentUser'))
```

#### Calendar
```javascript
// Navigate to Calendar
window.location.href = '/calendar'

// Count tasks with due dates
const tasks = IF.tasks()
const withDates = tasks.filter(t => t.dueDate)
console.log(`${withDates.length} tasks have due dates`)
```

## Step 5: Department Testing

```javascript
// Test different department views
IF.switchUser('Design')
location.reload()

// Check what stages Design can access
const currentUser = JSON.parse(localStorage.getItem('currentUser'))
console.log('Department:', currentUser.department)

// View filtered tasks
IF.tasks()
```

**Available Departments:**
- Admin (sees everything)
- Sales
- Design
- Technical
- Procurement
- Production
- Execution

## Step 6: Performance Testing

```javascript
// Check performance metrics
IF.performance()

// Generate large dataset
IF.generateTasks(100) // Generate 100 tasks
location.reload()

// Monitor memory usage
IF.monitorMemory(3000) // Check every 3 seconds
```

## Step 7: Data Validation

```javascript
// Validate data integrity
IF.validate()

// Check for errors in console
// Should show: ✅ Validation complete: 0 errors, 0 warnings
```

## Step 8: Export/Import Data

```javascript
// Export current data
IF.export()
// Downloads JSON file

// Import data (paste exported data object)
const backupData = { /* paste your backup here */ }
IF.import(backupData)
```

## Quick Troubleshooting

### Issue: "IF is not defined"
**Solution:** Reload the helper script by copying and pasting `devtools-helper.js` again

### Issue: No projects showing
**Solution:**
```javascript
IF.generateTestProject()
location.reload()
```

### Issue: Tasks not filtering by department
**Solution:**
```javascript
// Check current user department
const user = JSON.parse(localStorage.getItem('currentUser'))
console.log('Current department:', user.department)

// Switch to Admin to see all tasks
IF.switchUser('Admin')
location.reload()
```

### Issue: Data not persisting
**Solution:**
```javascript
// Check localStorage is available
console.log('localStorage available:', typeof(Storage) !== "undefined")

// Check storage quota
navigator.storage.estimate().then(estimate => {
  console.log(`Using ${(estimate.usage / 1024 / 1024).toFixed(2)}MB of ${(estimate.quota / 1024 / 1024).toFixed(2)}MB`)
})
```

## Common Test Scenarios

### Scenario 1: Complete Project Lifecycle

```javascript
// 1. Create project
IF.generateTestProject()
location.reload()

// 2. Generate tasks
IF.generateTasks(20)
location.reload()

// 3. View overview
IF.overview()

// 4. Complete first stage
// (Do this manually in UI by completing all tasks in Sales stage)

// 5. Verify stage completion
IF.stages()
```

### Scenario 2: Approval Workflow

```javascript
// 1. Create project with template (has approvals)
// (Do this in UI)

// 2. Check approvals
IF.approvals()

// 3. Filter by status
const approvals = IF.approvals()
console.table(approvals.filter(a => a.status === 'pending'))

// 4. After approving in UI, verify
const approved = approvals.filter(a => a.status === 'approved')
console.log(`Approved: ${approved.length}`)
```

### Scenario 3: Multi-Project Management

```javascript
// 1. Generate multiple projects
IF.generateTestProject()
IF.generateTestProject()
IF.generateTestProject()

// 2. View all projects
IF.projects()

// 3. Switch between projects
const projects = IF.projects()
IF.setProject(projects[0].id)
location.reload()

// 4. Check tasks for each
IF.tasks(projects[0].id)
IF.tasks(projects[1].id)
IF.tasks(projects[2].id)
```

## Advanced Testing

### Memory Leak Detection

```javascript
// 1. Start monitoring
const monitor = IF.monitorMemory(2000)

// 2. Perform actions in UI (navigate, create tasks, etc.)

// 3. Watch console for memory trends
// Memory should stabilize, not continuously increase

// 4. Stop monitoring
clearInterval(monitor)
```

### Load Testing

```javascript
// Generate large dataset
for (let i = 0; i < 10; i++) {
  IF.generateTestProject()
}

// Generate many tasks
IF.generateTasks(500)

// Measure performance
console.time('render')
location.reload()
// Check console for 'render' time
console.timeEnd('render')
```

### Network Monitoring

1. Go to **Network** tab in DevTools
2. Perform actions in UI
3. Check for:
   - Failed requests (red)
   - Slow requests (> 1s)
   - Large payloads (> 1MB)

### React DevTools (if installed)

1. Click **Components** tab
2. Find context providers:
   - ProjectProvider
   - TaskProvider
   - ApprovalProvider
3. Inspect their state
4. Check for re-render issues (highlight updates option)

## Automated Test Flow

```javascript
// Copy and paste this complete test flow
(async function autoTest() {
  console.log('🚀 Starting automated test flow...\n')

  // Step 1: Clean start
  console.log('Step 1: Clearing data...')
  IF.clearAll()
  await new Promise(r => setTimeout(r, 2000))

  // Step 2: Generate test project
  console.log('Step 2: Generating test project...')
  IF.generateTestProject()
  await new Promise(r => setTimeout(r, 1000))
  location.reload()

  // Continue after reload...
  // Run this part after page reloads:
  /*
  IF.generateTasks(20)
  console.log('✅ Test data ready!')
  IF.overview()
  location.reload()
  */
})()
```

## Test Checklist

Copy this checklist into console:

```javascript
const testChecklist = [
  '[ ] Application loads without errors',
  '[ ] Can create project from template',
  '[ ] 76 tasks loaded from residential template',
  '[ ] Can add/edit/delete tasks',
  '[ ] Subtasks work correctly',
  '[ ] Checklist items work',
  '[ ] File attachments work',
  '[ ] Approval workflows display',
  '[ ] Can approve/reject approvals',
  '[ ] Stage progression validates rules',
  '[ ] Command palette opens (Ctrl+K)',
  '[ ] Dashboard displays statistics',
  '[ ] My Work page filters user tasks',
  '[ ] Calendar shows events',
  '[ ] Task comments work',
  '[ ] Time tracking logs hours',
  '[ ] Notifications appear',
  '[ ] Department switcher filters data',
  '[ ] Theme switcher works',
  '[ ] Data persists after refresh'
]

console.log('📋 Test Checklist:\n' + testChecklist.join('\n'))
```

## Quick Reference Card

```javascript
// ═══════════════════════════════════════
//   INTERIORSFLOW DEVTOOLS QUICK REF
// ═══════════════════════════════════════

// LOAD HELPER
// Paste devtools-helper.js into console

// COMMON COMMANDS
IF.help()              // Show all commands
IF.overview()          // Data overview
IF.projects()          // List projects
IF.tasks()             // Show tasks
IF.approvals()         // Show approvals

// TEST DATA
IF.generateTestProject()  // Create project
IF.generateTasks(20)      // Add 20 tasks
IF.clearAll()             // Clear everything

// DEPARTMENT TESTING
IF.switchUser('Design')   // Switch department

// PERFORMANCE
IF.performance()          // Show metrics
IF.validate()             // Check data

// EXPORT/IMPORT
IF.export()              // Save data
IF.import(data)          // Restore data

// ═══════════════════════════════════════
```

---

## Next Steps

1. ✅ Load helper script in console
2. ✅ Run `IF.overview()` to see current state
3. ✅ Create test project with `IF.generateTestProject()`
4. ✅ Explore features in browser
5. ✅ Use IF commands to verify behavior
6. ✅ Check `TEST_WORKFLOWS.md` for detailed scenarios

**Happy Testing! 🧪**
