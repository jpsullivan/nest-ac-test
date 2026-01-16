import { Injectable } from '@nestjs/common';
import { Repository } from '../entities/repository.entity';

/**
 * Service for managing repositories.
 * In a real application, this would interact with a database.
 */
@Injectable()
export class ReposService {
  // In-memory store for demo purposes
  private repos = new Map<string, Repository>();

  constructor() {
    // Seed some example data
    this.seedData();
  }

  private seedData(): void {
    // Public repository
    const publicRepo = new Repository(
      '1',
      'octocat',
      'hello-world',
      true
    );
    publicRepo.addCollaborator('user-1', 'admin');
    publicRepo.addCollaborator('user-2', 'write');
    publicRepo.addCollaborator('user-3', 'read');
    this.repos.set('octocat/hello-world', publicRepo);

    // Private repository
    const privateRepo = new Repository(
      '2',
      'octocat',
      'secret-project',
      false
    );
    privateRepo.addCollaborator('user-1', 'admin');
    privateRepo.addCollaborator('user-4', 'triage');
    this.repos.set('octocat/secret-project', privateRepo);
  }

  /**
   * Find a repository by owner and name.
   */
  async findByOwnerAndName(owner: string, name: string): Promise<Repository | null> {
    return this.repos.get(`${owner}/${name}`) ?? null;
  }

  /**
   * List all repositories (for admin purposes).
   */
  async findAll(): Promise<Repository[]> {
    return Array.from(this.repos.values());
  }

  /**
   * Get repository contents (simplified).
   */
  async getContents(
    owner: string,
    name: string,
    path: string
  ): Promise<{ path: string; type: string; content?: string }> {
    // In reality, this would read from git
    return {
      path,
      type: 'file',
      content: 'Hello, World!',
    };
  }

  /**
   * List issues on a repository (simplified).
   */
  async listIssues(owner: string, name: string): Promise<{ id: number; title: string }[]> {
    return [
      { id: 1, title: 'First issue' },
      { id: 2, title: 'Second issue' },
    ];
  }

  /**
   * Create an issue on a repository (simplified).
   */
  async createIssue(
    owner: string,
    name: string,
    data: { title: string; body?: string }
  ): Promise<{ id: number; title: string; body?: string }> {
    return {
      id: Math.floor(Math.random() * 1000),
      ...data,
    };
  }

  /**
   * Delete a repository.
   */
  async delete(owner: string, name: string): Promise<void> {
    this.repos.delete(`${owner}/${name}`);
  }
}
