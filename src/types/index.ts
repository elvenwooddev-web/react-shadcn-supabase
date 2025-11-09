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
export type StageStatus = 'pending' | 'active' | 'completed' | 'blocked'

// Issue Types
export type IssueStatus = 'open' | 'in-progress' | 'resolved' | 'closed'
export type IssueSeverity = 'low' | 'medium' | 'high' | 'critical'
export type IssueSource = 'task' | 'subtask'

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

// Map stages to their owning departments
export const STAGE_TO_DEPARTMENT: Record<WorkflowStage, Department> = {
  'Sales': 'Sales',
  'Design': 'Design',
  'Technical Design': 'Technical',
  'Procurement': 'Procurement',
  'Production': 'Production',
  'Execution': 'Execution',
  'Post Installation': 'Execution',
}

export interface ProjectStage {
  id: string
  stage: WorkflowStage
  status: StageStatus
  priority: TaskPriority
  startDate: string | null
  dueDate: string | null
  completedDate: string | null
  departmentHead: TeamMember | null
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export interface TemplateStage {
  stage: WorkflowStage
  status: StageStatus
  priority: TaskPriority
  startDate: string | null
  dueDate: string | null
  departmentHeadRole: string // Role to match when creating project (e.g., "Sales Manager", "Designer")
  notes?: string
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
  trackingId: string
  label: string
  description?: string
  completed: boolean
  status: TaskStatus
  priority: TaskPriority
  assigneeId: string
  avatar: string
  assignees?: TeamMember[]
  dueDate?: string
  attachments?: AttachedFile[]
  createdAt: Date
  updatedAt: Date
}

export interface Task {
  id: string
  trackingId: string
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
  requiredForProgression?: boolean
  linkedTaskId?: string
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

export interface IssueComment {
  id: string
  text: string
  author: TeamMember
  createdAt: Date
}

export interface Issue {
  id: string
  trackingId: string
  projectId: string
  projectCode: string
  title: string
  description: string
  severity: IssueSeverity
  status: IssueStatus
  sourceType: IssueSource
  sourceId: string // taskId
  sourceTrackingId: string // task trackingId for display
  subtaskId?: string // if sourceType is 'subtask'
  subtaskTrackingId?: string // subtask trackingId for display
  stage: WorkflowStage
  reportedBy: TeamMember
  assignedTo?: TeamMember
  attachments?: AttachedFile[]
  comments?: IssueComment[]
  createdAt: Date
  updatedAt: Date
  resolvedAt?: Date
  resolvedBy?: TeamMember
  resolutionNote?: string
}

export interface Project {
  id: string
  projectCode: string
  name: string
  description: string
  clientName: string
  projectType: string
  startDate: string
  estimatedCompletion: string
  currentStage: WorkflowStage
  stages: ProjectStage[]
  status: ProjectStatus
  projectManager: TeamMember
  teamMembers: TeamMember[]
  logo: string
  taskCounter: number
  subtaskCounter: number
  issueCounter: number
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
  projectCode: string
  startDate: string
  estimatedCompletion: string
  projectManagerId: string
  templateType?: 'residential'
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
  description?: string
  assigneeId: string
  assigneeIds?: string[]
  priority?: TaskPriority
  status?: TaskStatus
  dueDate?: string
}

export interface CreateIssueForm {
  title: string
  description: string
  severity: IssueSeverity
  sourceType: IssueSource
  sourceId: string
  sourceTrackingId: string
  subtaskId?: string
  subtaskTrackingId?: string
  assignedToId?: string
}

// Context Types
export interface ProjectContextType {
  projects: Project[]
  currentProject: Project | null
  setCurrentProject: (project: Project | null) => void
  createProject: (data: CreateProjectForm) => void
  updateProject: (id: string, data: Partial<Project>) => void
  deleteProject: (id: string) => void
  getNextTaskTrackingId: () => string
  getNextSubtaskTrackingId: () => string
  getNextIssueTrackingId: () => string
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
  updateSubtask: (taskId: string, subtaskId: string, data: Partial<Subtask>) => void
  updateSubtaskStatus: (taskId: string, subtaskId: string, status: TaskStatus) => void
  updateSubtaskPriority: (taskId: string, subtaskId: string, priority: TaskPriority) => void
  updateSubtaskAssignee: (taskId: string, subtaskId: string, assigneeId: string, avatar: string) => void
  attachFileToSubtask: (taskId: string, subtaskId: string, file: AttachedFile) => void
  removeFileFromSubtask: (taskId: string, subtaskId: string, fileId: string) => void
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

// Template Types
export interface TemplateTask {
  title: string
  description?: string
  dueDate?: string
  status: TaskStatus
  priority: TaskPriority
  stage: WorkflowStage
  checklistItems?: Omit<ChecklistItem, 'id'>[]
  subtasks?: Omit<Subtask, 'id' | 'assigneeId' | 'avatar' | 'createdAt' | 'updatedAt'>[]
  attachments?: Omit<AttachedFile, 'id' | 'uploadedAt' | 'uploadedBy'>[]
}

export interface TemplateFile {
  fileName: string
  requiredFrom: WorkflowStage
  status: FileStatus
  description?: string
}

export interface TemplateDocument {
  title: string
  category: DocumentCategory
  stage: WorkflowStage
  status: DocumentStatus
  description?: string
  requiredForProgression?: boolean
  linkedTaskId?: string
}

export interface ProjectTemplate {
  id: string
  name: string
  description: string
  projectType: string
  isBuiltIn: boolean
  createdAt: Date
  updatedAt: Date
  tasks: TemplateTask[]
  requiredFiles: TemplateFile[]
  stageDocuments: TemplateDocument[]
  stages?: TemplateStage[]
  thumbnail?: string
  tags?: string[]
  usageCount?: number
}

export interface CreateTemplateForm {
  name: string
  description: string
  projectType: string
}

export interface TemplateContextType {
  templates: ProjectTemplate[]
  createTemplate: (data: CreateTemplateForm) => string
  updateTemplate: (id: string, data: Partial<ProjectTemplate>) => void
  deleteTemplate: (id: string) => void
  duplicateTemplate: (id: string, newName: string) => void
  getTemplate: (id: string) => ProjectTemplate | undefined
  addTaskToTemplate: (templateId: string, task: TemplateTask) => void
  updateTemplateTask: (templateId: string, taskIndex: number, data: Partial<TemplateTask>) => void
  deleteTemplateTask: (templateId: string, taskIndex: number) => void
  addFileToTemplate: (templateId: string, file: TemplateFile) => void
  deleteTemplateFile: (templateId: string, fileIndex: number) => void
  addDocumentToTemplate: (templateId: string, doc: TemplateDocument) => void
  deleteTemplateDocument: (templateId: string, docIndex: number) => void
  updateTemplateStage: (templateId: string, stageIndex: number, data: Partial<TemplateStage>) => void
}

export interface StageContextType {
  stages: ProjectStage[]
  updateStage: (stageId: string, data: Partial<ProjectStage>) => void
  updateStageStatus: (stage: WorkflowStage, status: StageStatus) => void
  updateStagePriority: (stage: WorkflowStage, priority: TaskPriority) => void
  updateStageDates: (stage: WorkflowStage, startDate: string | null, dueDate: string | null) => void
  updateStageDepartmentHead: (stage: WorkflowStage, departmentHead: TeamMember | null) => void
  completeStage: (stage: WorkflowStage) => void
  getStageByName: (stage: WorkflowStage) => ProjectStage | undefined
  getStageProgress: (stage: WorkflowStage) => { tasksComplete: number; tasksTotal: number; percentComplete: number }
}

// Workflow Rules Types
export type RuleType = 'stage-transition' | 'auto-assignment' | 'approval' | 'validation'

export interface WorkflowRule {
  id: string
  name: string
  description: string
  enabled: boolean
  ruleType: RuleType
  scope: 'global' | 'project'
  projectId?: string
  createdAt: Date
  updatedAt: Date
}

export interface StageTransitionRule extends WorkflowRule {
  ruleType: 'stage-transition'
  applicableStages: WorkflowStage[]
  conditions: {
    requireAllTasksComplete: boolean
    requireAllFilesUploaded: boolean
    requireAllDocsApproved: boolean
    minimumChecklistCompletion: number
    requireDepartmentHeadApproval: boolean
    blockStageSkipping: boolean
  }
  actions: {
    autoActivateNextStage: boolean
    notifyNextDepartment: boolean
  }
}

export interface AutoAssignmentRule extends WorkflowRule {
  ruleType: 'auto-assignment'
  applicableStages: WorkflowStage[]
  assignmentStrategy: 'department-head' | 'round-robin' | 'specific-role'
  targetRole?: string
}

export interface ApprovalRule extends WorkflowRule {
  ruleType: 'approval'
  applicableStages: WorkflowStage[]
  approverRole: Department | 'project-manager' | 'admin'
  required: boolean
}

export interface ValidationRule extends WorkflowRule {
  ruleType: 'validation'
  applicableStages: WorkflowStage[]
  requiredTasksCount: number
  requiredFilesCount: number
  requiredDocumentsCount: number
}

export type AnyWorkflowRule = StageTransitionRule | AutoAssignmentRule | ApprovalRule | ValidationRule

export interface WorkflowRulesContextType {
  rules: AnyWorkflowRule[]
  globalRules: AnyWorkflowRule[]
  projectRules: AnyWorkflowRule[]

  createRule: (rule: Omit<AnyWorkflowRule, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateRule: (id: string, data: Partial<AnyWorkflowRule>) => void
  deleteRule: (id: string) => void
  toggleRuleEnabled: (id: string) => void

  canCompleteStage: (stage: WorkflowStage) => { allowed: boolean; reasons: string[] }
  getMissingRequirements: (stage: WorkflowStage) => string[]
  getActiveRulesForStage: (stage: WorkflowStage) => AnyWorkflowRule[]
}

export interface IssueContextType {
  issues: Issue[]
  allIssues: Issue[] // Issues from all projects
  createIssue: (data: CreateIssueForm) => void
  updateIssue: (id: string, data: Partial<Issue>) => void
  deleteIssue: (id: string) => void
  resolveIssue: (id: string, note?: string) => void
  reopenIssue: (id: string) => void
  addComment: (issueId: string, text: string) => void
  deleteComment: (issueId: string, commentId: string) => void
  getIssuesForTask: (taskId: string) => Issue[]
  getIssuesForSubtask: (taskId: string, subtaskId: string) => Issue[]
  getOpenIssuesCount: () => number
  getCriticalIssuesCount: () => number
}
