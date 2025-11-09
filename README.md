# InteriorsFlow - Project Workflow Management

A fully functional project management web application for interior design firms. Built with the latest React stack featuring multi-project support, task management with subtasks, file tracking, and team collaboration.

**✨ Functional Features**: Complete CRUD operations, React Router navigation, local state persistence, interactive UI with real-time updates.

## Tech Stack (Latest 2025 Versions)

- **React 19.2** - UI library with hooks and Context API for state management
- **TypeScript 5.9** - Full type safety across the application
- **Vite 7.2** - Ultra-fast build tool and dev server
- **React Router 7** - Client-side routing for multi-page navigation
- **shadcn/ui** - Production-ready components built with Radix UI
- **Tailwind CSS 4.1** - Modern CSS-first configuration
- **Supabase 2.80** - Ready for backend integration (currently using local state)

## Project Structure

```
src/
├── components/
│   ├── ui/                      # shadcn/ui components
│   │   ├── avatar.tsx
│   │   ├── badge.tsx
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── checkbox.tsx
│   │   ├── dialog.tsx          # Modal dialogs
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   └── progress.tsx
│   ├── AddTaskDialog.tsx        # Create new task modal
│   ├── FilesPage.tsx            # File management by stage
│   ├── Header.tsx               # App header with navigation
│   ├── LeftSidebar.tsx          # Project navigation
│   ├── RightSidebar.tsx         # Team & activity feed
│   ├── TaskList.tsx             # Interactive task list
│   ├── WorkflowPage.tsx         # Main workflow view
│   └── WorkflowProgress.tsx     # Stage progress tracker
├── contexts/
│   ├── ProjectContext.tsx       # Projects state management
│   ├── TaskContext.tsx          # Tasks CRUD operations
│   ├── FileContext.tsx          # File management
│   └── TeamContext.tsx          # Team & activities
├── pages/
│   ├── ProjectLayout.tsx        # Project pages wrapper
│   ├── ProjectsListPage.tsx     # All projects view
│   ├── ProjectOverviewPage.tsx  # Project dashboard
│   └── NewProjectPage.tsx       # Create project form
├── types/
│   └── index.ts                 # TypeScript type definitions
├── lib/
│   ├── helpers.ts               # Utility functions
│   ├── utils.ts                 # Tailwind class merger
│   └── supabase.ts              # Supabase client (ready)
├── App.tsx                      # Router & providers setup
├── main.tsx                     # App entry point
└── index.css                    # Tailwind v4 theme
```

## Getting Started

### Prerequisites

