/**
 * DSL for defining access rules.
 *
 * This implements GitHub's `define_access` pattern, allowing declarative
 * specification of who can perform an action.
 *
 * Example usage:
 *
 * ```typescript
 * const getRepo = defineAccess<Repository>((access) => {
 *   access.ensureContext('resource');
 *   access.allow('everyone', (ctx) => ctx.resource?.isPublic ?? false);
 *   access.allow('repoContentsReader');
 * });
 * ```
 */

import { AccessContext, AccessDefinition, AccessRule } from './types';
import { RoleName } from './roles';

/**
 * Builder class for constructing access definitions.
 * Uses a fluent API for readability.
 */
class AccessDefinitionBuilder<TResource = unknown> {
  private rules: AccessRule<TResource>[] = [];
  private requiredContextKeys: string[] = [];

  /**
   * Specify required context keys for this access definition.
   * The guard will fail fast if these keys are missing.
   *
   * @example
   * access.ensureContext('resource'); // Requires a resource to be loaded
   * access.ensureContext('resource', 'user'); // Requires both
   */
  ensureContext(...keys: string[]): this {
    this.requiredContextKeys.push(...keys);
    return this;
  }

  /**
   * Allow access for a specific role.
   *
   * @example
   * access.allow('repoContentsReader');
   */
  allow(role: RoleName): this;

  /**
   * Allow access for everyone if a condition is met.
   * Typically used for public resources.
   *
   * @example
   * access.allow('everyone', (ctx) => ctx.resource?.isPublic ?? false);
   */
  allow(
    role: 'everyone',
    condition: (context: AccessContext<TResource>) => boolean | Promise<boolean>
  ): this;

  /**
   * Allow access for a role with an additional condition.
   *
   * @example
   * access.allow('repoContentsReader', (ctx) => !ctx.resource?.archived);
   */
  allow(
    role: RoleName,
    condition: (context: AccessContext<TResource>) => boolean | Promise<boolean>
  ): this;

  allow(
    role: RoleName | 'everyone',
    condition?: (context: AccessContext<TResource>) => boolean | Promise<boolean>
  ): this {
    if (role === 'everyone') {
      // 'everyone' requires a condition
      if (!condition) {
        throw new Error("'everyone' role requires a condition");
      }
      this.rules.push({ roles: ['everyone'], condition });
    } else {
      this.rules.push({ roles: [role], condition });
    }
    return this;
  }

  /**
   * Allow access if any of the specified roles match.
   * This is useful when multiple roles can grant the same access.
   *
   * @example
   * access.allowAny('repoContentsReader', 'repoAdmin');
   */
  allowAny(...roleNames: RoleName[]): this {
    this.rules.push({ roles: roleNames });
    return this;
  }

  /**
   * Build the final access definition.
   */
  build(): AccessDefinition<TResource> {
    return {
      requiredContext: this.requiredContextKeys,
      rules: this.rules,
    };
  }
}

/**
 * Define access rules for an action.
 *
 * This is the main entry point for creating access definitions.
 * Pass a configuration function that uses the builder to specify rules.
 *
 * @example
 * export const getContents = defineAccess<Repository>((access) => {
 *   access.ensureContext('resource');
 *   access.allow('everyone', (ctx) => ctx.resource?.isPublic ?? false);
 *   access.allow('repoContentsReader');
 * });
 *
 * @param configure Function that configures the access definition
 * @returns The built access definition
 */
export function defineAccess<TResource = unknown>(
  configure: (builder: AccessDefinitionBuilder<TResource>) => void
): AccessDefinition<TResource> {
  const builder = new AccessDefinitionBuilder<TResource>();
  configure(builder);
  return builder.build();
}
