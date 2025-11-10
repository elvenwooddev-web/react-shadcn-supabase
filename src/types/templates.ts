/**
 * Template system types
 */

import type {
  WorkflowStage,
  TaskStatus,
  TaskPriority,
  FileStatus,
  DocumentCategory,
  DocumentStatus,
  StageStatus,
} from './enums';
import type { TeamMember, ChecklistItem, Subtask, AttachedFile } from './entities';
import type { TemplateApproval } from './approvals';

export interface TemplateStage {
  stage: WorkflowStage;
  status: StageStatus;
  priority: TaskPriority;
  startDate: string | null;
  dueDate: string | null;
  departmentHeadRole: string; // Role to match when creating project (e.g., "Sales Manager", "Designer")
  notes?: string;
}

export interface TemplateTask {
  title: string;
  description?: string;
  dueDate?: string;
  status: TaskStatus;
  priority: TaskPriority;
  stage: WorkflowStage;
  checklistItems?: Omit<ChecklistItem, 'id'>[];
  subtasks?: Omit<Subtask, 'id' | 'assigneeId' | 'avatar' | 'createdAt' | 'updatedAt'>[];
  attachments?: Omit<AttachedFile, 'id' | 'uploadedAt' | 'uploadedBy'>[];
}

export interface TemplateFile {
  fileName: string;
  requiredFrom: WorkflowStage;
  status: FileStatus;
  description?: string;
}

export interface TemplateDocument {
  title: string;
  category: DocumentCategory;
  stage: WorkflowStage;
  status: DocumentStatus;
  description?: string;
  requiredForProgression?: boolean;
  linkedTaskId?: string;
}

export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  projectType: string;
  isBuiltIn: boolean;
  createdAt: Date;
  updatedAt: Date;
  tasks: TemplateTask[];
  requiredFiles: TemplateFile[];
  stageDocuments: TemplateDocument[];
  stages?: TemplateStage[];
  approvals?: TemplateApproval[]; // Approval configurations
  thumbnail?: string;
  tags?: string[];
  usageCount?: number;
}

export interface TemplateContextType {
  templates: ProjectTemplate[];
  createTemplate: (data: { name: string; description: string; projectType: string }) => string;
  updateTemplate: (id: string, data: Partial<ProjectTemplate>) => void;
  deleteTemplate: (id: string) => void;
  duplicateTemplate: (id: string, newName: string) => void;
  getTemplate: (id: string) => ProjectTemplate | undefined;
  addTaskToTemplate: (templateId: string, task: TemplateTask) => void;
  updateTemplateTask: (templateId: string, taskIndex: number, data: Partial<TemplateTask>) => void;
  deleteTemplateTask: (templateId: string, taskIndex: number) => void;
  addFileToTemplate: (templateId: string, file: TemplateFile) => void;
  deleteTemplateFile: (templateId: string, fileIndex: number) => void;
  addDocumentToTemplate: (templateId: string, doc: TemplateDocument) => void;
  deleteTemplateDocument: (templateId: string, docIndex: number) => void;
  updateTemplateStage: (templateId: string, stageIndex: number, data: Partial<TemplateStage>) => void;
}
