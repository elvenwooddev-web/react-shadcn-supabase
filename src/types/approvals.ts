/**
 * Approval system types
 */

import type {
  ApprovalEntityType,
  ApproverType,
  ApprovalStatus,
  ApprovalSource,
  WorkflowStage,
  Department,
  TaskPriority,
  DocumentCategory,
} from './enums';
import type { TeamMember, Task, StageDocument } from './entities';

export interface ApprovalConfig {
  id: string;
  type: ApprovalEntityType;
  name: string;
  description?: string;
  approverType: ApproverType;
  approverRole?: Department | 'project-manager' | 'admin' | 'client';
  approverUserId?: string; // For specific-user type
  required: boolean; // Blocks progression if not approved
  allowDelegation: boolean;
  requireComment: boolean;
  notifyApprover: boolean;
  autoReminder: boolean;
  reminderDays?: number; // Send reminder after X days
  expiryDays?: number; // Auto-expire after X days
  order: number; // For sequential approvals (0 = first, 1 = second, etc.)
}

export interface TemplateApproval {
  id: string;
  entityType: ApprovalEntityType;
  entityIdentifier: string; // Task title, document title, or stage name from template
  stage: WorkflowStage;
  approvalConfigs: ApprovalConfig[]; // Support multi-level sequential approvals
  createdAt: Date;
  updatedAt: Date;
}

export interface ApprovalMatchingCriteria {
  stages?: WorkflowStage[]; // Match items in these stages
  priority?: TaskPriority[]; // Match items with these priorities
  documentCategory?: DocumentCategory[]; // Match documents with these categories
  titlePattern?: string; // Regex pattern to match title
  tags?: string[]; // Future: match by tags
}

export interface ApprovalRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  scope: 'global' | 'project';
  projectId?: string; // Required if scope is 'project'
  entityType: ApprovalEntityType;
  matchingCriteria: ApprovalMatchingCriteria;
  approvalConfigs: ApprovalConfig[]; // Support multi-level sequential approvals
  autoApply: boolean; // Auto-create approval requests for matching items
  createdAt: Date;
  updatedAt: Date;
}

export interface ApprovalComment {
  id: string;
  author: TeamMember;
  text: string;
  createdAt: Date;
}

export interface ApprovalHistoryEntry {
  id: string;
  action: 'requested' | 'approved' | 'rejected' | 'delegated' | 'reminded' | 'expired' | 'commented';
  actor: TeamMember;
  timestamp: Date;
  note?: string;
}

export interface ApprovalRequest {
  id: string;
  projectId: string;
  source: ApprovalSource; // Where this approval came from
  templateApprovalId?: string; // Link back to template config (if source='template')
  ruleId?: string; // Link back to approval rule (if source='global-rule' or 'project-rule')
  entityType: ApprovalEntityType;
  entityId: string; // Actual task/document/stage ID in project
  entityName: string; // Display name
  stage: WorkflowStage;
  status: ApprovalStatus;
  currentApprovalLevel: number; // Which approver in the chain (0-indexed)
  approvalConfigs: ApprovalConfig[]; // Copy from template/rule for this request
  requestedBy: TeamMember;
  requestedAt: Date;
  assignedTo: TeamMember; // Current approver
  approvedBy?: TeamMember;
  approvedAt?: Date;
  rejectedBy?: TeamMember;
  rejectedAt?: Date;
  rejectionReason?: string;
  comments: ApprovalComment[];
  remindersSent: number;
  expiresAt?: Date;
  delegatedTo?: TeamMember;
  delegatedAt?: Date;
  history: ApprovalHistoryEntry[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ApprovalContextType {
  approvalRequests: ApprovalRequest[];
  createApprovalRequest: (request: Omit<ApprovalRequest, 'id' | 'createdAt' | 'updatedAt' | 'history' | 'comments' | 'remindersSent'>) => void;
  updateApprovalRequest: (id: string, data: Partial<ApprovalRequest>) => void;
  approveRequest: (id: string, comment?: string) => void;
  rejectRequest: (id: string, reason: string, comment?: string) => void;
  delegateRequest: (id: string, toUserId: string) => void;
  addComment: (requestId: string, text: string) => void;
  getPendingApprovals: () => ApprovalRequest[];
  getApprovalsByStage: (stage: WorkflowStage) => ApprovalRequest[];
  getApprovalsByEntity: (entityType: ApprovalEntityType, entityId: string) => ApprovalRequest[];
  getMyApprovals: (userId: string) => ApprovalRequest[];
  canApprove: (requestId: string, userId: string) => boolean;
  hasEntityApproval: (entityType: ApprovalEntityType, entityId: string) => boolean;
  getApprovalStatus: (entityType: ApprovalEntityType, entityId: string) => ApprovalStatus | null;
}

export interface ApprovalRuleContextType {
  approvalRules: ApprovalRule[];
  createRule: (rule: Omit<ApprovalRule, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateRule: (id: string, data: Partial<ApprovalRule>) => void;
  deleteRule: (id: string) => void;
  toggleRule: (id: string) => void;
  getGlobalRules: () => ApprovalRule[];
  getProjectRules: (projectId: string) => ApprovalRule[];
  getActiveRules: (scope?: 'global' | 'project', projectId?: string) => ApprovalRule[];
  getRulesByEntityType: (entityType: ApprovalEntityType) => ApprovalRule[];
  getMatchingRules: (entity: Task | StageDocument | { stage: WorkflowStage; title?: string }) => ApprovalRule[];
  applyRulesToEntity: (entity: any, projectId: string) => void;
  syncRulesToProject: (projectId: string) => number; // Returns count of approvals created
}
