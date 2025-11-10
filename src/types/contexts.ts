/**
 * Context interface types
 */

import type { WorkflowStage, Department, TaskStatus, TaskPriority, FileStatus } from './enums';
import type {
  Project,
  Task,
  Subtask,
  AttachedFile,
  RequiredFile,
  TeamMember,
  Activity,
  User,
  ProjectStage,
  Issue,
} from './entities';
import type {
  CreateProjectForm,
  CreateTaskForm,
  CreateSubtaskForm,
  CreateIssueForm,
} from './forms';

export interface ProjectContextType {
  projects: Project[];
  currentProject: Project | null;
  setCurrentProject: (project: Project | null) => void;
  createProject: (data: CreateProjectForm) => void;
  updateProject: (id: string, data: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  getNextTaskTrackingId: () => string;
  getNextSubtaskTrackingId: () => string;
  getNextIssueTrackingId: () => string;
}

export interface TaskContextType {
  tasks: Task[];
  createTask: (data: CreateTaskForm) => void;
  updateTask: (id: string, data: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTaskStatus: (id: string) => void;
  addSubtask: (taskId: string, data: CreateSubtaskForm) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  deleteSubtask: (taskId: string, subtaskId: string) => void;
  updateSubtask: (taskId: string, subtaskId: string, data: Partial<Subtask>) => void;
  updateSubtaskStatus: (taskId: string, subtaskId: string, status: TaskStatus) => void;
  updateSubtaskPriority: (taskId: string, subtaskId: string, priority: TaskPriority) => void;
  updateSubtaskAssignee: (taskId: string, subtaskId: string, assigneeId: string, avatar: string) => void;
  attachFileToSubtask: (taskId: string, subtaskId: string, file: AttachedFile) => void;
  removeFileFromSubtask: (taskId: string, subtaskId: string, fileId: string) => void;
  addChecklistItem: (taskId: string, label: string) => void;
  toggleChecklistItem: (taskId: string, itemId: string) => void;
  deleteChecklistItem: (taskId: string, itemId: string) => void;
  attachFile: (taskId: string, file: AttachedFile) => void;
  removeFile: (taskId: string, fileId: string) => void;
}

export interface FileContextType {
  files: RequiredFile[];
  uploadFile: (file: File, stage: WorkflowStage) => Promise<void>;
  deleteFile: (id: string) => void;
  updateFileStatus: (id: string, status: FileStatus) => void;
}

export interface TeamContextType {
  teamMembers: TeamMember[];
  activities: Activity[];
  addTeamMember: (member: Omit<TeamMember, 'id'>) => void;
  removeTeamMember: (id: string) => void;
  addActivity: (activity: Omit<Activity, 'id' | 'timestamp'>) => void;
}

export interface UserContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  switchDepartment: (department: Department) => void;
  canAccessStage: (stage: WorkflowStage) => boolean;
  visibleStages: WorkflowStage[];
}

export interface StageContextType {
  stages: ProjectStage[];
  updateStage: (stageId: string, data: Partial<ProjectStage>) => void;
  updateStageStatus: (stage: WorkflowStage, status: string) => void;
  updateStagePriority: (stage: WorkflowStage, priority: TaskPriority) => void;
  updateStageDates: (stage: WorkflowStage, startDate: string | null, dueDate: string | null) => void;
  updateStageDepartmentHead: (stage: WorkflowStage, departmentHead: TeamMember | null) => void;
  completeStage: (stage: WorkflowStage) => void;
  getStageByName: (stage: WorkflowStage) => ProjectStage | undefined;
  getStageProgress: (stage: WorkflowStage) => { tasksComplete: number; tasksTotal: number; percentComplete: number };
}

export interface IssueContextType {
  issues: Issue[];
  allIssues: Issue[]; // Issues from all projects
  createIssue: (data: CreateIssueForm) => void;
  updateIssue: (id: string, data: Partial<Issue>) => void;
  deleteIssue: (id: string) => void;
  resolveIssue: (id: string, note?: string) => void;
  reopenIssue: (id: string) => void;
  addComment: (issueId: string, text: string) => void;
  deleteComment: (issueId: string, commentId: string) => void;
  getIssuesForTask: (taskId: string) => Issue[];
  getIssuesForSubtask: (taskId: string, subtaskId: string) => Issue[];
  getOpenIssuesCount: () => number;
  getCriticalIssuesCount: () => number;
}

export interface DocumentContext {
  getRequiredDocumentsForStage: (stage: WorkflowStage) => any[];
  getApprovedRequiredDocuments: (stage: WorkflowStage) => number;
  getTotalRequiredDocuments: (stage: WorkflowStage) => number;
}
