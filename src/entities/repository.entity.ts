import { User } from './user.entity';
import { RepositoryResources } from './repository-resources';

/**
 * Repository entity with access control methods.
 */
export class Repository {
  public readonly resources: RepositoryResources;

  constructor(
    public readonly id: string,
    public readonly owner: string,
    public readonly name: string,
    public readonly isPublic: boolean,
    private readonly collaborators: Map<string, RepositoryRole> = new Map()
  ) {
    this.resources = new RepositoryResources(this);
  }

  /**
   * Get the user's role on this repository.
   */
  getRoleFor(user: User): RepositoryRole | null {
    return this.collaborators.get(user.id) ?? null;
  }

  /**
   * Check if user can read this repository.
   */
  readableBy(user: User): boolean {
    if (this.isPublic) return true;
    const role = this.getRoleFor(user);
    return role !== null;
  }

  /**
   * Check if user can push to this repository.
   */
  pushableBy(user: User): boolean {
    const role = this.getRoleFor(user);
    if (!role) return false;
    return ['admin', 'maintain', 'write'].includes(role);
  }

  /**
   * Check if user can administer this repository.
   */
  adminableBy(user: User): boolean {
    const role = this.getRoleFor(user);
    return role === 'admin';
  }

  /**
   * Add a collaborator to this repository.
   */
  addCollaborator(userId: string, role: RepositoryRole): void {
    this.collaborators.set(userId, role);
  }
}

/**
 * Repository permission roles (matches GitHub's model).
 */
export type RepositoryRole = 'admin' | 'maintain' | 'write' | 'triage' | 'read';
