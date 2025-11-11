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

export interface TimeEntry {
  id: string;
  userId: string;
  userName: string;
  taskId: string;
  date: string;
  hours: number;
  minutes: number;
  description?: string;
  createdAt: Date;
}

export interface TaskComment {
  id: string;
  taskId: string;
  author: TeamMember;
  content: string;
  mentions: string[]; // Array of user IDs mentioned
  createdAt: Date;
  updatedAt: Date;
  edited: boolean;
}

export interface CustomFieldDefinition {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'select' | 'multiselect' | 'checkbox';
  options?: string[]; // For select/multiselect types
  required: boolean;
  projectId?: string; // If null, it's global
}

export interface CustomFieldValue {
  fieldId: string;
  value: string | number | boolean | string[];
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
  // Time tracking
  estimatedHours?: number;
  actualHours?: number;
  timeEntries?: TimeEntry[];
  // Dependencies
  blockedBy?: string[]; // Array of task/subtask IDs
  blocking?: string[]; // Array of task/subtask IDs
  // Custom fields
  customFields?: CustomFieldValue[];
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
  // Time tracking
  estimatedHours?: number;
  actualHours?: number;
  timeEntries?: TimeEntry[];
  // Dependencies
  blockedBy?: string[]; // Array of task IDs this task is blocked by
  blocking?: string[]; // Array of task IDs this task is blocking
  // Custom fields
  customFields?: CustomFieldValue[];
  // Comments & collaboration
  comments?: TaskComment[];
  watchers?: string[]; // Array of user IDs watching this task
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
  // Budget & tracking
  budget?: number;
  actualCost?: number;
  currency?: string;
  // Custom fields
  customFields?: CustomFieldValue[];
  // Tags for categorization
  tags?: string[];
  // Milestones
  milestones?: ProjectMilestone[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectMilestone {
  id: string;
  name: string;
  description?: string;
  dueDate: string;
  completedDate?: string;
  status: 'pending' | 'completed' | 'overdue';
  linkedTaskIds?: string[];
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

// Saved Views & Filtering
export interface FilterCriteria {
  assignees?: string[]; // User IDs
  statuses?: string[];
  priorities?: TaskPriority[];
  stages?: WorkflowStage[];
  dateRange?: {
    start: string;
    end: string;
  };
  customFields?: {
    fieldId: string;
    value: string | number | boolean | string[];
  }[];
  searchQuery?: string;
  tags?: string[];
}

export interface GroupingConfig {
  groupBy: 'assignee' | 'status' | 'priority' | 'stage' | 'dueDate' | 'none';
  sortBy: 'dueDate' | 'priority' | 'createdAt' | 'title' | 'status';
  sortOrder: 'asc' | 'desc';
}

export interface SavedView {
  id: string;
  name: string;
  description?: string;
  viewType: 'list' | 'board' | 'timeline' | 'calendar' | 'table';
  filters: FilterCriteria;
  grouping: GroupingConfig;
  projectId?: string; // If null, it's a global view
  isDefault: boolean;
  isShared: boolean;
  createdBy: string; // User ID
  createdAt: Date;
  updatedAt: Date;
}

// Notifications
export interface Notification {
  id: string;
  userId: string;
  type: 'task-assigned' | 'task-completed' | 'comment-added' | 'mention' | 'approval-pending' | 'deadline-approaching' | 'task-blocked';
  title: string;
  message: string;
  relatedEntityType: 'task' | 'project' | 'approval' | 'comment';
  relatedEntityId: string;
  projectId?: string;
  read: boolean;
  createdAt: Date;
}

// Calendar Events
export interface CalendarEvent {
  id: string;
  title: string;
  type: 'task' | 'milestone' | 'meeting' | 'deadline';
  taskId?: string;
  projectId?: string;
  start: Date;
  end: Date;
  allDay: boolean;
  color?: string;
  description?: string;
}
