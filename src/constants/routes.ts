/**
 * Application route constants
 * Centralized route definitions to prevent typos and make navigation easier
 */

export const ROUTES = {
  // Home & Projects
  HOME: '/',
  PROJECTS_NEW: '/projects/new',

  // Templates
  TEMPLATES: '/templates',
  TEMPLATE_EDIT: (id: string) => `/templates/${id}/edit`,

  // Global Settings
  SETTINGS: '/settings',

  // Issues
  ISSUES: '/issues',

  // Approvals
  APPROVALS: '/approvals',
  APPROVALS_SETTINGS: '/approvals/settings',

  // Project Routes (require projectId)
  PROJECT: {
    BASE: (projectId: string) => `/projects/${projectId}`,
    OVERVIEW: (projectId: string) => `/projects/${projectId}/overview`,
    WORKFLOW: (projectId: string) => `/projects/${projectId}/workflow`,
    FILES: (projectId: string) => `/projects/${projectId}/files`,
    CHAT: (projectId: string) => `/projects/${projectId}/chat`,
    SETTINGS: (projectId: string) => `/projects/${projectId}/settings`,
    APPROVALS_SETTINGS: (projectId: string) => `/projects/${projectId}/approvals/settings`,
  },
} as const;

/**
 * Get the workflow page route for a project
 */
export function getProjectWorkflowRoute(projectId: string): string {
  return ROUTES.PROJECT.WORKFLOW(projectId);
}

/**
 * Get the project overview route
 */
export function getProjectOverviewRoute(projectId: string): string {
  return ROUTES.PROJECT.OVERVIEW(projectId);
}

/**
 * Get the template edit route
 */
export function getTemplateEditRoute(templateId: string): string {
  return ROUTES.TEMPLATE_EDIT(templateId);
}

/**
 * Check if a path is a project route
 */
export function isProjectRoute(path: string): boolean {
  return path.startsWith('/projects/') && path.split('/').length > 2;
}

/**
 * Extract project ID from a project route
 */
export function getProjectIdFromRoute(path: string): string | null {
  const match = path.match(/^\/projects\/([^\/]+)/);
  return match ? match[1] : null;
}
