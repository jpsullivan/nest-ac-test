import { SetMetadata } from '@nestjs/common';
import { AccessDefinition } from './types';

/**
 * Metadata keys for storing access control information on route handlers.
 */
export const ACCESS_DEFINITION_KEY = 'access:definition';
export const RESOURCE_LOADER_KEY = 'access:resource_loader';

/**
 * Decorator to specify access rules for a route handler.
 *
 * @example
 * @Get(':owner/:repo')
 * @Access(repoAccess.getRepo)
 * async getRepo() { ... }
 *
 * @param definition The access definition to apply
 */
export function Access<TResource = unknown>(
  definition: AccessDefinition<TResource>
) {
  return SetMetadata(ACCESS_DEFINITION_KEY, definition);
}

/**
 * Function type for loading a resource from request parameters.
 */
export type ResourceLoader<TResource> = (
  params: Record<string, string>
) => Promise<TResource | null>;

/**
 * Decorator to specify how to load the resource for access checking.
 *
 * The loaded resource will be:
 * 1. Used for access control checks
 * 2. Attached to the request as `request.resource`
 * 3. Available to the route handler
 *
 * @example
 * @Get(':owner/:repo')
 * @Access(repoAccess.getRepo)
 * @LoadResource((params) => repoService.findByOwnerAndName(params.owner, params.repo))
 * async getRepo(@Req() req: Request) {
 *   const repo = req.resource; // Already loaded and access-checked
 * }
 *
 * @param loader Function to load the resource from route params
 */
export function LoadResource<TResource>(loader: ResourceLoader<TResource>) {
  return SetMetadata(RESOURCE_LOADER_KEY, loader);
}
