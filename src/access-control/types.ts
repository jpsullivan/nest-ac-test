/**
 * Core types for the access control system.
 *
 * This implements a GitHub-style declarative access control pattern where:
 * - Roles are predicate functions that evaluate context
 * - Access definitions compose roles with optional conditions
 * - Context carries the user, resource, and additional parameters
 */

import { User } from '../entities/user.entity';

/**
 * Context passed to role predicates and access conditions.
 * Contains all information needed to make an authorization decision.
 */
export interface AccessContext<TResource = unknown> {
  user: User | null;
  resource?: TResource;
  params?: Record<string, unknown>;
}

/**
 * A role predicate function that determines if access should be granted.
 * Returns true if the role grants access, false otherwise.
 */
export type RolePredicate<TResource = unknown> = (
  context: AccessContext<TResource>
) => boolean | Promise<boolean>;

/**
 * A single access rule within an access definition.
 * Access is granted if any role in the list passes AND the condition (if any) passes.
 */
export interface AccessRule<TResource = unknown> {
  roles: string[];
  condition?: (context: AccessContext<TResource>) => boolean | Promise<boolean>;
}

/**
 * A complete access definition for an action.
 * Contains required context keys and a list of rules (OR logic between rules).
 */
export interface AccessDefinition<TResource = unknown> {
  requiredContext: string[];
  rules: AccessRule<TResource>[];
}

/**
 * Result of an access check.
 */
export interface AccessCheckResult {
  allowed: boolean;
  reason?: string;
  matchedRole?: string;
}
