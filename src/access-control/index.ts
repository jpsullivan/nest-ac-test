// Core types
export { AccessContext, AccessDefinition, AccessCheckResult, RolePredicate } from './types';

// DSL
export { defineAccess } from './define-access';

// Roles
export { roles, RoleName } from './roles';

// Service
export { AccessControlService } from './access-control.service';

// Decorators and Guard
export { Access, LoadResource, ACCESS_DEFINITION_KEY, RESOURCE_LOADER_KEY } from './access.decorator';
export { AccessGuard } from './access.guard';

// Pre-defined access rules
export { repoAccess } from './definitions';
