import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { User } from '../entities/user.entity';

/**
 * Authentication middleware that extracts user from the request.
 *
 * In a real application, this would:
 * - Validate JWT or session tokens
 * - Look up the user in the database
 * - Extract OAuth scopes or fine-grained permissions
 *
 * This example middleware simulates different auth scenarios
 * based on the Authorization header for testing purposes.
 */
@Injectable()
export class AuthMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      // No auth = anonymous user
      req.user = undefined;
      return next();
    }

    // Simulate different users based on token
    // In production, you'd validate the token and look up the user
    req.user = this.getUserFromToken(authHeader);
    next();
  }

  private getUserFromToken(authHeader: string): User | undefined {
    const token = authHeader.replace('Bearer ', '');

    // Simulate different authentication scenarios
    switch (token) {
      case 'admin-token':
        // Admin user with full repo scope
        return User.fromOAuthScopes('user-1', 'admin-user', ['repo', 'admin:org']);

      case 'write-token':
        // Collaborator with write access
        return User.fromOAuthScopes('user-2', 'write-user', ['repo']);

      case 'read-token':
        // Collaborator with read access
        return User.fromOAuthScopes('user-3', 'read-user', ['public_repo']);

      case 'triage-token':
        // Triager (can manage issues but not code)
        return User.fromOAuthScopes('user-4', 'triage-user', ['repo']);

      case 'github-app-token':
        // GitHub App with fine-grained permissions
        return User.fromGranularPermissions('app-1', 'my-github-app[bot]', {
          contents: 'read',
          issues: 'write',
          pull_requests: 'write',
        });

      case 'pat-v2-token':
        // Fine-grained PAT with limited permissions
        return User.fromGranularPermissions('user-5', 'pat-user', {
          contents: 'read',
          issues: 'read',
        });

      case 'outsider-token':
        // Authenticated but not a collaborator
        return User.fromOAuthScopes('user-99', 'outsider', ['public_repo']);

      default:
        return undefined;
    }
  }
}
