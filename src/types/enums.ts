/**
 * Enum types and type unions for the application
 */

export type WorkflowStage =
  | 'Sales'
  | 'Design'
  | 'Technical Design'
  | 'Procurement'
  | 'Production'
  | 'Execution'
  | 'Post Installation';

export type Department =
  | 'Sales'
  | 'Design'
  | 'Technical'
  | 'Procurement'
  | 'Production'
  | 'Execution'
  | 'Admin';

// Status types - now support custom values via StatusConfig system
export type TaskStatus = string; // e.g., 'todo', 'in-progress', 'completed', 'blocked', or custom
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type FileStatus = string; // e.g., 'received', 'pending', 'missing', or custom
export type ProjectStatus = string; // e.g., 'active', 'on-hold', 'completed', 'archived', or custom
export type DocumentCategory = 'contract' | 'report' | 'specification' | 'checklist';
export type DocumentStatus = string; // e.g., 'uploaded', 'pending', 'approved', 'rejected', or custom
export type StageStatus = string; // e.g., 'pending', 'active', 'completed', 'blocked', or custom

// Issue Types
export type IssueStatus = string; // e.g., 'open', 'in-progress', 'resolved', 'closed', or custom
export type IssueSeverity = 'low' | 'medium' | 'high' | 'critical';
export type IssueSource = 'task' | 'subtask';

// Workflow Rules
export type RuleType = 'stage-transition' | 'auto-assignment' | 'approval' | 'validation';

// Approval System
export type ApprovalEntityType = 'task' | 'document' | 'stage';
export type ApproverType = 'department-head' | 'project-manager' | 'admin' | 'specific-user' | 'client' | 'external';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'expired' | 'delegated';
export type ApprovalSource = 'template' | 'global-rule' | 'project-rule' | 'manual';

// Custom Status System
export type StatusEntityType = 'task' | 'subtask' | 'issue' | 'stage' | 'document' | 'file' | 'project';

export type AutoActionType =
  | 'notify-assignee'
  | 'notify-team'
  | 'update-due-date'
  | 'create-checklist'
  | 'add-comment'
  | 'change-priority';
