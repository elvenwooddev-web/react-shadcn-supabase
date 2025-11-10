/**
 * Custom status configuration system types
 */

import type { StatusEntityType, AutoActionType } from './enums';

export interface AutoAction {
  id: string;
  type: AutoActionType;
  config: Record<string, any>; // Flexible config for different action types
  enabled: boolean;
}

export interface StatusTransition {
  fromStatus: string; // 'any' or specific status value
  toStatus: string;
  requiresConfirmation: boolean;
  confirmationMessage?: string;
}

export interface StatusConfig {
  id: string;
  entityType: StatusEntityType;
  value: string; // Machine-readable key (e.g., 'in-progress')
  label: string; // Display label (e.g., 'In Progress')
  color: string; // Hex color code (e.g., '#3B82F6')
  icon?: string; // Lucide icon name (e.g., 'Circle', 'CheckCircle')
  order: number; // Display order in dropdowns/lists
  isDefault: boolean; // One default status per entity type
  isActive: boolean; // Can be disabled without deleting
  allowedTransitions?: string[]; // Values this status can transition FROM
  autoActions?: AutoAction[]; // Actions to execute on status change
  createdAt: Date;
  updatedAt: Date;
}

export interface StatusConfigContextType {
  statusConfigs: StatusConfig[];
  getStatusConfigs: (entityType: StatusEntityType) => StatusConfig[];
  getStatusConfig: (entityType: StatusEntityType, value: string) => StatusConfig | undefined;
  getActiveStatuses: (entityType: StatusEntityType) => StatusConfig[];
  getDefaultStatus: (entityType: StatusEntityType) => StatusConfig | undefined;
  createStatus: (config: Omit<StatusConfig, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateStatus: (id: string, data: Partial<StatusConfig>) => void;
  deleteStatus: (id: string) => void;
  reorderStatuses: (entityType: StatusEntityType, statusIds: string[]) => void;
  canTransition: (entityType: StatusEntityType, fromStatus: string, toStatus: string) => boolean;
  getAllowedTransitions: (entityType: StatusEntityType, fromStatus: string) => StatusConfig[];
  resetToDefaults: (entityType: StatusEntityType) => void;
  getStatusUsageCount: (statusId: string) => number;
}
