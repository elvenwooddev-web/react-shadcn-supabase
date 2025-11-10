# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

InteriorsFlow is a production-ready project management web application designed for interior design firms. It features multi-project support, task management with subtasks and checklists, file tracking, stage documents, and role-based department access control.

## Build & Development Commands

```bash
# Install dependencies
npm install

# Development server (http://localhost:5173)
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## Architecture

### State Management Pattern

The application uses **React Context API** with localStorage persistence. Twelve main contexts manage global state:

1. **StatusConfigProvider** - Custom status management for all entity types (tasks, issues, stages, etc.)
2. **UserContext** - Department-based role system (Admin, Sales, Design, Technical, Procurement, Production, Execution)
3. **TemplateProvider** - Template CRUD for reusable project templates
4. **ProjectContext** - Multi-project management with stage metadata initialization
5. **TeamContext** - Team members and activity feed
6. **ApprovalProvider** - Approval request management (multi-level chains, approve/reject/delegate)
7. **ApprovalRuleProvider** - Approval rule configuration (global + project-specific)
8. **TaskContext** - Tasks with enhanced subtasks (priority, status, attachments, multiple assignees)
9. **FileContext** - Required files scoped by project and filtered by department
10. **DocumentContext** - Stage documents with status tracking
11. **StageContext** - Workflow stage metadata (status, priority, dates, department heads)
12. **WorkflowRulesContext** - Validation rules for stage transitions, auto-assignment, approvals

**Critical**: Contexts MUST be nested in this order in App.tsx:
```
StatusConfigProvider > UserProvider > TemplateProvider > ProjectProvider > TeamProvider >
ApprovalProvider > ApprovalRuleProvider > TaskProvider > FileProvider > DocumentProvider >
IssueProvider > StageProvider > WorkflowRulesProvider
```

**Context Dependencies**:
- ApprovalProvider requires TeamProvider, ProjectProvider, UserProvider
- ApprovalRuleProvider requires ApprovalProvider (uses useApprovals hook)
- StageContext requires TaskProvider, FileProvider, DocumentProvider (for progress calculation)
- WorkflowRulesContext requires all data contexts for validation, including ApprovalProvider
- TaskContext requires ApprovalRuleProvider for auto-applying approval rules on task creation
- TaskContext, FileContext, DocumentContext call `useUser()` for department filtering

### Data Persistence

All data persists to browser localStorage:
- **Global**: `projects`, `currentUser`, `currentProject`, `projectTemplates`, `workflowRules`, `approvalRules`, `statusConfigurations`
- **Project-scoped**: `tasks`, `files`, `documents`, `activities`, `stages`, `projectWorkflowRules`, `projectApprovalRules`, `approvalRequests-{projectId}`
- **Structure**: Project-scoped data keyed by project ID: `Record<string, T[]>`
- **Auto-saves**: Every state change triggers useEffect localStorage sync
- **Migration**: StageContext and TaskContext include migration logic for backwards compatibility

### Routing Structure

```
/ (ProjectsListPage with HomeSidebar)
├── /projects/new (NewProjectPage with template selector)
├── /templates (TemplatesListPage - browse/create/edit templates)
├── /templates/:id/edit (TemplateEditorPage - 3-tab editor: tasks/files/docs)
├── /settings (SettingsPage - global workflow rules & status configuration)
├── /issues (IssuesPage - issue tracking across projects)
├── /approvals (ApprovalsPage - approval dashboard with stats)
├── /approvals/settings (ApprovalsSettingsPage - global approval rules)
└── /projects/:id (ProjectLayout with Header, LeftSidebar, RightSidebar)
    ├── /overview (ProjectOverviewPage - dashboard & stats)
    ├── /workflow (WorkflowPage - tasks with enhanced subtasks)
    ├── /files (FilesPage - files grouped by stage)
    ├── /chat (ChatPage - team messaging)
    ├── /settings (SettingsPage - project-specific workflow rules)
    └── /approvals/settings (ApprovalsSettingsPage - project approval rules)
