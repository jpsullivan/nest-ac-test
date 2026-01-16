import { User } from './user.entity';
import { Repository, RepositoryRole } from './repository.entity';

/**
 * Fine-grained resource permissions for a repository.
 *
 * This implements GitHub's pattern where each resource type (contents, issues, etc.)
 * has its own permission checks that consider:
 * - The user's role on the repository
 * - The user's fine-grained permissions (for GitHub Apps / PAT v2)
 * - The repository's visibility
 */
export class RepositoryResources {
  constructor(private readonly repository: Repository) {}

  /**
   * Repository contents (code, files, commits).
   */
  get contents(): ResourcePermissions {
    return new ResourcePermissions(this.repository, 'contents', {
      readRoles: ['admin', 'maintain', 'write', 'triage', 'read'],
      writeRoles: ['admin', 'maintain', 'write'],
    });
  }

  /**
   * Issues on the repository.
   */
  get issues(): ResourcePermissions {
    return new ResourcePermissions(this.repository, 'issues', {
      readRoles: ['admin', 'maintain', 'write', 'triage', 'read'],
      writeRoles: ['admin', 'maintain', 'write', 'triage'],
    });
  }

  /**
   * Pull requests on the repository.
   */
  get pullRequests(): ResourcePermissions {
    return new ResourcePermissions(this.repository, 'pull_requests', {
      readRoles: ['admin', 'maintain', 'write', 'triage', 'read'],
      writeRoles: ['admin', 'maintain', 'write'],
    });
  }

  /**
   * Repository administration (settings, collaborators).
   */
  get administration(): ResourcePermissions {
    return new ResourcePermissions(this.repository, 'administration', {
      readRoles: ['admin'],
      writeRoles: ['admin'],
    });
  }

  /**
   * GitHub Actions workflows and runs.
   */
  get actions(): ResourcePermissions {
    return new ResourcePermissions(this.repository, 'actions', {
      readRoles: ['admin', 'maintain', 'write', 'triage', 'read'],
      writeRoles: ['admin', 'maintain', 'write'],
    });
  }

  /**
   * Repository packages.
   */
  get packages(): ResourcePermissions {
    return new ResourcePermissions(this.repository, 'packages', {
      readRoles: ['admin', 'maintain', 'write', 'triage', 'read'],
      writeRoles: ['admin', 'maintain', 'write'],
    });
  }

  /**
   * GitHub Pages settings.
   */
  get pages(): ResourcePermissions {
    return new ResourcePermissions(this.repository, 'pages', {
      readRoles: ['admin', 'maintain', 'write', 'triage', 'read'],
      writeRoles: ['admin', 'maintain'],
    });
  }

  /**
   * Security vulnerability alerts.
   */
  get vulnerabilityAlerts(): ResourcePermissions {
    return new ResourcePermissions(this.repository, 'vulnerability_alerts', {
      readRoles: ['admin', 'maintain', 'write'],
      writeRoles: ['admin'],
    });
  }

  /**
   * Access for a specific file path.
   * Used for single-file GitHub App permissions.
   */
  file(path: string): FilePermissions {
    return new FilePermissions(this.repository, path);
  }
}

/**
 * Permission checks for a specific resource type.
 */
class ResourcePermissions {
  constructor(
    private readonly repository: Repository,
    private readonly resourceType: string,
    private readonly config: {
      readRoles: RepositoryRole[];
      writeRoles: RepositoryRole[];
    }
  ) {}

  /**
   * Check if user can read this resource.
   */
  readableBy(user: User): boolean {
    // GitHub Apps / PAT v2: use fine-grained permissions
    if (user.hasGranularPermissions) {
      return user.canRead(this.resourceType);
    }

    // Traditional OAuth: check repository role
    const role = this.repository.getRoleFor(user);
    if (!role) return false;

    return this.config.readRoles.includes(role);
  }

  /**
   * Check if user can write to this resource.
   */
  writableBy(user: User): boolean {
    // GitHub Apps / PAT v2: use fine-grained permissions
    if (user.hasGranularPermissions) {
      return user.canWrite(this.resourceType);
    }

    // Traditional OAuth: check repository role
    const role = this.repository.getRoleFor(user);
    if (!role) return false;

    return this.config.writeRoles.includes(role);
  }
}

/**
 * Permission checks for a specific file.
 * Used for GitHub Apps with single-file permissions.
 */
class FilePermissions {
  constructor(
    private readonly repository: Repository,
    private readonly path: string
  ) {}

  readableBy(user: User): boolean {
    // For single-file permissions, check if the user's permitted paths include this file
    // This is a simplified implementation
    if (user.hasGranularPermissions) {
      return user.canRead('single_file') || user.canRead('contents');
    }
    return this.repository.readableBy(user);
  }

  writableBy(user: User): boolean {
    if (user.hasGranularPermissions) {
      return user.canWrite('single_file') || user.canWrite('contents');
    }
    return this.repository.pushableBy(user);
  }
}