- **Node.js 20.19+ or 22.12+** and npm (Vite 7 requires Node.js 20+)
- A Supabase account and project ([sign up here](https://supabase.com))

### Installation

1. Install dependencies:

```bash
npm install
```

2. Set up environment variables:

Edit the `.env` file in the root directory and add your Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

You can find these values in your Supabase project settings under API.

### Running the Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## 🚀 Functional Features

### Multi-Project Management
- ✅ **Create Projects**: Full form with validation for new projects
- ✅ **Project List**: Grid view with search functionality
- ✅ **Project Switching**: Navigate between multiple projects
- ✅ **Local Storage Persistence**: All data persists across sessions

### Routing & Navigation
- ✅ **React Router Integration**: Full SPA routing
  - `/` - Projects list homepage
  - `/projects/new` - Create new project
  - `/projects/:id/overview` - Project dashboard with stats
  - `/projects/:id/workflow` - Tasks and workflow management
  - `/projects/:id/files` - File management by stage
- ✅ **Active State Highlighting**: Visual feedback for current page
- ✅ **Breadcrumb Navigation**: Easy navigation back to projects

### Task Management (Full CRUD)
- ✅ **Create Tasks**: Modal dialog with form
  - Title, description, due date
  - Assign to team members
  - Set workflow stage and status
- ✅ **Toggle Task Completion**: Interactive checkboxes
- ✅ **Task Status Tracking**: Completed, In Progress, To Do, Blocked
- ✅ **Subtasks**: Add, complete, delete nested subtasks
- ✅ **Checklist Items**: Toggle completion status
- ✅ **File Attachments**: View attached files (PDF, images, docs)
- ✅ **Progress Tracking**: Visual progress bars for subtasks

### File Management
- ✅ **Files by Stage**: Organized by workflow stages
- ✅ **Status Tracking**: Received, Pending, Missing
- ✅ **Overall Completion**: Progress bar showing file upload status
- ✅ **Collapsible Stages**: Expand/collapse file groups
- ✅ **Upload Interface**: Drag & drop zones (UI ready for backend)

### Team Collaboration
- ✅ **Team Members**: Display with avatars and roles
- ✅ **Activity Feed**: Real-time activity updates
- ✅ **Task Assignment**: Assign tasks to team members
- ✅ **Activity Logging**: Auto-log task completions and file uploads

### UI/UX Features
- ✅ **Tab Navigation**: Switch between tasks, files, documents
- ✅ **Visual Status Badges**: Color-coded task and file states
- ✅ **Workflow Progress Stepper**: 7-stage visual tracker
- ✅ **Responsive Layout**: Three-panel design (sidebar, main, sidebar)
- ✅ **Dark Mode Support**: Complete theming system
- ✅ **Interactive Elements**: Hover states, transitions, loading states

## How It Works

### State Management
The app uses **React Context API** for global state management with four main contexts:

1. **ProjectContext** - Manages all projects and current project selection
   - Create, update, delete projects
   - Switch between projects
   - Persists to localStorage

2. **TaskContext** - Handles all task operations
   - CRUD operations for tasks
   - Subtask management (add, toggle, delete)
   - Checklist item management
   - File attachment handling
   - Scoped by current project

3. **FileContext** - Manages file uploads and tracking
   - Upload files (currently using blob URLs)
   - Track file status by workflow stage
   - Ready for Supabase Storage integration

4. **TeamContext** - Team and activity management
   - Team member display
   - Activity feed with timestamps
   - Auto-logs user actions

### Data Persistence
- **Local Storage**: All data persists using browser localStorage
- **Auto-save**: Changes save automatically on every update
- **Initial Data**: Sample project with tasks pre-loaded
- **Migration Ready**: Easy to switch to Supabase backend

### Routing Structure
```
/ (Projects List)
├── /projects/new (Create Project)
└── /projects/:id (Project Layout)
    ├── /overview (Dashboard & Stats)
    ├── /workflow (Tasks & Progress)
    └── /files (File Management)
```

## Usage Guide

### Creating Your First Project
1. Navigate to `http://localhost:5173`
2. Click "New Project" button
3. Fill in the form with project details
4. Click "Create Project" to start

### Managing Tasks
1. Open a project and go to the Workflow page
2. Click "Add Task" button in the header
3. Fill in task details (title, assignee, due date, stage)
4. Tasks appear in the list based on their status
5. Click checkboxes to toggle task completion
6. Subtasks have their own checkboxes for granular tracking

### Navigating the App
- **Projects List** (`/`): View all projects, create new ones
- **Project Overview**: Dashboard with stats and team info
- **Workflow**: Main workspace for task management
- **Files**: Track required files by workflow stage
- **Sidebar Navigation**: Quick access between views
- **Header**: Global search and navigation back to projects

### Key Interactions
- ✅ **Toggle Tasks**: Click checkbox to mark complete
- ✅ **Toggle Subtasks**: Independent completion tracking
- ✅ **View Progress**: Visual bars show subtask completion
- ✅ **Switch Projects**: Click logo or "All Projects" to go home
- ✅ **Search Projects**: Type in search bar on projects page
- ✅ **Tab Navigation**: Switch between task views

## Components Included

### shadcn/ui Library (9 components)

- **Avatar, Badge, Button, Card** - Core UI elements
- **Checkbox, Dialog, Input, Label** - Form components
- **Progress** - Visual progress indicators

### Supabase Client

The Supabase client is pre-configured in `src/lib/supabase.ts`. Import it anywhere:

```typescript
import { supabase } from '@/lib/supabase'

// Example: Fetch data
const { data, error } = await supabase
  .from('your_table')
  .select('*')
```

### Styling

- Tailwind CSS for utility-first styling
- CSS variables for theming (supports light/dark mode)
- Customizable color schemes via `src/index.css`

## Adding More shadcn/ui Components

To add more shadcn/ui components, create them in `src/components/ui/` following the patterns from the [shadcn/ui documentation](https://ui.shadcn.com).

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint

## Configuration

### Path Aliases

The project uses path aliases for cleaner imports:

```typescript
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
```

### Theme Customization

This project uses **Tailwind CSS v4** with CSS-first configuration. Customize your theme directly in `src/index.css` using the `@theme` directive:

```css
@theme {
  --radius: 0.5rem;
  --color-primary: oklch(11.87% 0.019 285.82);
  /* Add your custom theme variables here */
}
```

Colors are defined using modern OKLCH color space for vibrant displays. The project supports light/dark mode out of the box.

### Tailwind Configuration

Tailwind v4 uses CSS-first configuration with automatic content detection. The minimal `tailwind.config.js` only defines:
- Dark mode strategy
- Plugins (like tailwindcss-animate)

Most customization is now done directly in CSS using the `@theme` directive.

## Working with Supabase

### Creating Tables

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor or Table Editor
3. Create your tables

### Example Table with RLS

```sql
-- Create a table
create table items (
  id bigint primary key generated always as identity,
  name text not null,
  created_at timestamptz default now()
);

-- Enable Row Level Security
alter table items enable row level security;

-- Create a policy (adjust based on your needs)
create policy "Allow all operations"
  on items
  for all
  using (true)
  with check (true);
```

## Next Steps & Enhancements

### Ready to Implement
- [ ] **File Upload Backend**: Connect to Supabase Storage for real file uploads
- [ ] **Authentication**: Add Supabase Auth for user login
- [ ] **Database Integration**: Migrate from localStorage to Supabase tables
- [ ] **Real-time Sync**: Add Supabase subscriptions for live updates
- [ ] **Delete Operations**: Add delete task/project functionality
- [ ] **Edit Tasks**: Add edit task modal
- [ ] **Comments System**: Add comments to tasks
- [ ] **Notifications**: Implement toast notifications
- [ ] **Dark Mode Toggle**: Add UI toggle for theme switching
- [ ] **Form Validation**: Add React Hook Form + Zod validation
- [ ] **File Preview**: Add image/PDF preview modals
- [ ] **Bulk Operations**: Multi-select tasks for bulk actions
- [ ] **Export Features**: PDF reports, CSV exports
- [ ] **Search**: Implement global search across all projects
- [ ] **Filters**: Filter tasks by status, assignee, stage
- [ ] **Analytics**: Add project analytics dashboard

### Code Organization Tips
- **Add Services Layer**: Create `src/services/` for API calls
- **Error Boundaries**: Wrap routes in error boundaries
- **Loading States**: Add Suspense boundaries
- **Optimistic Updates**: Update UI before API response
- **Form Library**: Install React Hook Form for complex forms

## Learn More

- [React Documentation](https://react.dev)
- [React Router Documentation](https://reactrouter.com)
- [Vite Documentation](https://vitejs.dev)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Tailwind CSS Documentation](https://tailwindcss.com)
- [Supabase Documentation](https://supabase.com/docs)

## License

MIT
