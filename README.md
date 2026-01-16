# GitHub-Style Access Control for NestJS

This example demonstrates how to implement GitHub's declarative access control pattern in a NestJS application.

## Key Concepts

### 1. Roles as Predicates

Instead of static role assignments, roles are **functions that evaluate context**:

```typescript
// roles.ts
repoContentsReader: (ctx) => {
  const { user, resource: repo } = ctx;
  if (!user || !repo) return false;
  if (!oauthAllowsAccess(user, repo)) return false;
  return repo.resources.contents.readableBy(user);
}
```

### 2. Declarative Access Definitions

Access rules are defined separately from controllers:

```typescript
// repos.access.ts
export const repoAccess = {
  getContents: defineAccess<Repository>((access) => {
    access.ensureContext('resource');
    access.allow('everyone', (ctx) => ctx.resource?.isPublic ?? false);
    access.allow('repoContentsReader');
  }),
};
```

### 3. Decorator-Based Enforcement

Controllers use decorators to specify access rules:

```typescript
@Get('contents/*')
@Access(repoAccess.getContents)
@LoadResource((params) => repoService.find(params.owner, params.repo))
async getContents() { ... }
```

## Project Structure

```
src/
├── access-control/
│   ├── types.ts                 # Core type definitions
│   ├── roles.ts                 # Role predicate functions
│   ├── define-access.ts         # DSL for defining access rules
│   ├── access-control.service.ts # Authorization engine
│   ├── access.decorator.ts      # @Access and @LoadResource decorators
│   ├── access.guard.ts          # NestJS guard
│   └── definitions/
│       └── repos.access.ts      # Repository access rules
├── entities/
│   ├── user.entity.ts           # User with scopes/permissions
│   ├── repository.entity.ts     # Repository with collaborators
│   └── repository-resources.ts  # Fine-grained resource permissions
├── repos/
│   ├── repos.controller.ts      # Example controller
│   └── repos.service.ts         # Repository service
└── auth/
    └── auth.middleware.ts       # Auth simulation for testing
```

## Running the Example

```bash
npm install
npm run start:dev
```

## Test Requests

```bash
# Public repo - anyone can read
curl http://localhost:3000/api/repos/octocat/hello-world

# Private repo - requires auth (returns 404 without auth)
curl http://localhost:3000/api/repos/octocat/secret-project

# Private repo - with admin token
curl http://localhost:3000/api/repos/octocat/secret-project \
  -H "Authorization: Bearer admin-token"

# Create issue (requires write permission)
curl -X POST http://localhost:3000/api/repos/octocat/hello-world/issues \
  -H "Authorization: Bearer write-token" \
  -H "Content-Type: application/json" \
  -d '{"title": "New issue"}'

# GitHub App with fine-grained permissions
curl http://localhost:3000/api/repos/octocat/hello-world/issues \
  -H "Authorization: Bearer github-app-token"
```

## Simulated Users

The auth middleware simulates different users:

| Token | User Type | Permissions |
|-------|-----------|-------------|
| `admin-token` | Admin | Full repo + admin:org scopes, admin role on repos |
| `write-token` | Collaborator | Repo scope, write role |
| `read-token` | Collaborator | Public repo scope, read role |
| `triage-token` | Triager | Repo scope, triage role |
| `github-app-token` | GitHub App | Fine-grained: contents:read, issues:write, pull_requests:write |
| `pat-v2-token` | PAT v2 | Fine-grained: contents:read, issues:read |
| `outsider-token` | Non-collaborator | Public repo scope only |

## Extending

### Adding a New Role

```typescript
// roles.ts
myNewRole: (ctx: AccessContext<MyResource>) => {
  const { user, resource } = ctx;
  if (!user || !resource) return false;
  // Your authorization logic
  return resource.someCheck(user);
}
```

### Adding Access Definitions

```typescript
// my-feature.access.ts
export const myFeatureAccess = {
  doSomething: defineAccess<MyResource>((access) => {
    access.ensureContext('resource');
    access.allow('myNewRole');
  }),
};
```

### Using in Controller

```typescript
@Post('something')
@Access(myFeatureAccess.doSomething)
@LoadResource((params) => myService.find(params.id))
async doSomething() { ... }
```
