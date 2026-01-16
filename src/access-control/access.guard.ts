import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { AccessControlService } from './access-control.service';
import {
  ACCESS_DEFINITION_KEY,
  RESOURCE_LOADER_KEY,
  ResourceLoader,
} from './access.decorator';
import { AccessDefinition } from './types';

/**
 * Extend Express Request to include our custom properties.
 */
declare global {
  namespace Express {
    interface Request {
      user?: import('../entities/user.entity').User;
      resource?: unknown;
    }
  }
}

/**
 * Guard that enforces access control on route handlers.
 *
 * This guard:
 * 1. Extracts the access definition from route metadata
 * 2. Loads the resource if a loader is specified
 * 3. Evaluates the access definition against the context
 * 4. Returns 404 for private resources (to avoid leaking existence)
 * 5. Returns 403 for public resources the user can't access
 *
 * Apply globally or per-controller to enable access control.
 */
@Injectable()
export class AccessGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly accessControl: AccessControlService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Get the access definition from route metadata
    const definition = this.reflector.get<AccessDefinition>(
      ACCESS_DEFINITION_KEY,
      context.getHandler()
    );

    // No access control defined = allow (or require auth by default if you prefer)
    if (!definition) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user ?? null;

    // Load the resource if a loader is specified
    let resource: unknown;
    const resourceLoader = this.reflector.get<ResourceLoader<unknown>>(
      RESOURCE_LOADER_KEY,
      context.getHandler()
    );

    if (resourceLoader) {
      resource = await resourceLoader(request.params as Record<string, string>);

      if (!resource) {
        // Resource not found - always 404
        throw new NotFoundException();
      }

      // Attach resource to request for controller use
      request.resource = resource;
    }

    // Check access
    const result = await this.accessControl.checkAccess(definition, {
      user,
      resource,
      params: request.params as Record<string, unknown>,
    });

    if (!result.allowed) {
      // For private resources or unauthenticated users, return 404
      // This prevents leaking the existence of private resources
      if (!user || (resource && !this.isPublic(resource))) {
        throw new NotFoundException();
      }

      // For public resources, return 403
      throw new ForbiddenException(result.reason);
    }

    return true;
  }

  /**
   * Check if a resource is public.
   * Override this method if your resources have a different property name.
   */
  private isPublic(resource: unknown): boolean {
    if (typeof resource === 'object' && resource !== null) {
      return (resource as { isPublic?: boolean }).isPublic ?? false;
    }
    return false;
  }
}
