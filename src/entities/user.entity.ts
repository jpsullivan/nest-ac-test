/**
 * User entity representing an authenticated actor.
 *
 * This can represent:
 * - A human user with OAuth scopes
 * - A GitHub App installation with fine-grained permissions
 * - A Personal Access Token (classic or fine-grained)
 */
export class User {
  constructor(
    public readonly id: string,
    public readonly login: string,
    private readonly scopes: Set<string> = new Set(),
    private readonly permissions: Map<string, 'read' | 'write'> = new Map(),
    public readonly hasGranularPermissions: boolean = false
  ) {}

  /**
   * Check if user has an OAuth scope.
   * Handles scope hierarchy (e.g., 'repo' implies 'public_repo').
   */
  hasScope(scope: string): boolean {
    if (this.scopes.has(scope)) return true;

    // Handle scope hierarchy
    const scopeHierarchy: Record<string, string[]> = {
      repo: ['public_repo', 'repo:status', 'repo_deployment', 'repo:invite'],
      user: ['read:user', 'user:email', 'user:follow'],
      'admin:org': ['write:org', 'read:org'],
      'write:org': ['read:org'],
      'write:packages': ['read:packages'],
    };

    for (const [parent, children] of Object.entries(scopeHierarchy)) {
      if (this.scopes.has(parent) && children.includes(scope)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Check fine-grained permission level for a resource type.
   * Used by GitHub Apps and fine-grained PATs.
   */
  getPermission(resourceType: string): 'read' | 'write' | null {
    return this.permissions.get(resourceType) ?? null;
  }

  /**
   * Check if user can at least read a resource type.
   */
  canRead(resourceType: string): boolean {
    const perm = this.getPermission(resourceType);
    return perm === 'read' || perm === 'write';
  }

  /**
   * Check if user can write to a resource type.
   */
  canWrite(resourceType: string): boolean {
    return this.getPermission(resourceType) === 'write';
  }

  /**
   * Create a user from OAuth token scopes.
   */
  static fromOAuthScopes(id: string, login: string, scopes: string[]): User {
    return new User(id, login, new Set(scopes), new Map(), false);
  }

  /**
   * Create a user from fine-grained permissions (GitHub App or PAT v2).
   */
  static fromGranularPermissions(
    id: string,
    login: string,
    permissions: Record<string, 'read' | 'write'>
  ): User {
    return new User(
      id,
      login,
      new Set(),
      new Map(Object.entries(permissions)),
      true
    );
  }
}
