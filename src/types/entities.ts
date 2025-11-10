/**
 * Core entity types for the application
 */

import type {
  WorkflowStage,
  Department,
  TaskStatus,
  TaskPriority,
  FileStatus,
  ProjectStatus,
  DocumentCategory,
  DocumentStatus,
  StageStatus,
  IssueStatus,
  IssueSeverity,
  IssueSource,
} from './enums';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'admin' | 'sales' | 'designer' | 'technical-designer' | 'procurement' | 'production' | 'execution';
  department: Department;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar: string;
  userId?: string;
}

export interface AttachedFile {
  id: string;
  name: string;
  size: string;
  type: 'pdf' | 'image' | 'doc' | 'other';
  url: string;
  uploadedAt: Date;
  uploadedBy: string;
}

export interface ChecklistItem {
  id: string;
  label: string;
  completed: boolean;
}

export interface Subtask {
  id: string;
  trackingId: string;
  label: string;
  description?: string;
  completed: boolean;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId: string;
  avatar: string;
  assignees?: TeamMember[];
  dueDate?: string;
  attachments?: AttachedFile[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Task {
  id: string;
  trackingId: string;
  title: string;
  description?: string;
  dueDate: string;
  assignee?: TeamMember; // Optional - tasks can be unassigned
  assignees?: TeamMember[]; // Optional array for multiple assignees
  status: TaskStatus;
  priority: TaskPriority;
  stage: WorkflowStage;
  checklistItems?: ChecklistItem[];
  subtasks?: Subtask[];
  attachments?: AttachedFile[];
  createdAt: Date;
  updatedAt: Date;
}

export interface RequiredFile {
  id: string;
  fileName: string;
  uploadDate: string | null;
  requiredFrom: WorkflowStage;
  status: FileStatus;
  fileUrl?: string;
}

export interface StageDocument {
  id: string;
  title: string;
  category: DocumentCategory;
  stage: WorkflowStage;
  status: DocumentStatus;
  uploadDate: string | null;
  fileUrl?: string;
  description?: string;
  requiredForProgression?: boolean;
  linkedTaskId?: string;
}

export interface ProjectStage {
  id: string;
  stage: WorkflowStage;
  status: StageStatus;
  priority: TaskPriority;
  startDate: string | null;
  dueDate: string | null;
  completedDate: string | null;
  departmentHead: TeamMember | null;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Project {
  id: string;
  projectCode: string;
  name: string;
  description: string;
  clientName: string;
  projectType: string;
  startDate: string;
  estimatedCompletion: string;
  currentStage: WorkflowStage;
  stages: ProjectStage[];
  status: ProjectStatus;
  projectManager: TeamMember;
  teamMembers: TeamMember[];
  logo: string;
  taskCounter: number;
  subtaskCounter: number;
  issueCounter: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface StageProgress {
  stageName: WorkflowStage;
  status: 'completed' | 'current' | 'upcoming';
  completedTasks: number;
  totalTasks: number;
}

export interface Activity {
  id: string;
  type: 'task-completed' | 'file-uploaded' | 'comment-added' | 'task-created' | 'stage-completed';
  userId: string;
  userName: string;
  userAvatar: string;
  message: string;
  timestamp: Date;
  relatedTaskId?: string;
  relatedFileId?: string;
}

export interface IssueComment {
  id: string;
  text: string;
  author: TeamMember;
  createdAt: Date;
}

export interface Issue {
  id: string;
  trackingId: string;
  projectId: string;
  projectCode: string;
  title: string;
  description: string;
  severity: IssueSeverity;
  status: IssueStatus;
  sourceType: IssueSource;
  sourceId: string; // taskId
  sourceTrackingId: string; // task trackingId for display
  subtaskId?: string; // if sourceType is 'subtask'
  subtaskTrackingId?: string; // subtask trackingId for display
  stage: WorkflowStage;
  reportedBy: TeamMember;
  assignedTo?: TeamMember;
  attachments?: AttachedFile[];
  comments?: IssueComment[];
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  resolvedBy?: TeamMember;
  resolutionNote?: string;
}

export interface ProjectStats {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  blockedTasks: number;
  totalFiles: number;
  uploadedFiles: number;
  completionPercentage: number;
}
