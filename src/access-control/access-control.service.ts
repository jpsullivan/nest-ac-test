import { Injectable } from '@nestjs/common';
import { roles, RoleName } from './roles';
import { AccessContext, AccessDefinition, AccessCheckResult, AccessRule } from './types';

/**
 * Service that evaluates access definitions against a context.
 *
 * This is the core authorization engine. It:
 * 1. Validates required context is present
 * 2. Evaluates each rule in order (OR logic between rules)
 * 3. For each rule, checks if any role grants access (OR logic between roles in a rule)
 * 4. Returns a result indicating if access was granted
 */
@Injectable()
export class AccessControlService {
  /**
   * Check if access should be granted based on the definition and context.
   *
   * @param definition The access definition to evaluate
   * @param context The context containing user, resource, etc.
   * @returns Result indicating if access is allowed
   */
  async checkAccess<TResource>(
    definition: AccessDefinition<TResource>,
    context: AccessContext<TResource>
  ): Promise<AccessCheckResult> {
    // Step 1: Validate required context
    for (const key of definition.requiredContext) {
      if (!(key in context) || context[key as keyof AccessContext] === undefined) {
        return {
          allowed: false,
          reason: `Missing required context: ${key}`,
        };
      }
    }

    // Step 2: Evaluate each rule (OR logic - first matching rule wins)
    for (const rule of definition.rules) {
      const result = await this.evaluateRule(rule, context);
      if (result.allowed) {
        return result;
      }
    }

    // No rule granted access
    return {
      allowed: false,
      reason: 'No matching access rule',
    };
  }

  /**
   * Evaluate a single access rule.
   */
  private async evaluateRule<TResource>(
    rule: AccessRule<TResource>,
    context: AccessContext<TResource>
  ): Promise<AccessCheckResult> {
    // Handle 'everyone' role with condition
    if (rule.roles.includes('everyone')) {
      if (rule.condition) {
        const conditionMet = await rule.condition(context);
        if (conditionMet) {
          return { allowed: true, matchedRole: 'everyone' };
        }
      } else {
        return { allowed: true, matchedRole: 'everyone' };
      }
      return { allowed: false };
    }

    // Check each role (OR logic - first matching role wins)
    for (const roleName of rule.roles) {
      const rolePredicate = roles[roleName as RoleName];
      if (!rolePredicate) {
        console.warn(`Unknown role: ${roleName}`);
        continue;
      }

      const roleGrantsAccess = await rolePredicate(context);
      if (roleGrantsAccess) {
        // If there's an additional condition, check it
        if (rule.condition) {
          const conditionMet = await rule.condition(context);
          if (!conditionMet) continue;
        }
        return { allowed: true, matchedRole: roleName };
      }
    }

    return { allowed: false };
  }

  /**
   * Check if a specific role grants access in the given context.
   * Useful for inline permission checks in business logic.
   *
   * @example
   * if (await accessControl.hasRole('repoAdmin', { user, resource: repo })) {
   *   // Show admin UI
   * }
   */
  async hasRole<TResource>(
    roleName: RoleName,
    context: AccessContext<TResource>
  ): Promise<boolean> {
    const rolePredicate = roles[roleName];
    if (!rolePredicate) return false;
    return rolePredicate(context);
  }
}
