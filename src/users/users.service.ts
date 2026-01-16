import { Injectable } from '@nestjs/common';
import { User } from '../entities/user.entity';

/**
 * Service for managing users.
 */
@Injectable()
export class UsersService {
  private users = new Map<string, UserProfile>();

  constructor() {
    this.seedData();
  }

  private seedData(): void {
    this.users.set('admin-user', {
      id: 'user-1',
      login: 'admin-user',
      name: 'Admin User',
      email: 'admin@example.com',
      publicRepos: 10,
      privateRepos: 5,
    });

    this.users.set('write-user', {
      id: 'user-2',
      login: 'write-user',
      name: 'Write User',
      email: 'write@example.com',
      publicRepos: 3,
      privateRepos: 2,
    });

    this.users.set('read-user', {
      id: 'user-3',
      login: 'read-user',
      name: 'Read User',
      email: 'read@example.com',
      publicRepos: 1,
      privateRepos: 0,
    });
  }

  async findByLogin(login: string): Promise<UserProfile | null> {
    return this.users.get(login) ?? null;
  }

  async findById(id: string): Promise<UserProfile | null> {
    for (const user of this.users.values()) {
      if (user.id === id) return user;
    }
    return null;
  }

  /**
   * Create a User entity from profile (for access control).
   */
  async findUserEntityByLogin(login: string): Promise<User | null> {
    const profile = this.users.get(login);
    if (!profile) return null;
    // Create a minimal User for access control checks
    return User.fromOAuthScopes(profile.id, profile.login, []);
  }

  async getEmails(login: string): Promise<{ email: string; primary: boolean }[]> {
    const user = this.users.get(login);
    if (!user) return [];
    return [
      { email: user.email, primary: true },
      { email: `${login}@users.noreply.github.com`, primary: false },
    ];
  }

  async getKeys(login: string): Promise<{ id: number; key: string }[]> {
    return [
      { id: 1, key: 'ssh-rsa AAAAB3NzaC1yc2E...' },
    ];
  }

  async getOrgs(login: string): Promise<{ login: string; id: string }[]> {
    // Simplified
    return [{ login: 'acme-corp', id: 'org-1' }];
  }

  async getRepos(login: string): Promise<{ name: string; private: boolean }[]> {
    return [
      { name: 'my-project', private: false },
      { name: 'secret-project', private: true },
    ];
  }
}

interface UserProfile {
  id: string;
  login: string;
  name: string;
  email: string;
  publicRepos: number;
  privateRepos: number;
}