```

### Template System

**Built-in Templates** (`src/data/templates/`):
- **residentialTemplate.ts**: 76 tasks, 50 files, 38 documents for residential projects (apartments, villas, homes)

**Custom Templates** (`TemplateContext`):
- Users can create, edit, delete custom templates via `/templates` page
- Templates stored in localStorage with full CRUD operations
- Templates include tasks with checklists, subtasks, files, and documents organized by 7 workflow stages
- Template editor (TemplateEditorPage) has 3 tabs: Tasks, Files, Documents
- TaskTemplateEditor supports inline checklist/subtask editing

**Template Structure**:
```typescript
{
  id, name, description, projectType, isBuiltIn,
  tasks: TemplateTask[],  // With checklistItems, subtasks
  requiredFiles: TemplateFile[],
  stageDocuments: TemplateDocument[]
}
```

**Template Loading** (`src/lib/templateLoader.ts`):
- Auto-loads residential template when creating projects
- Generates unique IDs for all tasks, files, documents
- Tasks/subtasks start **unassigned** (assignee: undefined) - project manager assigns manually
- Generates approval requests from template approvals (8 workflows with source='template')
- Injects into TaskContext, FileContext, DocumentContext, ApprovalContext via localStorage

### Workflow Stage System

**7 Sequential Stages**: Sales → Design → Technical Design → Procurement → Production → Execution → Post Installation

**Stage Metadata** (`ProjectStage` interface):
- **Status**: pending, active, completed, blocked (color-coded in UI)
- **Priority**: low, medium, high, urgent (affects visual indicators)
- **Dates**: startDate, dueDate, completedDate
- **Department Head**: Auto-assigned via `STAGE_TO_DEPARTMENT` mapping
- **Notes**: Stage-specific comments

**Stage Management**:
- **StageContext**: Manages stage metadata per project, auto-initializes 7 stages on project creation
- **WorkflowProgress.tsx**: Visual stepper with clickable stages, shows status/priority/dates/department heads
- **StageDetailDialog**: Edit stage metadata, view progress, see workflow rule requirements

**Department-to-Stage Mapping** (`src/types/index.ts`):
```typescript
DEPARTMENT_STAGES = {
  Sales: ['Sales'], Design: ['Design'], Technical: ['Technical Design'],
  Procurement: ['Procurement'], Production: ['Production'],
  Execution: ['Execution', 'Post Installation'], Admin: [all stages]
}

