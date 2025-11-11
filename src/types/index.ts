/**
 * Type definitions for InteriorsFlow Application
 *
 * This file re-exports all types from domain-specific files
 * for backward compatibility and easy importing
 */

// Enums and type unions
export type {
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
  RuleType,
  ApprovalEntityType,
  ApproverType,
  ApprovalStatus,
  ApprovalSource,
  StatusEntityType,
  AutoActionType,
} from './enums';

// Entity types
export type {
  User,
  TeamMember,
  AttachedFile,
  ChecklistItem,
  Subtask,
  Task,
  RequiredFile,
  StageDocument,
  ProjectStage,
  Project,
  StageProgress,
  Activity,
  IssueComment,
  Issue,
  ProjectStats,
  TimeEntry,
  TaskComment,
  CustomFieldDefinition,
  CustomFieldValue,
  ProjectMilestone,
  FilterCriteria,
  GroupingConfig,
  SavedView,
  Notification,
  CalendarEvent,
} from './entities';

// Custom status system
export type {
  AutoAction,
  StatusTransition,
  StatusConfig,
  StatusConfigContextType,
} from './statuses';

// Approval system
export type {
  ApprovalConfig,
  TemplateApproval,
  ApprovalMatchingCriteria,
  ApprovalRule,
  ApprovalComment,
  ApprovalHistoryEntry,
  ApprovalRequest,
  ApprovalContextType,
  ApprovalRuleContextType,
} from './approvals';

// Workflow rules
export type {
  WorkflowRule,
  StageTransitionRule,
  AutoAssignmentRule,
  ApprovalRule as WorkflowApprovalRule,
  ValidationRule,
  AnyWorkflowRule,
  WorkflowRulesContextType,
} from './workflows';

// Templates
export type {
  TemplateStage,
  TemplateTask,
  TemplateFile,
  TemplateDocument,
  ProjectTemplate,
  TemplateContextType,
} from './templates';

// Forms
export type {
  CreateProjectForm,
  CreateTaskForm,
  CreateSubtaskForm,
  CreateIssueForm,
  CreateTemplateForm,
} from './forms';

// Contexts
export type {
  ProjectContextType,
  TaskContextType,
  FileContextType,
  TeamContextType,
  UserContextType,
  StageContextType,
  IssueContextType,
  DocumentContext,
} from './contexts';

// Re-export DEPARTMENT_STAGES and STAGE_TO_DEPARTMENT from constants for backward compatibility
// These were moved to constants/workflows.ts
export { DEPARTMENT_STAGES, STAGE_TO_DEPARTMENT } from '@/constants/workflows';
