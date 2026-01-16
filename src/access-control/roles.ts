/**
 * Role definitions as predicate functions.
 *
 * This implements GitHub's pattern where roles are not static assignments,
 * but rather functions that evaluate context to determine access.
 *
 * Each role checks:
 * 1. OAuth scopes (for traditional tokens)
 * 2. Fine-grained permissions (for GitHub Apps / PAT v2)
 * 3. Resource-level access (repository role, org membership, etc.)
 */

import type { AccessContext, RolePredicate } from './types';
import type { Repository } from '../entities/repository.entity';
import type { Organization } from '../entities/organization.entity';
import type { User } from '../entities/user.entity';

/**
 * Check if OAuth scopes allow access to a repository.
 * For fine-grained tokens, this check is skipped.
 */
function oauthAllowsAccess(user: User, repo: Repository): boolean {
  // Fine-grained tokens don't use OAuth scopes
  if (user.hasGranularPermissions) return true;

  // Public repos need public_repo scope, private need repo scope
  return repo.isPublic ? user.hasScope('public_repo') : user.hasScope('repo');
}

/**
 * All role definitions.
 *
 * Roles follow the naming convention:
 * - `<resource>Reader` - Can read the resource
 * - `<resource>Writer` - Can write to the resource
 * - `<resource>Admin` - Has full control of the resource
 */
