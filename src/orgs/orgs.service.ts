import { Injectable } from '@nestjs/common';
import { Organization } from '../entities/organization.entity';

/**
 * Service for managing organizations.
 */
@Injectable()
export class OrgsService {
  private orgs = new Map<string, Organization>();

  constructor() {
    this.seedData();
  }

  private seedData(): void {
    // Create an organization
    const org = new Organization('org-1', 'acme-corp', 'Acme Corporation');
    org.addMember('user-1', 'owner');
    org.addMember('user-2', 'admin');
    org.addMember('user-3', 'member');
    org.addMember('user-5', 'billing_manager');
    org.addTeam('engineering', ['user-1', 'user-2', 'user-3']);
    org.addTeam('design', ['user-3']);
    this.orgs.set('acme-corp', org);

    // Another org
    const org2 = new Organization('org-2', 'startup-inc', 'Startup Inc');
    org2.addMember('user-4', 'owner');
    this.orgs.set('startup-inc', org2);
  }

  async findByLogin(login: string): Promise<Organization | null> {
    return this.orgs.get(login) ?? null;
  }

  async findAll(): Promise<Organization[]> {
    return Array.from(this.orgs.values());
  }

  async getMembers(login: string): Promise<{ userId: string; role: string }[]> {
    const org = this.orgs.get(login);
    return org?.getMembers() ?? [];
  }

  async getTeams(login: string): Promise<string[]> {
    // Simplified - return team names
    return ['engineering', 'design'];
  }

  async getBilling(login: string): Promise<{ plan: string; seats: number }> {
    return { plan: 'enterprise', seats: 100 };
  }
}
