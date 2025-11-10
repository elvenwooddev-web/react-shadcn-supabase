/**
 * Form data types for creating/updating entities
 */

import type { WorkflowStage, TaskStatus, TaskPriority, IssueSeverity, IssueSource } from './enums';

export interface CreateProjectForm {
  name: string;
  description: string;
  clientName: string;
  projectType: string;
  projectCode: string;
  startDate: string;
  estimatedCompletion: string;
  projectManagerId: string;
  templateType?: 'residential';
}

export interface CreateTaskForm {
  title: string;
  description?: string;
  dueDate: string;
  assigneeId: string;
  stage: WorkflowStage;
  status?: TaskStatus;
  priority?: TaskPriority;
}

export interface CreateSubtaskForm {
  label: string;
  description?: string;
  assigneeId: string;
  assigneeIds?: string[];
  priority?: TaskPriority;
  status?: TaskStatus;
  dueDate?: string;
}

export interface CreateIssueForm {
  title: string;
  description: string;
  severity: IssueSeverity;
  sourceType: IssueSource;
  sourceId: string;
  sourceTrackingId: string;
  subtaskId?: string;
  subtaskTrackingId?: string;
  assignedToId?: string;
}

export interface CreateTemplateForm {
  name: string;
  description: string;
  projectType: string;
}