STAGE_TO_DEPARTMENT = {
  'Sales': 'Sales', 'Design': 'Design', 'Technical Design': 'Technical',
  'Procurement': 'Procurement', 'Production': 'Production',
  'Execution': 'Execution', 'Post Installation': 'Execution'
}
```

**Filtering Logic**:
- `TaskContext.tasks`: Filters by `task.stage` matching user's accessible stages
- `FileContext.files`: Filters by `file.requiredFrom` stage
- `DocumentContext.documents`: Filters by `doc.stage`
- `WorkflowProgress`: Shows only accessible stages or grays out restricted ones

**Department Switcher** (`DepartmentSwitcher.tsx`): Fixed bottom-right component for testing different department views.

### Component Organization

**Feature Components** (src/components/):
- `TaskCard.tsx` - Self-contained task display with all sub-features (subtasks, checklists, attachments, edit/delete)
- `TaskList.tsx` - Tab container for Tasks/Files/Documents tabs
- `AddTaskDialog.tsx` - Create task modal
- `EditTaskDialog.tsx` - Edit task modal
- `DeleteConfirmDialog.tsx` - Reusable delete confirmation
- `StageDocumentsTab.tsx` - Documents grouped by category
- `PriorityBadge.tsx` - Color-coded priority indicators
- `WorkflowProgress.tsx` - 7-stage visual progress stepper
- `HomeSidebar.tsx` - Dashboard stats for projects list page

**Page Components** (src/pages/):
- Pages consume contexts via hooks
- Layout components wrap child routes (ProjectLayout)

### TypeScript Types

All types defined in `src/types/index.ts`:
- Core types: `WorkflowStage`, `TaskStatus`, `TaskPriority`, `Department`, `DocumentCategory`
- Data types: `Task`, `Subtask`, `ChecklistItem`, `AttachedFile`, `RequiredFile`, `StageDocument`, `Project`
- Context interfaces: `ProjectContextType`, `TaskContextType`, etc.
- Form interfaces: `CreateProjectForm`, `CreateTaskForm`, `CreateSubtaskForm`

**Important**: Use `type` imports for verbatimModuleSyntax compliance:
```typescript
import type { Task, WorkflowStage } from '@/types'
```

### Theme & Design System

**Tailwind CSS 4.1 Configuration**:
- CSS-first configuration (not JavaScript config)
- Theme colors defined in `src/index.css` using `@theme` directive
- Colors use OKLCH color space for better color consistency
- Dark mode: Uses `.dark` class selector (toggle via `ThemeSwitcher` component)
- PostCSS plugin: `@tailwindcss/postcss` (not `tailwindcss`)

**Theme Colors**:

Light Mode (`src/index.css` lines 16-66):
```json
{
  "colors": {
    "primary": "#3B82F6",
    "secondary": "#6366F1",
    "accent": "#F59E0B",
    "background": "#F9FAFB",
    "surface": "#FFFFFF",
    "border": "#E5E7EB",
    "text": {
      "primary": "#111827",
      "secondary": "#6B7280"
    },
    "status": {
      "success": "#10B981",
      "warning": "#FBBF24",
      "error": "#EF4444",
      "info": "#0EA5E9"
    }
  },
  "shadows": {
    "card": "0 1px 3px rgba(0, 0, 0, 0.1)",
    "elevated": "0 4px 6px rgba(0, 0, 0, 0.1)"
  },
  "radius": {
    "small": "8px",
    "medium": "12px",
    "large": "16px"
  },
  "typography": {
    "fontFamily": "'Inter', 'Roboto', sans-serif",
    "baseSize": "16px"
  }
}
```

Dark Mode (`src/index.css` lines 99-121):
```json
{
  "colors": {
    "primary": "#60A5FA",
    "secondary": "#818CF8",
    "accent": "#FBBF24",
    "background": "#111827",
    "surface": "#1F2937",
    "border": "#374151",
    "text": {
      "primary": "#F9FAFB",
      "secondary": "#9CA3AF"
    },
    "status": {
      "success": "#34D399",
      "warning": "#FCD34D",
      "error": "#F87171",
      "info": "#38BDF8"
    }
  },
  "shadows": {
    "card": "0 1px 3px rgba(0, 0, 0, 0.3)",
    "elevated": "0 4px 6px rgba(0, 0, 0, 0.4)"
  }
}
```

**Theme Token Usage**:
- **ALWAYS** use theme tokens instead of hardcoded colors
- Text: `text-foreground`, `text-muted-foreground`
- Backgrounds: `bg-background`, `bg-card`, `bg-muted`
- Borders: `border-border`
- Hover states: `hover:bg-muted`
- Shadows: `shadow-card`, `shadow-elevated`
- Border radius: `rounded-sm` (8px), `rounded-md` (12px), `rounded-lg` (16px)

### Task & Subtask Management

**Enhanced Task Properties**:
- **Core**: title, description, dueDate, assignee/assignees (multiple), status, priority, stage
- **Subtasks**: Full feature parity with tasks - priority, status, description, dueDate, attachments, multiple assignees
- **Checklists**: Simple checkbox items with labels
- **Attachments**: Responsive grid (1-4 columns), vertical card layout, download/delete
- **Timestamps**: createdAt, updatedAt

**Subtask Enhanced Features**:
- **Priority/Status Dropdowns**: Inline selectors in subtask card
- **Edit Dialog**: EditSubtaskDialog with all fields
- **Multiple Assignees**: Checkbox list, overlapping avatar display
- **Attachments**: File grid with preview, download, remove
- **Add Form**: Comprehensive form with title, description, priority, status, due date, assignees

**Task Operations** (via TaskContext):
- Tasks: `createTask`, `updateTask`, `deleteTask`, `toggleTaskStatus`
- Subtasks: `addSubtask`, `toggleSubtask`, `deleteSubtask`, `updateSubtask`, `updateSubtaskStatus`, `updateSubtaskPriority`, `attachFileToSubtask`, `removeFileFromSubtask`
- Checklists: `addChecklistItem`, `toggleChecklistItem`, `deleteChecklistItem`
- Files: `attachFile`, `removeFile`

**UI Patterns**:
- "Add Checklist Item" button appears when task has no checklists (discoverability)
- Inline forms for subtasks/checklists with Enter key support
- Hover-to-reveal edit/delete buttons (opacity-0 to opacity-100 on group-hover)
- Priority badges with color coding
- Responsive file grids: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`

