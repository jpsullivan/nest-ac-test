import { User } from './user.entity';

/**
 * Organization entity with membership-based access control.
 */
export class Organization {
  constructor(
    public readonly id: string,
    public readonly login: string,
    public readonly displayName: string,
    private readonly members: Map<string, OrgRole> = new Map(),
    private readonly teams: Map<string, Set<string>> = new Map() // teamName -> Set<userId>
  ) {}

  /**
   * Get the user's role in this organization.
   */
  getRoleFor(user: User): OrgRole | null {
    return this.members.get(user.id) ?? null;
  }

  /**
   * Check if user is a member of this organization.
   */
  isMember(user: User): boolean {
    return this.members.has(user.id);
  }

  /**
   * Check if user is an owner of this organization.
   */
  isOwner(user: User): boolean {
    return this.getRoleFor(user) === 'owner';
  }

  /**
   * Check if user is a billing manager.
   */
  isBillingManager(user: User): boolean {
    const role = this.getRoleFor(user);
    return role === 'owner' || role === 'billing_manager';
  }

  /**
   * Check if user can create repositories in this organization.
   */
  canCreateRepos(user: User): boolean {
    const role = this.getRoleFor(user);
    if (!role) return false;
    // Owners and admins can always create repos
    // Members can if org settings allow (simplified here)
    return ['owner', 'admin', 'member'].includes(role);
  }

  /**
   * Check if user can manage teams.
   */
  canManageTeams(user: User): boolean {
    const role = this.getRoleFor(user);
    return role === 'owner' || role === 'admin';
  }

  /**
   * Check if user is a member of a specific team.
   */
  isTeamMember(user: User, teamName: string): boolean {
    const team = this.teams.get(teamName);
    return team?.has(user.id) ?? false;
  }

  /**
   * Add a member to this organization.
   */
  addMember(userId: string, role: OrgRole): void {
    this.members.set(userId, role);
  }

  /**
   * Add a team to this organization.
   */
  addTeam(teamName: string, memberIds: string[]): void {
    this.teams.set(teamName, new Set(memberIds));
  }

  /**
   * Get all members.
   */
  getMembers(): { userId: string; role: OrgRole }[] {
    return Array.from(this.members.entries()).map(([userId, role]) => ({
      userId,
      role,
    }));
  }
}

/**
 * Organization membership roles.
 */
export type OrgRole = 'owner' | 'admin' | 'member' | 'billing_manager';
