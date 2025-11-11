// InteriorsFlow - Chrome DevTools Helper Script
// Copy and paste this entire script into Chrome Console for debugging utilities

(function() {
  console.log('%c🎨 InteriorsFlow DevTools Helper', 'font-size: 20px; color: #3B82F6; font-weight: bold;')
  console.log('%cLoading debugging utilities...', 'color: #6B7280;')

  const IFDebug = {
    // ============ Data Inspection ============

    overview: function() {
      console.log('\n%c📊 InteriorsFlow Data Overview', 'font-size: 16px; color: #3B82F6; font-weight: bold;')
      console.log('━'.repeat(50))

      try {
        // Global data
        const projects = JSON.parse(localStorage.getItem('projects') || '[]')
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}')
        const currentProject = localStorage.getItem('currentProject')
        const templates = JSON.parse(localStorage.getItem('projectTemplates') || '[]')

        console.log(`\n🏢 Projects: ${projects.length}`)
        console.log(`👤 Current User: ${currentUser.name || 'None'} (${currentUser.department || 'N/A'})`)
        console.log(`📋 Current Project: ${currentProject || 'None'}`)
        console.log(`📑 Templates: ${templates.length}`)

        // Project-specific data
        if (currentProject) {
          const tasks = JSON.parse(localStorage.getItem('tasks') || '{}')
          const files = JSON.parse(localStorage.getItem('files') || '{}')
          const documents = JSON.parse(localStorage.getItem('documents') || '{}')
          const stages = JSON.parse(localStorage.getItem('stages') || '{}')
          const approvals = JSON.parse(localStorage.getItem(`approvalRequests-${currentProject}`) || '[]')

          console.log(`\n📊 Current Project Data:`)
          console.log(`  Tasks: ${tasks[currentProject]?.length || 0}`)
          console.log(`  Files: ${files[currentProject]?.length || 0}`)
          console.log(`  Documents: ${documents[currentProject]?.length || 0}`)
          console.log(`  Stages: ${stages[currentProject]?.length || 0}`)
          console.log(`  Approvals: ${approvals.length}`)
        }

        // Storage usage
        let totalSize = 0
        Object.keys(localStorage).forEach(key => {
          totalSize += localStorage.getItem(key).length
        })
        console.log(`\n💾 Storage: ${(totalSize / 1024).toFixed(2)} KB / ${Object.keys(localStorage).length} keys`)

        console.log('\n━'.repeat(50))
      } catch (error) {
        console.error('Error reading data:', error)
      }
    },

    projects: function() {
      const projects = JSON.parse(localStorage.getItem('projects') || '[]')
      console.table(projects.map(p => ({
        ID: p.id,
        Name: p.name,
        Status: p.status,
        Type: p.projectType,
        Client: p.clientName,
        Budget: p.budget ? `$${p.budget.toLocaleString()}` : 'N/A'
      })))
      return projects
    },

    tasks: function(projectId) {
      const pid = projectId || localStorage.getItem('currentProject')
      if (!pid) {
        console.error('No project specified and no current project set')
        return []
      }

      const tasks = JSON.parse(localStorage.getItem('tasks') || '{}')
      const projectTasks = tasks[pid] || []

      console.log(`\n📋 Tasks for project: ${pid}`)
      console.table(projectTasks.map(t => ({
        ID: t.id,
        Title: t.title.substring(0, 40),
        Status: t.status,
        Stage: t.stage,
        Priority: t.priority,
        Subtasks: t.subtasks?.length || 0,
        Checklist: t.checklistItems?.length || 0
      })))

      return projectTasks
    },

    approvals: function(projectId) {
      const pid = projectId || localStorage.getItem('currentProject')
      if (!pid) {
        console.error('No project specified and no current project set')
        return []
      }

      const approvals = JSON.parse(localStorage.getItem(`approvalRequests-${pid}`) || '[]')

      console.log(`\n✅ Approvals for project: ${pid}`)
      console.table(approvals.map(a => ({
        ID: a.id,
        Type: a.entityType,
        Status: a.status,
        Source: a.source,
        Level: `${a.currentApprovalLevel}/${a.approvalConfigs.length}`,
        AssignedTo: a.assignedTo
      })))

      return approvals
    },

    stages: function(projectId) {
      const pid = projectId || localStorage.getItem('currentProject')
      if (!pid) {
        console.error('No project specified and no current project set')
        return []
      }

      const stages = JSON.parse(localStorage.getItem('stages') || '{}')
      const projectStages = stages[pid] || []

      console.log(`\n🔄 Stages for project: ${pid}`)
      console.table(projectStages.map(s => ({
        Name: s.name,
        Status: s.status,
        Priority: s.priority,
        Department: s.departmentHead,
        Started: s.startDate ? new Date(s.startDate).toLocaleDateString() : 'N/A',
        Due: s.dueDate ? new Date(s.dueDate).toLocaleDateString() : 'N/A'
      })))

      return projectStages
    },

    // ============ Data Manipulation ============

    switchUser: function(department) {
      const validDepts = ['Admin', 'Sales', 'Design', 'Technical', 'Procurement', 'Production', 'Execution']
      if (!validDepts.includes(department)) {
        console.error(`Invalid department. Choose from: ${validDepts.join(', ')}`)
        return
      }

      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}')
      currentUser.department = department
      currentUser.name = `${department} User`
      localStorage.setItem('currentUser', JSON.stringify(currentUser))

      console.log(`✅ Switched to: ${department}`)
      console.log('🔄 Refresh page to see changes: location.reload()')
    },

    setProject: function(projectId) {
      const projects = JSON.parse(localStorage.getItem('projects') || '[]')
      const project = projects.find(p => p.id === projectId)

      if (!project) {
        console.error(`Project ${projectId} not found`)
        console.log('Available projects:', projects.map(p => p.id))
        return
      }

      localStorage.setItem('currentProject', projectId)
      console.log(`✅ Set current project to: ${project.name}`)
      console.log('🔄 Refresh page to see changes: location.reload()')
    },

    clearAll: function() {
      if (confirm('Are you sure you want to clear ALL data? This cannot be undone.')) {
        localStorage.clear()
        console.log('✅ All data cleared')
        console.log('🔄 Refreshing page...')
        setTimeout(() => location.reload(), 1000)
      }
    },

    clearProject: function(projectId) {
      const pid = projectId || localStorage.getItem('currentProject')
      if (!pid) {
        console.error('No project specified')
        return
      }

      if (!confirm(`Clear all data for project ${pid}?`)) return

      // Remove from projects list
      const projects = JSON.parse(localStorage.getItem('projects') || '[]')
      const filtered = projects.filter(p => p.id !== pid)
      localStorage.setItem('projects', JSON.stringify(filtered))

      // Remove project-specific data
      const dataKeys = ['tasks', 'files', 'documents', 'stages', 'activities']
      dataKeys.forEach(key => {
        const data = JSON.parse(localStorage.getItem(key) || '{}')
        delete data[pid]
        localStorage.setItem(key, JSON.stringify(data))
      })

      // Remove approvals
      localStorage.removeItem(`approvalRequests-${pid}`)
      localStorage.removeItem(`timeTracking-${pid}`)

      console.log(`✅ Cleared project: ${pid}`)
      location.reload()
    },

    // ============ Test Data Generation ============

    generateTestProject: function() {
      console.log('🏗️ Generating test project...')

      const projectId = `test-${Date.now()}`
      const projects = JSON.parse(localStorage.getItem('projects') || '[]')

      projects.push({
        id: projectId,
        name: 'Test Project - ' + new Date().toLocaleString(),
        description: 'Auto-generated test project',
        projectType: 'Residential',
        clientName: 'Test Client',
        status: 'active',
        budget: 500000,
        timeline: 90,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })

      localStorage.setItem('projects', JSON.stringify(projects))
      localStorage.setItem('currentProject', projectId)

      // Generate tasks
      const tasks = JSON.parse(localStorage.getItem('tasks') || '{}')
      tasks[projectId] = [
        {
          id: `task-1-${Date.now()}`,
          title: 'Initial Design Concept',
          description: 'Create initial design concepts',
          status: 'in-progress',
          priority: 'high',
          stage: 'Design',
          assignees: [],
          subtasks: [],
          checklistItems: ['Research', 'Sketch', 'Present'],
          createdAt: new Date().toISOString()
        },
        {
          id: `task-2-${Date.now()}`,
          title: 'Material Selection',
          description: 'Select materials for project',
          status: 'todo',
          priority: 'medium',
          stage: 'Procurement',
          assignees: [],
          subtasks: [],
          checklistItems: [],
          createdAt: new Date().toISOString()
        }
      ]
      localStorage.setItem('tasks', JSON.stringify(tasks))

      // Initialize stages
      const stages = JSON.parse(localStorage.getItem('stages') || '{}')
      stages[projectId] = [
        'Sales', 'Design', 'Technical Design', 'Procurement',
        'Production', 'Execution', 'Post Installation'
      ].map(name => ({
        id: `stage-${name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
        name,
        status: name === 'Design' ? 'active' : 'pending',
        priority: 'medium',
        projectId
      }))
      localStorage.setItem('stages', JSON.stringify(stages))

      console.log('✅ Test project created:', projectId)
      console.log('🔄 Refresh page to see changes: location.reload()')

      return projectId
    },

    generateTasks: function(count = 10, projectId) {
      const pid = projectId || localStorage.getItem('currentProject')
      if (!pid) {
        console.error('No project specified')
        return
      }

      const tasks = JSON.parse(localStorage.getItem('tasks') || '{}')
      if (!tasks[pid]) tasks[pid] = []

      const stages = ['Sales', 'Design', 'Technical Design', 'Procurement', 'Production', 'Execution', 'Post Installation']
      const statuses = ['todo', 'in-progress', 'completed', 'blocked']
      const priorities = ['low', 'medium', 'high', 'urgent']

      for (let i = 1; i <= count; i++) {
        tasks[pid].push({
          id: `task-gen-${i}-${Date.now()}`,
          title: `Generated Task ${i}`,
          description: `This is a test task generated automatically`,
          status: statuses[Math.floor(Math.random() * statuses.length)],
          priority: priorities[Math.floor(Math.random() * priorities.length)],
          stage: stages[Math.floor(Math.random() * stages.length)],
          assignees: [],
          subtasks: [],
          checklistItems: [],
          createdAt: new Date().toISOString()
        })
      }

      localStorage.setItem('tasks', JSON.stringify(tasks))
      console.log(`✅ Generated ${count} tasks for project ${pid}`)
      console.log('🔄 Refresh page to see changes')
    },

    // ============ Export/Import ============

    export: function() {
      const data = {}
      Object.keys(localStorage).forEach(key => {
        data[key] = localStorage.getItem(key)
      })

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `interiorsflow-backup-${Date.now()}.json`
      a.click()

      console.log('✅ Data exported to file')
    },

    import: function(data) {
      if (typeof data === 'string') {
        data = JSON.parse(data)
      }

      Object.keys(data).forEach(key => {
        localStorage.setItem(key, data[key])
      })

      console.log('✅ Data imported successfully')
      console.log('🔄 Refreshing page...')
      setTimeout(() => location.reload(), 1000)
    },

    // ============ Performance Testing ============

    performance: function() {
      console.log('\n%c⚡ Performance Metrics', 'font-size: 16px; color: #F59E0B; font-weight: bold;')

      // Memory usage (Chrome only)
      if (performance.memory) {
        console.log('\n💾 Memory Usage:')
        console.log(`  Used: ${(performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`)
        console.log(`  Total: ${(performance.memory.totalJSHeapSize / 1024 / 1024).toFixed(2)} MB`)
        console.log(`  Limit: ${(performance.memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB`)
      }

      // localStorage size
      let totalSize = 0
      Object.keys(localStorage).forEach(key => {
        totalSize += localStorage.getItem(key).length
      })
      console.log('\n💾 localStorage:')
      console.log(`  Size: ${(totalSize / 1024).toFixed(2)} KB`)
      console.log(`  Keys: ${Object.keys(localStorage).length}`)

      // Performance entries
      const entries = performance.getEntriesByType('navigation')[0]
      if (entries) {
        console.log('\n⏱️ Page Load Timing:')
        console.log(`  DOM Content Loaded: ${entries.domContentLoadedEventEnd.toFixed(0)}ms`)
        console.log(`  Load Complete: ${entries.loadEventEnd.toFixed(0)}ms`)
        console.log(`  DOM Interactive: ${entries.domInteractive.toFixed(0)}ms`)
      }
    },

    monitorMemory: function(interval = 5000) {
      if (!performance.memory) {
        console.error('Memory monitoring not available in this browser')
        return
      }

      console.log(`📊 Monitoring memory every ${interval}ms (Ctrl+C to stop)`)

      const monitor = setInterval(() => {
        console.log(`Memory: ${(performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`)
      }, interval)

      return monitor
    },

    // ============ Validation ============

    validate: function() {
      console.log('\n%c✓ Data Validation', 'font-size: 16px; color: #10B981; font-weight: bold;')

      let errors = 0
      let warnings = 0

      // Check required keys
      const requiredKeys = ['projects', 'currentUser']
      requiredKeys.forEach(key => {
        if (!localStorage.getItem(key)) {
          console.error(`❌ Missing required key: ${key}`)
          errors++
        }
      })

      // Validate projects
      const projects = JSON.parse(localStorage.getItem('projects') || '[]')
      projects.forEach(p => {
        if (!p.id || !p.name) {
          console.error(`❌ Invalid project: missing id or name`, p)
          errors++
        }
      })

      // Validate current project
      const currentProject = localStorage.getItem('currentProject')
      if (currentProject && !projects.find(p => p.id === currentProject)) {
        console.warn(`⚠️ Current project ${currentProject} not found in projects list`)
        warnings++
      }

      // Validate tasks
      const tasks = JSON.parse(localStorage.getItem('tasks') || '{}')
      Object.keys(tasks).forEach(projectId => {
        if (!projects.find(p => p.id === projectId)) {
          console.warn(`⚠️ Tasks exist for non-existent project: ${projectId}`)
          warnings++
        }

        tasks[projectId].forEach(t => {
          if (!t.id || !t.title || !t.status) {
            console.error(`❌ Invalid task in project ${projectId}:`, t)
            errors++
          }
        })
      })

      console.log(`\n${errors === 0 ? '✅' : '❌'} Validation complete: ${errors} errors, ${warnings} warnings`)
    },

    // ============ Help ============

    help: function() {
      console.log('\n%c📚 InteriorsFlow DevTools Commands', 'font-size: 18px; color: #3B82F6; font-weight: bold;')
      console.log('\n━━━ Data Inspection ━━━')
      console.log('  IF.overview()          - Show complete data overview')
      console.log('  IF.projects()          - List all projects')
      console.log('  IF.tasks(projectId)    - Show tasks for project')
      console.log('  IF.approvals(projectId)- Show approval requests')
      console.log('  IF.stages(projectId)   - Show workflow stages')
      console.log('\n━━━ Data Manipulation ━━━')
      console.log('  IF.switchUser(dept)    - Switch to different department')
      console.log('  IF.setProject(id)      - Set current project')
      console.log('  IF.clearAll()          - Clear all data')
      console.log('  IF.clearProject(id)    - Clear specific project')
      console.log('\n━━━ Test Data ━━━')
      console.log('  IF.generateTestProject()- Create test project')
      console.log('  IF.generateTasks(n, id) - Generate N tasks')
      console.log('\n━━━ Export/Import ━━━')
      console.log('  IF.export()            - Export data to file')
      console.log('  IF.import(data)        - Import data from object')
      console.log('\n━━━ Performance ━━━')
      console.log('  IF.performance()       - Show performance metrics')
      console.log('  IF.monitorMemory(ms)   - Monitor memory usage')
      console.log('\n━━━ Validation ━━━')
      console.log('  IF.validate()          - Validate data integrity')
      console.log('\n━━━ Utility ━━━')
      console.log('  IF.help()              - Show this help')
      console.log('\n💡 Tip: All commands also available via window.IF')
    }
  }

  // Make globally available
  window.IF = IFDebug
  window.InteriorsFlowDebug = IFDebug

  // Auto-run overview on load
  console.log('\n%c✅ DevTools Helper Loaded!', 'color: #10B981; font-weight: bold;')
  console.log('%cType IF.help() for available commands', 'color: #6B7280;')
  console.log('\n')

  IFDebug.overview()
})()