### Common Patterns

### Workflow Rules System

**Rule Types** (WorkflowRulesContext):
1. **Stage Transition Rules**: Validate requirements before stage completion (all tasks done, files uploaded, docs approved)
2. **Auto-Assignment Rules**: Automatically assign tasks to department heads or team members
3. **Approval Rules**: Require approvals from specific roles before stage progression
4. **Validation Rules**: Define minimum required items (tasks/files/docs count) per stage

**Scope Levels**:
- **Global Rules**: Apply to all projects, managed in `/settings`
- **Project Rules**: Override globals for specific projects, managed in `/projects/:id/settings`

**Validation Flow**:
- WorkflowRulesContext provides `canCompleteStage(stage)` and `getMissingRequirements(stage)`
- StageDetailDialog displays requirements checklist with color-coded status
- Rules can be enabled/disabled via toggle switches in Settings

**Adding New Features**:
1. Add types to `src/types/index.ts`
2. Add context methods if needing cross-component state
3. Create component in appropriate directory (use `src/components/settings/` for settings, `src/components/template/` for templates)
4. Use existing shadcn/ui components from `src/components/ui/`
5. Import contexts via hooks: `useProjects()`, `useTasks()`, `useFiles()`, `useDocuments()`, `useTeam()`, `useUser()`, `useStages()`, `useTemplates()`, `useWorkflowRules()`

**Adding New shadcn/ui Components**:
- Install Radix UI primitive: `npm install @radix-ui/react-[component]`
- Create component in `src/components/ui/[component].tsx`
- Follow existing patterns (use `cn()` utility, React.forwardRef, proper props)

**Department Filtering**:
- Always filter data by `canAccessStage(stage)` from `useUser()` hook
- Check `visibleStages` for form dropdowns
- Use `DEPARTMENT_STAGES` mapping from types

## Known Issues & Patterns

**Context Hook Dependencies**:
- **Order matters**: Contexts depend on earlier contexts in the provider tree
- StageContext needs TaskContext, FileContext, DocumentContext for progress calculation
- WorkflowRulesContext needs all data contexts for validation
- Always maintain exact provider nesting order from App.tsx

**localStorage Keys & Migration**:
- **Global**: `projects`, `currentUser`, `currentProject`, `projectTemplates`, `workflowRules`
- **Project-scoped**: `tasks`, `files`, `documents`, `activities`, `stages`, `projectWorkflowRules`
- **Migration logic**: StageContext auto-migrates old subtask format, initializes missing stage metadata
- Clear localStorage if making breaking schema changes

**Template Loading**:
- Custom templates managed via TemplateContext and `/templates` page
- Built-in residential template marked `isBuiltIn: true` (read-only)
- Template loading generates unique IDs and assigns team members on project creation

**HMR Issues**:
- Complex nested JSX can cause Vite HMR errors
- Incorrect provider nesting causes "Expected corresponding JSX closing tag" errors
- Solution: Restart dev server with `npm run dev` to clear cached errors
- Extract complex components into separate files if HMR repeatedly fails

## Styling Conventions

- **ALWAYS use theme tokens** instead of hardcoded colors (see Theme & Design System section)
- Responsive grids: Use Tailwind breakpoints `sm:`, `md:`, `lg:`, `xl:` for column counts
- Dark mode: Applied via `.dark` class on root, toggled by ThemeSwitcher component
- Spacing: Consistent gap-* and space-y-* utilities
- **Correct patterns**:
  - Text: `text-foreground`, `text-muted-foreground` (NOT `text-slate-900 dark:text-slate-50`)
  - Backgrounds: `bg-background`, `bg-card`, `bg-muted` (NOT `bg-white dark:bg-slate-900`)
  - Borders: `border-border` (NOT `border-slate-200 dark:border-slate-800`)
  - Hover: `hover:bg-muted` (NOT `hover:bg-slate-100 dark:hover:bg-slate-800`)

## File Naming

- Components: PascalCase (TaskCard.tsx)
- Pages: PascalCase with Page suffix (ProjectsListPage.tsx)
- Contexts: PascalCase with Context suffix (ProjectContext.tsx)
- Utilities: camelCase (helpers.ts, templateLoader.ts, ruleEvaluator.ts)
- Types: index.ts (single source of truth)

