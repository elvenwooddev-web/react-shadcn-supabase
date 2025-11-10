/**
 * Centralized localStorage keys for the application
 * This prevents typos and makes it easy to track all storage keys
 */

// ==================== Global Storage Keys ====================
export const STORAGE_KEYS = {
  // User & Auth
  CURRENT_USER: 'currentUser',

  // Projects
  PROJECTS: 'projects',
  CURRENT_PROJECT: 'currentProject',

  // Templates
  PROJECT_TEMPLATES: 'projectTemplates',

  // Configuration
  STATUS_CONFIGURATIONS: 'statusConfigurations',
  WORKFLOW_RULES: 'workflowRules',
  APPROVAL_RULES: 'approvalRules',

  // Theme
  THEME: 'theme',
} as const;

// ==================== Project-Scoped Storage Keys ====================
// These keys are used with project ID as part of the key
export const PROJECT_STORAGE_KEYS = {
  // Tasks
  TASKS: 'tasks', // Stores: Record<projectId, Task[]>

  // Files
  FILES: 'files', // Stores: Record<projectId, RequiredFile[]>

  // Documents
  DOCUMENTS: 'documents', // Stores: Record<projectId, StageDocument[]>

  // Activities
  ACTIVITIES: 'activities', // Stores: Record<projectId, Activity[]>

  // Stages
  STAGES: 'stages', // Stores: Record<projectId, ProjectStage[]>

  // Issues
  ISSUES: 'issues', // Stores: Record<projectId, Issue[]>

  // Project-specific rules
  PROJECT_WORKFLOW_RULES: 'projectWorkflowRules', // Stores: Record<projectId, WorkflowRule[]>
  PROJECT_APPROVAL_RULES: 'projectApprovalRules', // Stores: Record<projectId, ApprovalRule[]>
} as const;

// ==================== Dynamic Storage Key Generators ====================

/**
 * Generate approval requests storage key for a specific project
 */
export function getApprovalRequestsKey(projectId: string): string {
  return `approvalRequests-${projectId}`;
}

/**
 * Generate team members storage key for a specific project
 */
export function getTeamMembersKey(projectId: string): string {
  return `teamMembers-${projectId}`;
}

/**
 * Generate a scoped storage key (used for project-scoped data)
 */
export function getScopedStorageKey(baseKey: string, scopeId: string): string {
  return `${baseKey}-${scopeId}`;
}

// ==================== Type-safe Storage Key Type ====================
export type GlobalStorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];
export type ProjectStorageKey = typeof PROJECT_STORAGE_KEYS[keyof typeof PROJECT_STORAGE_KEYS];
export type StorageKey = GlobalStorageKey | ProjectStorageKey;
