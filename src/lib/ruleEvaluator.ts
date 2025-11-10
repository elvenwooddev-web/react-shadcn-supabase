import type { ApprovalRule, Task, StageDocument, WorkflowStage, TaskPriority, DocumentCategory, ApprovalMatchingCriteria } from '@/types'

/**
 * Rule Evaluator Utility
 *
 * Provides intelligent matching logic to determine which approval rules
 * apply to specific tasks, documents, or stages.
 */

interface Entity {
  id?: string
  title?: string
  stage: WorkflowStage
  priority?: TaskPriority
  category?: DocumentCategory
  tags?: string[]
}

/**
 * Check if an entity matches a rule's criteria
 */
export function matchesRule(entity: Entity, rule: ApprovalRule): boolean {
  const criteria = rule.matchingCriteria

  // Check stage match
  if (criteria.stages && criteria.stages.length > 0) {
    if (!criteria.stages.includes(entity.stage)) {
      return false
    }
  }

  // Check priority match (for tasks)
  if (criteria.priority && criteria.priority.length > 0) {
    if (!entity.priority || !criteria.priority.includes(entity.priority)) {
      return false
    }
  }

  // Check document category match
  if (criteria.documentCategory && criteria.documentCategory.length > 0) {
    if (!entity.category || !criteria.documentCategory.includes(entity.category)) {
      return false
    }
  }

  // Check title pattern (regex)
  if (criteria.titlePattern && entity.title) {
    try {
      const regex = new RegExp(criteria.titlePattern, 'i') // Case-insensitive
      if (!regex.test(entity.title)) {
        return false
      }
    } catch (e) {
      // Invalid regex, skip this criteria
      console.warn('Invalid regex pattern in approval rule:', criteria.titlePattern)
    }
  }

  // Check tags (future feature)
  if (criteria.tags && criteria.tags.length > 0 && entity.tags) {
    const hasMatchingTag = criteria.tags.some((tag) => entity.tags!.includes(tag))
    if (!hasMatchingTag) {
      return false
    }
  }

  // If all criteria pass (or no criteria specified), it's a match
  return true
}

/**
 * Get all rules that match an entity
 */
export function getMatchingRules(
  entity: Entity,
  allRules: ApprovalRule[],
  entityType: 'task' | 'document' | 'stage'
): ApprovalRule[] {
  return allRules.filter((rule) => {
    // Must be enabled
    if (!rule.enabled) return false

    // Must match entity type
    if (rule.entityType !== entityType) return false

    // Must match criteria
    return matchesRule(entity, rule)
  })
}

/**
 * Preview: Count how many existing items a rule would match
 * Useful for showing "This rule will match 15 tasks" in UI
 */
export function countRuleMatches(
  rule: ApprovalRule,
  entities: Entity[]
): number {
  return entities.filter((entity) => matchesRule(entity, rule)).length
}

/**
 * Validate matching criteria (for form validation)
 */
export function validateCriteria(criteria: ApprovalMatchingCriteria): string | null {
  // At least one criterion should be specified
  const hasCriteria =
    (criteria.stages && criteria.stages.length > 0) ||
    (criteria.priority && criteria.priority.length > 0) ||
    (criteria.documentCategory && criteria.documentCategory.length > 0) ||
    !!criteria.titlePattern ||
    (criteria.tags && criteria.tags.length > 0)

  if (!hasCriteria) {
    return 'At least one matching criterion must be specified'
  }

  // Validate regex pattern if provided
  if (criteria.titlePattern) {
    try {
      new RegExp(criteria.titlePattern)
    } catch (e) {
      return 'Invalid regex pattern. Please use valid regex syntax.'
    }
  }

  return null
}

/**
 * Get human-readable description of matching criteria
 * For display in UI: "Design stage + High priority tasks"
 */
export function getCriteriaDescription(criteria: ApprovalMatchingCriteria): string {
  const parts: string[] = []

  if (criteria.stages && criteria.stages.length > 0) {
    parts.push(criteria.stages.join(', ') + ' stage' + (criteria.stages.length > 1 ? 's' : ''))
  }

  if (criteria.priority && criteria.priority.length > 0) {
    parts.push(criteria.priority.join(', ') + ' priority')
  }

  if (criteria.documentCategory && criteria.documentCategory.length > 0) {
    parts.push(criteria.documentCategory.join(', ') + ' documents')
  }

  if (criteria.titlePattern) {
    parts.push(`title matches "${criteria.titlePattern}"`)
  }

  if (criteria.tags && criteria.tags.length > 0) {
    parts.push(`tagged: ${criteria.tags.join(', ')}`)
  }

  return parts.length > 0 ? parts.join(' + ') : 'All items'
}