## Custom Status System

**StatusConfigContext** (`src/contexts/StatusConfigContext.tsx`):
- Centralized management of custom statuses for all entity types
- **26 default statuses** across: tasks, subtasks, issues, stages, documents, files, projects
- Status types changed from fixed unions to `string` for flexibility
- CRUD operations: create, update, delete, reorder statuses
- Workflow transitions: define allowed status changes
- Auto-actions: trigger actions on status change (planned feature)

**Status Configuration** (accessible via `/settings` → Status Configuration tab):
- **7 entity type tabs**: Tasks, Subtasks, Issues, Stages, Documents, Files, Projects
- **Drag-and-drop reordering** using @dnd-kit/core and @dnd-kit/sortable
- **Color picker** with 12 preset colors + custom hex input (react-colorful)
- **Icon picker** with 40+ curated Lucide icons
- **Status badges** dynamically rendered with configured colors and icons
- **Status selectors** (StatusSelector, StatusSelect) replace hardcoded dropdown options

**Components**:
- `src/components/ui/status-badge.tsx` - Dynamic badge rendering
- `src/components/ui/status-selector.tsx` - Reusable status dropdown
- `src/components/ui/color-picker.tsx` - Color selection with presets
- `src/components/ui/icon-picker.tsx` - Searchable icon grid
- `src/components/settings/StatusConfigTab.tsx` - Management UI
- `src/components/settings/AddStatusDialog.tsx` - Status creation
- `src/components/settings/EditStatusDialog.tsx` - Status editing

**localStorage**: `statusConfigurations` (global, shared across all projects)

## Multi-Level Approval System

**Architecture**: 4-source approval system with template defaults, manual addition, global rules, and project-specific rules.

### ApprovalContext (`src/contexts/ApprovalContext.tsx`)

Manages approval request lifecycle:
- **CRUD Operations**: create, update, approve, reject, delegate approval requests
- **Sequential Chains**: Multi-level approvals (up to 3+ levels) with auto-progression
- **Comment System**: Discussion threads on approvals
- **Audit Trail**: Full history of all approval actions
- **Delegation**: Reassign approvals to other team members
- **Smart Assignment**: Auto-assigns approvers based on role (department heads, PM, admin, clients)

**Key Methods**:
- `approveRequest(id, comment?)` - Approve and auto-advance to next level
- `rejectRequest(id, reason, comment?)` - Reject with reason (stops chain)
- `delegateRequest(id, toUserId)` - Reassign to another user
- `getPendingApprovals()`, `getMyApprovals(userId)`, `getApprovalsByStage(stage)`
- `canApprove(requestId, userId)`, `getApprovalStatus(entityType, entityId)`

### ApprovalRuleContext (`src/contexts/ApprovalRuleContext.tsx`)

Manages approval rule configuration:
- **Rule-Based Matching**: Smart matching via stages, priority, categories, title patterns (regex)
- **Auto-Application**: Rules automatically create approval requests for matching items
- **Scope Support**: Global rules (all projects) + Project-specific rules (overrides)
- **Rule Evaluation**: `getMatchingRules(entity)`, `applyRulesToEntity(entity, projectId)`

**Matching Criteria** (`ApprovalMatchingCriteria`):
- `stages[]` - Match items in specific workflow stages
- `priority[]` - Match tasks with specific priorities
- `documentCategory[]` - Match documents by category
- `titlePattern` - Regex pattern for title matching
- `tags[]` - Future: tag-based matching

### Approval Sources (4 Types)

**1. Template Approvals** (source: 'template', 📋 blue badge):
- Defined in template.approvals array
- Auto-loaded when creating project from template
- Residential template includes 8 workflows (18 individual configs)
- Examples: Design stage client approval, Technical drawings 3-level chain, Quality inspection

**2. Manual Approvals** (source: 'manual', ✋ orange badge):
- "Require Approval" button on TaskCard
- QuickAddApprovalDialog for quick configuration
- One-off approval requests for specific items

**3. Global Approval Rules** (source: 'global-rule', 🌐 purple badge):
- Configured in `/approvals/settings`
- Apply to all projects automatically
- Auto-create approval requests for matching items
- Examples: "All high-priority tasks need Admin approval"

