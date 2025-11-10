import type { WorkflowStage, Department } from '@/types';

/**
 * All workflow stages in sequential order
 */
export const WORKFLOW_STAGES: readonly WorkflowStage[] = [
  'Sales',
  'Design',
  'Technical Design',
  'Procurement',
  'Production',
  'Execution',
  'Post Installation',
] as const;

/**
 * Map departments to workflow stages they can access
 */
export const DEPARTMENT_STAGES: Record<Department, WorkflowStage[]> = {
  Sales: ['Sales'],
  Design: ['Design'],
  Technical: ['Technical Design'],
  Procurement: ['Procurement'],
  Production: ['Production'],
  Execution: ['Execution', 'Post Installation'],
  Admin: ['Sales', 'Design', 'Technical Design', 'Procurement', 'Production', 'Execution', 'Post Installation'],
};

/**
 * Map stages to their owning departments
 */
export const STAGE_TO_DEPARTMENT: Record<WorkflowStage, Department> = {
  'Sales': 'Sales',
  'Design': 'Design',
  'Technical Design': 'Technical',
  'Procurement': 'Procurement',
  'Production': 'Production',
  'Execution': 'Execution',
  'Post Installation': 'Execution',
};

/**
 * Get the next stage in the workflow sequence
 */
export function getNextStage(currentStage: WorkflowStage): WorkflowStage | null {
  const currentIndex = WORKFLOW_STAGES.indexOf(currentStage);
  if (currentIndex === -1 || currentIndex === WORKFLOW_STAGES.length - 1) {
    return null;
  }
  return WORKFLOW_STAGES[currentIndex + 1];
}

/**
 * Get the previous stage in the workflow sequence
 */
export function getPreviousStage(currentStage: WorkflowStage): WorkflowStage | null {
  const currentIndex = WORKFLOW_STAGES.indexOf(currentStage);
  if (currentIndex <= 0) {
    return null;
  }
  return WORKFLOW_STAGES[currentIndex - 1];
}

/**
 * Check if a department can access a specific stage
 */
export function canDepartmentAccessStage(department: Department, stage: WorkflowStage): boolean {
  return DEPARTMENT_STAGES[department]?.includes(stage) || false;
}

/**
 * Get all stages accessible by a department
 */
export function getDepartmentStages(department: Department): WorkflowStage[] {
  return DEPARTMENT_STAGES[department] || [];
}

/**
 * Get the department responsible for a stage
 */
export function getStageDepartment(stage: WorkflowStage): Department {
  return STAGE_TO_DEPARTMENT[stage];
}
