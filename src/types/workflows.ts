/**
 * Workflow rules system types
 */

import type { WorkflowStage, Department, RuleType } from './enums';

export interface WorkflowRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  ruleType: RuleType;
  scope: 'global' | 'project';
  projectId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface StageTransitionRule extends WorkflowRule {
  ruleType: 'stage-transition';
  applicableStages: WorkflowStage[];
  conditions: {
    requireAllTasksComplete: boolean;
    requireAllFilesUploaded: boolean;
    requireAllDocsApproved: boolean;
    minimumChecklistCompletion: number;
    requireDepartmentHeadApproval: boolean;
    blockStageSkipping: boolean;
  };
  actions: {
    autoActivateNextStage: boolean;
    notifyNextDepartment: boolean;
  };
}

export interface AutoAssignmentRule extends WorkflowRule {
  ruleType: 'auto-assignment';
  applicableStages: WorkflowStage[];
  assignmentStrategy: 'department-head' | 'round-robin' | 'specific-role';
  targetRole?: string;
}

export interface ApprovalRule extends WorkflowRule {
  ruleType: 'approval';
  applicableStages: WorkflowStage[];
  approverRole: Department | 'project-manager' | 'admin';
  required: boolean;
}

export interface ValidationRule extends WorkflowRule {
  ruleType: 'validation';
  applicableStages: WorkflowStage[];
  requiredTasksCount: number;
  requiredFilesCount: number;
  requiredDocumentsCount: number;
}

export type AnyWorkflowRule = StageTransitionRule | AutoAssignmentRule | ApprovalRule | ValidationRule;

export interface WorkflowRulesContextType {
  rules: AnyWorkflowRule[];
  globalRules: AnyWorkflowRule[];
  projectRules: AnyWorkflowRule[];

  createRule: (rule: Omit<AnyWorkflowRule, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateRule: (id: string, data: Partial<AnyWorkflowRule>) => void;
  deleteRule: (id: string) => void;
  toggleRuleEnabled: (id: string) => void;

  canCompleteStage: (stage: WorkflowStage) => { allowed: boolean; reasons: string[] };
  getMissingRequirements: (stage: WorkflowStage) => string[];
  getActiveRulesForStage: (stage: WorkflowStage) => AnyWorkflowRule[];
}