**4. Project Approval Rules** (source: 'project-rule', 📁 green badge):
- Configured in `/projects/:id/approvals/settings`
- Override global rules for specific project
- Higher precedence than global rules

### Approval Workflow Integration

**Auto-Application** (TaskContext):
```typescript
createTask() → Auto-applies matching approval rules → Creates approval requests
```

**Stage Completion Validation** (WorkflowRulesContext):
```typescript
canCompleteStage() → Checks pending approvals → Blocks if approvals pending
```

**Stage Detail Dialog**:
- Shows "Stage Approvals" section with pending/approved counts
- Displays ApprovalsList component filtered by stage
- Visual approval progress indicators

### Approval Components

**Core Components**:
- `ApprovalRequestCard.tsx` - Rich display with chain progress, comments, history
- `ApprovalActionDialog.tsx` - Unified approve/reject/delegate interface
- `ApprovalBadge.tsx` - Status indicators with source badges
- `ApprovalsList.tsx` - Filterable list with tabs (All/Pending/Approved/Rejected)
- `QuickAddApprovalDialog.tsx` - Manual approval creation
- `ApprovalsPage.tsx` - Dashboard with statistics
- `ApprovalsSettingsPage.tsx` - Rule management (3 tabs: Rules/Statistics/Documentation)
- `ApprovalRulesTab.tsx` - Rule display and management
- `AddApprovalRuleDialog.tsx` - 2-step wizard for rule creation

**Approval Request Fields**:
- `source`, `ruleId`, `templateApprovalId` - Track origin
- `currentApprovalLevel` - Position in sequential chain
- `approvalConfigs[]` - Chain of approvers
- `status`, `assignedTo`, `comments`, `history` - Lifecycle tracking

**Residential Template Approvals** (`src/data/templates/residentialTemplate.ts`):
- 8 approval workflows with 18 individual configs
- Mix of 1-level, 2-level, and 3-level sequential chains
- Covers tasks, documents, and stages
- Examples: Client design approval, Technical drawings (tech→consultant→client), Quality inspection (execution→PM→client)

### Approval Rule Matching (`src/lib/ruleEvaluator.ts`)

Intelligent rule evaluation:
- `matchesRule(entity, rule)` - Check if entity matches all criteria
- `getMatchingRules(entity, allRules, entityType)` - Find applicable rules
- `countRuleMatches(rule, entities)` - Preview rule impact
- `validateCriteria(criteria)` - Form validation
- `getCriteriaDescription(criteria)` - Human-readable rule description

## Responsive Design

**Breakpoints**:
- Mobile: < 640px (sm)
- Tablet: 640px - 1024px (md, lg)
- Desktop: 1024px - 1280px (lg, xl)
- Large Desktop: ≥ 1280px (xl+)

**Mobile Optimizations**:
- **Header**: Hamburger menu, hidden search bar (icon only), responsive spacing
- **LeftSidebar**: Slide-out drawer with backdrop overlay, fixed positioning
- **RightSidebar**: Hidden on screens < 1280px
- **HomeSidebar**: Full width on mobile, stacks below content
- **WorkflowProgress**: Horizontal scroll for 7 stages, smaller text/badges
- **DepartmentSwitcher**: Compact sizing, positioned bottom-right

**Layout Patterns**:
- Use `flex-col lg:flex-row` for mobile→desktop transitions
- Grid cols: `grid-cols-1 md:grid-cols-2 lg:grid-cols-4`
- Padding: `p-4 sm:p-6 lg:p-8`
- Text: `text-xl sm:text-2xl lg:text-3xl`

## Project Deletion

**DeleteProjectDialog** (`src/components/DeleteProjectDialog.tsx`):
- Type-to-confirm deletion (must type exact project name)
- Shows detailed project info before deletion
- Multiple warnings about data loss
- Integrated into ProjectCard, ProjectListView, ProjectTableView, ProjectKanbanView
- Deletes all associated data: tasks, files, documents, activities, stages, workflow rules, approvals

## Department Switcher (Demo/Testing Only)

Located in sidebar, not fixed overlay. **For testing purposes only** - in production, department would be determined by user authentication. Allows switching between departments to test role-based access control without multiple logins.