export const roles = {
  /**
   * Any authenticated user.
   */
  authenticated: ((ctx: AccessContext): boolean => {
    return ctx.user !== null;
  }) satisfies RolePredicate,

  /**
   * Can read repository metadata (name, description, stars, etc.).
   * This is the most permissive repo role.
   */
  repoMetadataReader: ((ctx: AccessContext<Repository>): boolean => {
    const { user, resource: repo } = ctx;
    if (!user || !repo) return false;

    if (!oauthAllowsAccess(user, repo)) return false;
    return repo.readableBy(user);
  }) satisfies RolePredicate<Repository>,

  /**
   * Can read repository contents (code, commits, branches).
   */
  repoContentsReader: ((ctx: AccessContext<Repository>): boolean => {
    const { user, resource: repo } = ctx;
    if (!user || !repo) return false;

    if (!oauthAllowsAccess(user, repo)) return false;
    return repo.resources.contents.readableBy(user);
  }) satisfies RolePredicate<Repository>,

  /**
   * Can write repository contents (push code).
   */
  repoContentsWriter: ((ctx: AccessContext<Repository>): boolean => {
    const { user, resource: repo } = ctx;
    if (!user || !repo) return false;

    if (!oauthAllowsAccess(user, repo)) return false;
    return repo.resources.contents.writableBy(user);
  }) satisfies RolePredicate<Repository>,

  /**
   * Can read issues on a repository.
   */
  issueReader: ((ctx: AccessContext<Repository>): boolean => {
    const { user, resource: repo } = ctx;
    if (!user || !repo) return false;

    if (!oauthAllowsAccess(user, repo)) return false;
    return repo.resources.issues.readableBy(user);
  }) satisfies RolePredicate<Repository>,

  /**
   * Can create and edit issues on a repository.
   */
  issueWriter: ((ctx: AccessContext<Repository>): boolean => {
    const { user, resource: repo } = ctx;
    if (!user || !repo) return false;

    if (!oauthAllowsAccess(user, repo)) return false;
    return repo.resources.issues.writableBy(user);
  }) satisfies RolePredicate<Repository>,

  /**
   * Can read pull requests on a repository.
   */
  pullRequestReader: ((ctx: AccessContext<Repository>): boolean => {
    const { user, resource: repo } = ctx;
    if (!user || !repo) return false;

    if (!oauthAllowsAccess(user, repo)) return false;
    return repo.resources.pullRequests.readableBy(user);
  }) satisfies RolePredicate<Repository>,

  /**
   * Can create and edit pull requests on a repository.
   */
  pullRequestWriter: ((ctx: AccessContext<Repository>): boolean => {
    const { user, resource: repo } = ctx;
    if (!user || !repo) return false;

    if (!oauthAllowsAccess(user, repo)) return false;
    return repo.resources.pullRequests.writableBy(user);
  }) satisfies RolePredicate<Repository>,

  /**
   * Can read repository administration settings.
   */
  repoAdministrationReader: ((ctx: AccessContext<Repository>): boolean => {
    const { user, resource: repo } = ctx;
    if (!user || !repo) return false;

    if (!oauthAllowsAccess(user, repo)) return false;
    return repo.resources.administration.readableBy(user);
  }) satisfies RolePredicate<Repository>,

  /**
   * Can modify repository administration settings.
   */
  repoAdministrationWriter: ((ctx: AccessContext<Repository>): boolean => {
    const { user, resource: repo } = ctx;
    if (!user || !repo) return false;

    if (!oauthAllowsAccess(user, repo)) return false;
    return repo.resources.administration.writableBy(user);
  }) satisfies RolePredicate<Repository>,

  /**
   * Full admin access to a repository.
   */
  repoAdmin: ((ctx: AccessContext<Repository>): boolean => {
    const { user, resource: repo } = ctx;
    if (!user || !repo) return false;

    if (!oauthAllowsAccess(user, repo)) return false;
    return repo.adminableBy(user);
  }) satisfies RolePredicate<Repository>,

  /**
   * Can read GitHub Actions workflows and runs.
   */
  actionsReader: ((ctx: AccessContext<Repository>): boolean => {
    const { user, resource: repo } = ctx;
    if (!user || !repo) return false;

    if (!oauthAllowsAccess(user, repo)) return false;
    return repo.resources.actions.readableBy(user);
  }) satisfies RolePredicate<Repository>,

  /**
   * Can trigger and manage GitHub Actions workflows.
   */
  actionsWriter: ((ctx: AccessContext<Repository>): boolean => {
    const { user, resource: repo } = ctx;
    if (!user || !repo) return false;

    if (!oauthAllowsAccess(user, repo)) return false;
    return repo.resources.actions.writableBy(user);
  }) satisfies RolePredicate<Repository>,

  /**
   * Can read packages from the repository.
   */
  packagesReader: ((ctx: AccessContext<Repository>): boolean => {
    const { user, resource: repo } = ctx;
    if (!user || !repo) return false;

    // Packages require specific scope
    if (!user.hasGranularPermissions && !user.hasScope('read:packages')) {
      return false;
    }

    return repo.resources.packages.readableBy(user);
  }) satisfies RolePredicate<Repository>,

  /**
   * Can publish packages to the repository.
   */
  packagesWriter: ((ctx: AccessContext<Repository>): boolean => {
    const { user, resource: repo } = ctx;
    if (!user || !repo) return false;

    // Packages require specific scope
    if (!user.hasGranularPermissions && !user.hasScope('write:packages')) {
      return false;
    }

    return repo.resources.packages.writableBy(user);
  }) satisfies RolePredicate<Repository>,

  /**
   * Can manage repository collaborators.
   */
  repoCollaboratorManager: ((ctx: AccessContext<Repository>): boolean => {
    const { user, resource: repo } = ctx;
    if (!user || !repo) return false;

    if (!oauthAllowsAccess(user, repo)) return false;
    return repo.resources.administration.writableBy(user);
  }) satisfies RolePredicate<Repository>,

  /**
   * Can read repository webhooks.
   */
  repoHookReader: ((ctx: AccessContext<Repository>): boolean => {
    const { user, resource: repo } = ctx;
    if (!user || !repo) return false;

    // Webhooks require admin:repo_hook or repo scope
    if (!user.hasGranularPermissions && !user.hasScope('admin:repo_hook') && !user.hasScope('repo')) {
      return false;
    }

    return repo.resources.administration.readableBy(user);
  }) satisfies RolePredicate<Repository>,

  /**
   * Can manage repository webhooks.
   */
  repoHookWriter: ((ctx: AccessContext<Repository>): boolean => {
    const { user, resource: repo } = ctx;
    if (!user || !repo) return false;

    // Webhooks require admin:repo_hook scope
    if (!user.hasGranularPermissions && !user.hasScope('admin:repo_hook')) {
      return false;
    }

    return repo.resources.administration.writableBy(user);
  }) satisfies RolePredicate<Repository>,

  // ==================== Organization Roles ====================

  /**
   * Member of an organization (any role).
   */
  orgMember: ((ctx: AccessContext<Organization>): boolean => {
    const { user, resource: org } = ctx;
    if (!user || !org) return false;

    // Check OAuth scope
    if (!user.hasGranularPermissions && !user.hasScope('read:org')) {
      return false;
    }

    return org.isMember(user);
  }) satisfies RolePredicate<Organization>,

  /**
   * Admin of an organization (owner or admin role).
   */
  orgAdmin: ((ctx: AccessContext<Organization>): boolean => {
    const { user, resource: org } = ctx;
    if (!user || !org) return false;

    // Check OAuth scope
    if (!user.hasGranularPermissions && !user.hasScope('admin:org')) {
      return false;
    }

    const role = org.getRoleFor(user);
    return role === 'owner' || role === 'admin';
  }) satisfies RolePredicate<Organization>,

  /**
   * Owner of an organization.
   */
  orgOwner: ((ctx: AccessContext<Organization>): boolean => {
    const { user, resource: org } = ctx;
    if (!user || !org) return false;

    // Check OAuth scope
    if (!user.hasGranularPermissions && !user.hasScope('admin:org')) {
      return false;
    }

    return org.isOwner(user);
  }) satisfies RolePredicate<Organization>,

  /**
   * Can manage billing for an organization.
   */
  orgBillingManager: ((ctx: AccessContext<Organization>): boolean => {
    const { user, resource: org } = ctx;
    if (!user || !org) return false;

    return org.isBillingManager(user);
  }) satisfies RolePredicate<Organization>,

  /**
   * Can manage teams in an organization.
   */
  orgTeamManager: ((ctx: AccessContext<Organization>): boolean => {
    const { user, resource: org } = ctx;
    if (!user || !org) return false;

    // Check OAuth scope
    if (!user.hasGranularPermissions && !user.hasScope('write:org')) {
      return false;
    }

    return org.canManageTeams(user);
  }) satisfies RolePredicate<Organization>,

  /**
   * Can create repositories in an organization.
   */
  orgRepoCreator: ((ctx: AccessContext<Organization>): boolean => {
    const { user, resource: org } = ctx;
    if (!user || !org) return false;

    // Check OAuth scope
    if (!user.hasGranularPermissions && !user.hasScope('repo')) {
      return false;
    }

    return org.canCreateRepos(user);
  }) satisfies RolePredicate<Organization>,

  // ==================== User Self-Access Roles ====================

  /**
   * User accessing their own resource, or a site admin.
   * Used for sensitive data like emails, SSH keys, etc.
   */
  selfOrAdmin: ((ctx: AccessContext<User>): boolean => {
    const { user, resource: targetUser } = ctx;
    if (!user || !targetUser) return false;

    // User accessing their own data
    if (user.id === targetUser.id) return true;

    // Site admin can access anyone's data
    if (user.hasScope('site_admin')) return true;

    return false;
  }) satisfies RolePredicate<User>,
} as const;

export type RoleName = keyof typeof roles;
