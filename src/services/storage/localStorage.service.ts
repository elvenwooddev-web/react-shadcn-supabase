/**
 * localStorage Service
 * Centralized service for all localStorage operations with error handling and type safety
 */

import { STORAGE_KEYS, PROJECT_STORAGE_KEYS } from '@/constants';

/**
 * Generic localStorage service with type safety
 */
export class LocalStorageService {
  /**
   * Get an item from localStorage
   */
  static get<T>(key: string, defaultValue: T): T {
    if (typeof window === 'undefined') {
      return defaultValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return defaultValue;
    }
  }

  /**
   * Set an item in localStorage
   */
  static set<T>(key: string, value: T): boolean {
    if (typeof window === 'undefined') {
      return false;
    }

    try {
      window.localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
      return false;
    }
  }

  /**
   * Remove an item from localStorage
   */
  static remove(key: string): boolean {
    if (typeof window === 'undefined') {
      return false;
    }

    try {
      window.localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
      return false;
    }
  }

  /**
   * Clear all localStorage
   */
  static clear(): boolean {
    if (typeof window === 'undefined') {
      return false;
    }

    try {
      window.localStorage.clear();
      return true;
    } catch (error) {
      console.error('Error clearing localStorage:', error);
      return false;
    }
  }

  /**
   * Check if a key exists in localStorage
   */
  static has(key: string): boolean {
    if (typeof window === 'undefined') {
      return false;
    }

    return window.localStorage.getItem(key) !== null;
  }

  /**
   * Get all keys in localStorage
   */
  static keys(): string[] {
    if (typeof window === 'undefined') {
      return [];
    }

    return Object.keys(window.localStorage);
  }

  /**
   * Get the size of localStorage in bytes (approximate)
   */
  static size(): number {
    if (typeof window === 'undefined') {
      return 0;
    }

    let total = 0;
    for (const key in window.localStorage) {
      if (window.localStorage.hasOwnProperty(key)) {
        total += key.length + (window.localStorage.getItem(key)?.length || 0);
      }
    }
    return total;
  }
}

/**
 * Project-scoped storage service
 * Handles data that is scoped to specific projects
 */
export class ProjectStorageService {
  /**
   * Get project-scoped data
   */
  static get<T>(baseKey: string, projectId: string, defaultValue: T[] = []): T[] {
    const allData = LocalStorageService.get<Record<string, T[]>>(baseKey, {});
    return allData[projectId] || defaultValue;
  }

  /**
   * Set project-scoped data
   */
  static set<T>(baseKey: string, projectId: string, data: T[]): boolean {
    const allData = LocalStorageService.get<Record<string, T[]>>(baseKey, {});
    allData[projectId] = data;
    return LocalStorageService.set(baseKey, allData);
  }

  /**
   * Update project-scoped data
   */
  static update<T>(
    baseKey: string,
    projectId: string,
    updater: (data: T[]) => T[]
  ): boolean {
    const currentData = this.get<T>(baseKey, projectId);
    const newData = updater(currentData);
    return this.set(baseKey, projectId, newData);
  }

  /**
   * Delete all data for a specific project
   */
  static deleteProject(projectId: string): boolean {
    let success = true;

    // Delete from all project-scoped keys
    Object.values(PROJECT_STORAGE_KEYS).forEach(key => {
      const allData = LocalStorageService.get<Record<string, any>>(key, {});
      if (allData[projectId]) {
        delete allData[projectId];
        success = LocalStorageService.set(key, allData) && success;
      }
    });

    return success;
  }

  /**
   * Get all project IDs that have data
   */
  static getAllProjectIds(): string[] {
    const projectsData = LocalStorageService.get<any[]>(STORAGE_KEYS.PROJECTS, []);
    return projectsData.map((p: any) => p.id);
  }
}

/**
 * Migration service for handling schema changes
 */
export class MigrationService {
  private static MIGRATION_VERSION_KEY = 'migration_version';
  private static CURRENT_VERSION = 1;

  /**
   * Run all pending migrations
   */
  static runMigrations(): void {
    const currentVersion = LocalStorageService.get<number>(
      this.MIGRATION_VERSION_KEY,
      0
    );

    if (currentVersion < this.CURRENT_VERSION) {
      console.log(`Running migrations from v${currentVersion} to v${this.CURRENT_VERSION}`);

      // Run migrations sequentially
      for (let version = currentVersion + 1; version <= this.CURRENT_VERSION; version++) {
        this.runMigration(version);
      }

      // Update migration version
      LocalStorageService.set(this.MIGRATION_VERSION_KEY, this.CURRENT_VERSION);
      console.log('Migrations completed successfully');
    }
  }

  /**
   * Run a specific migration
   */
  private static runMigration(version: number): void {
    console.log(`Running migration v${version}`);

    switch (version) {
      case 1:
        this.migration_v1();
        break;
      // Add more migrations as needed
      default:
        console.warn(`No migration defined for version ${version}`);
    }
  }

  /**
   * Migration v1: Example migration
   */
  private static migration_v1(): void {
    // Example: Migrate old status format to new format
    console.log('Migration v1: No changes needed for initial version');
  }

  /**
   * Backup all data before migration
   */
  static backup(): string {
    const backup: Record<string, any> = {};
    const keys = LocalStorageService.keys();

    keys.forEach(key => {
      const value = window.localStorage.getItem(key);
      if (value) {
        try {
          backup[key] = JSON.parse(value);
        } catch {
          backup[key] = value;
        }
      }
    });

    return JSON.stringify(backup);
  }

  /**
   * Restore data from backup
   */
  static restore(backupString: string): boolean {
    try {
      const backup = JSON.parse(backupString);

      Object.entries(backup).forEach(([key, value]) => {
        LocalStorageService.set(key, value);
      });

      return true;
    } catch (error) {
      console.error('Error restoring backup:', error);
      return false;
    }
  }
}

/**
 * Export convenience functions
 */
export const storage = {
  get: LocalStorageService.get,
  set: LocalStorageService.set,
  remove: LocalStorageService.remove,
  clear: LocalStorageService.clear,
  has: LocalStorageService.has,
  keys: LocalStorageService.keys,
  size: LocalStorageService.size,
};

export const projectStorage = {
  get: ProjectStorageService.get,
  set: ProjectStorageService.set,
  update: ProjectStorageService.update,
  deleteProject: ProjectStorageService.deleteProject,
  getAllProjectIds: ProjectStorageService.getAllProjectIds,
};

export const migrations = {
  run: MigrationService.runMigrations,
  backup: MigrationService.backup,
  restore: MigrationService.restore,
};
