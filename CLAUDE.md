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

The application uses **React Context API** with localStorage persistence. Five main contexts manage global state:

1. **UserContext** - Department-based role system (Admin, Sales, Design, Technical, Procurement, Production, Execution)
2. **ProjectContext** - Multi-project management, create/update/delete operations
3. **TaskContext** - Tasks scoped by current project, full CRUD with subtasks/checklists/attachments
4. **FileContext** - Required files scoped by project and filtered by department
5. **DocumentContext** - Stage documents with status tracking (uploaded, pending, approved, rejected)
6. **TeamContext** - Team members and activity feed

**Critical**: Contexts MUST be nested in this order in App.tsx:
```
UserProvider > ProjectProvider > TaskProvider > FileProvider > DocumentProvider > TeamProvider
```

TaskContext, FileContext, and DocumentContext all call `useUser()` hook to filter data by department permissions.

### Data Persistence

All data persists to browser localStorage:
- Keys: `projects`, `tasks`, `files`, `documents`, `activities`, `currentUser`, `currentProject`
- Structure: `tasks`, `files`, `documents`, `activities` are keyed by project ID: `Record<string, T[]>`
- Auto-saves on every state change via useEffect

### Routing Structure

```
/ (ProjectsListPage with HomeSidebar)
├── /projects/new (NewProjectPage with template selector)
└── /projects/:id (ProjectLayout with Header, LeftSidebar, RightSidebar)
    ├── /overview (ProjectOverviewPage - dashboard & stats)
    ├── /workflow (WorkflowPage - tasks with 3 tabs)
    └── /files (FilesPage - files grouped by stage)
```

### Template System

Located in `src/data/templates/`:
- **residentialTemplate.ts**: 76 tasks, 50 files, 38 documents for residential projects
- **retailTemplate.ts**: 64 tasks, 58 files, 40 documents for commercial/retail projects

Template structure:
```typescript
{
  tasks: { [stage]: Task[] },  // Grouped by workflow stage
  requiredFiles: RequiredFile[],
  stageDocuments: StageDocument[]
}
```

**Template loading** (`src/lib/templateLoader.ts`):
- Called during project creation if `templateType` provided
- Generates unique IDs for all items
- Auto-assigns team members based on workflow stage
- Loads data into TaskContext, FileContext, DocumentContext via localStorage

### Department-Based Access Control

**Department-to-Stage Mapping** (defined in `src/types/index.ts`):
```typescript
DEPARTMENT_STAGES = {
  Sales: ['Sales'],
  Design: ['Design'],
  Technical: ['Technical Design'],
  Procurement: ['Procurement'],
  Production: ['Production'],
  Execution: ['Execution', 'Post Installation'],
  Admin: [all stages]
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

### Tailwind CSS 4.1 Configuration

Uses CSS-first configuration (not JavaScript config):
- Theme colors defined in `src/index.css` using `@theme` directive
- Colors use OKLCH color space
- Custom colors: `primary` (#1193d4), `success` (#22c55e), `warning` (#f59e0b), `danger` (#ef4444)
- Dark mode: Uses `.dark` class selector
- PostCSS plugin: `@tailwindcss/postcss` (not `tailwindcss`)

### Task Management Features

**Task Properties**:
- Basic: title, description, dueDate, assignee, status, priority, stage
- Nested: subtasks (with assignee), checklistItems, attachments
- Timestamps: createdAt, updatedAt

**Task Operations** (via TaskContext):
- `createTask`, `updateTask`, `deleteTask`, `toggleTaskStatus`
- `addSubtask`, `toggleSubtask`, `deleteSubtask`
- `addChecklistItem`, `toggleChecklistItem`, `deleteChecklistItem`
- `attachFile`, `removeFile`

**UI Patterns**:
- Inline forms for subtasks/checklists (show/hide with state)
- Hover-to-reveal delete buttons (opacity-0 to opacity-100 on group-hover)
- Priority badges with icons (Low/Medium/High/Urgent)
- File attachments displayed inline in grid layout

### Common Patterns

**Adding New Features**:
1. Add types to `src/types/index.ts`
2. Add context methods if needing cross-component state
3. Create component in appropriate directory
4. Use existing shadcn/ui components from `src/components/ui/`
5. Import contexts via hooks: `useProjects()`, `useTasks()`, `useFiles()`, `useDocuments()`, `useTeam()`, `useUser()`

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
- TaskContext, FileContext, DocumentContext depend on UserContext being provided first
- TaskContext also depends on ProjectContext for `currentProject`
- Always maintain provider nesting order in App.tsx

**localStorage Keys**:
- Data stored per project ID for tasks/files/documents/activities
- `currentUser` and `currentProject` stored as single objects
- Clear localStorage if data structure changes

**Template Loading**:
- Templates load during project creation, not on app init
- Initial project (p1) uses hardcoded residential template data
- New projects get template data injected via `createProject()`

**HMR Issues**:
- Complex nested JSX can cause Vite HMR errors
- Solution: Extract complex components into separate files (e.g., TaskCard)
- Kill and restart dev server if HMR gets stuck with cached errors

## Styling Conventions

- Use Tailwind utility classes
- Dark mode: `dark:` prefix
- Colors: Use theme colors (`text-primary`, `bg-success/20`, etc.)
- Spacing: Consistent gap-* and space-y-* utilities
- Borders: `border-slate-200 dark:border-slate-800` pattern
- Backgrounds: `bg-white dark:bg-[#101c22]` for main panels

## File Naming

- Components: PascalCase (TaskCard.tsx)
- Pages: PascalCase with Page suffix (ProjectsListPage.tsx)
- Contexts: PascalCase with Context suffix (ProjectContext.tsx)
- Utilities: camelCase (helpers.ts, templateLoader.ts)
- Types: index.ts (single source of truth)
