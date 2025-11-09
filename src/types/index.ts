// Core Data Types for InteriorsFlow Application

export type WorkflowStage =
  | 'Sales'
  | 'Design'
  | 'Technical Design'
  | 'Procurement'
  | 'Production'
  | 'Execution'
  | 'Post Installation'

export type Department =
  | 'Sales'
  | 'Design'
  | 'Technical'
  | 'Procurement'
  | 'Production'
  | 'Execution'
  | 'Admin'

export type TaskStatus = 'completed' | 'in-progress' | 'todo' | 'blocked'
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'
export type FileStatus = 'received' | 'pending' | 'missing'
export type ProjectStatus = 'active' | 'on-hold' | 'completed' | 'archived'
export type DocumentCategory = 'contract' | 'report' | 'specification' | 'checklist'
export type DocumentStatus = 'uploaded' | 'pending' | 'approved' | 'rejected'

export interface User {
  id: string
  name: string
  email: string
  avatar: string
  role: 'admin' | 'sales' | 'designer' | 'technical-designer' | 'procurement' | 'production' | 'execution'
  department: Department
}

// Map departments to workflow stages they can access
export const DEPARTMENT_STAGES: Record<Department, WorkflowStage[]> = {
  Sales: ['Sales'],
  Design: ['Design'],
  Technical: ['Technical Design'],
  Procurement: ['Procurement'],
  Production: ['Production'],
  Execution: ['Execution', 'Post Installation'],
  Admin: ['Sales', 'Design', 'Technical Design', 'Procurement', 'Production', 'Execution', 'Post Installation'],
}

export interface TeamMember {
  id: string
  name: string
  role: string
  avatar: string
  userId?: string
}

export interface AttachedFile {
  id: string
  name: string
  size: string
  type: 'pdf' | 'image' | 'doc' | 'other'
  url: string
  uploadedAt: Date
  uploadedBy: string
}

export interface ChecklistItem {
  id: string
  label: string
  completed: boolean
}

export interface Subtask {
  id: string
  label: string
  completed: boolean
  assigneeId: string
  avatar: string
}

export interface Task {
  id: string
  title: string
  description?: string
  dueDate: string
  assignee: TeamMember
  assignees?: TeamMember[] // Optional array for multiple assignees
  status: TaskStatus
  priority: TaskPriority
  stage: WorkflowStage
  checklistItems?: ChecklistItem[]
  subtasks?: Subtask[]
  attachments?: AttachedFile[]
  createdAt: Date
  updatedAt: Date
}

export interface RequiredFile {
  id: string
  fileName: string
  uploadDate: string | null
  requiredFrom: WorkflowStage
  status: FileStatus
  fileUrl?: string
}

export interface StageDocument {
  id: string
  title: string
  category: DocumentCategory
  stage: WorkflowStage
  status: DocumentStatus
  uploadDate: string | null
  fileUrl?: string
  description?: string
}

export interface StageProgress {
  stageName: WorkflowStage
  status: 'completed' | 'current' | 'upcoming'
  completedTasks: number
  totalTasks: number
}

export interface Activity {
  id: string
  type: 'task-completed' | 'file-uploaded' | 'comment-added' | 'task-created' | 'stage-completed'
  userId: string
  userName: string
  userAvatar: string
  message: string
  timestamp: Date
  relatedTaskId?: string
  relatedFileId?: string
}

export interface Project {
  id: string
  name: string
  description: string
  clientName: string
  projectType: string
  startDate: string
  estimatedCompletion: string
  currentStage: WorkflowStage
  status: ProjectStatus
  projectManager: TeamMember
  teamMembers: TeamMember[]
  logo: string
  createdAt: Date
  updatedAt: Date
}

export interface ProjectStats {
  totalTasks: number
  completedTasks: number
  pendingTasks: number
  blockedTasks: number
  totalFiles: number
  uploadedFiles: number
  completionPercentage: number
}

// Form Types
export interface CreateProjectForm {
  name: string
  description: string
  clientName: string
  projectType: string
  startDate: string
  estimatedCompletion: string
  projectManagerId: string
  templateType?: 'residential' | 'retail'
}

export interface CreateTaskForm {
  title: string
  description?: string
  dueDate: string
  assigneeId: string
  stage: WorkflowStage
  status?: TaskStatus
  priority?: TaskPriority
}

export interface CreateSubtaskForm {
  label: string
  assigneeId: string
}

// Context Types
export interface ProjectContextType {
  projects: Project[]
  currentProject: Project | null
  setCurrentProject: (project: Project | null) => void
  createProject: (data: CreateProjectForm) => void
  updateProject: (id: string, data: Partial<Project>) => void
  deleteProject: (id: string) => void
}

export interface TaskContextType {
  tasks: Task[]
  createTask: (data: CreateTaskForm) => void
  updateTask: (id: string, data: Partial<Task>) => void
  deleteTask: (id: string) => void
  toggleTaskStatus: (id: string) => void
  addSubtask: (taskId: string, data: CreateSubtaskForm) => void
  toggleSubtask: (taskId: string, subtaskId: string) => void
  deleteSubtask: (taskId: string, subtaskId: string) => void
  updateSubtaskAssignee: (taskId: string, subtaskId: string, assigneeId: string, avatar: string) => void
  addChecklistItem: (taskId: string, label: string) => void
  toggleChecklistItem: (taskId: string, itemId: string) => void
  deleteChecklistItem: (taskId: string, itemId: string) => void
  attachFile: (taskId: string, file: AttachedFile) => void
  removeFile: (taskId: string, fileId: string) => void
}

export interface FileContextType {
  files: RequiredFile[]
  uploadFile: (file: File, stage: WorkflowStage) => Promise<void>
  deleteFile: (id: string) => void
  updateFileStatus: (id: string, status: FileStatus) => void
}

export interface TeamContextType {
  teamMembers: TeamMember[]
  activities: Activity[]
  addTeamMember: (member: Omit<TeamMember, 'id'>) => void
  removeTeamMember: (id: string) => void
  addActivity: (activity: Omit<Activity, 'id' | 'timestamp'>) => void
}

export interface UserContextType {
  currentUser: User | null
  setCurrentUser: (user: User | null) => void
  switchDepartment: (department: Department) => void
  canAccessStage: (stage: WorkflowStage) => boolean
  visibleStages: WorkflowStage[]
}
