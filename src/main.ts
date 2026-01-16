import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global prefix for API routes
  app.setGlobalPrefix('api');

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  console.log(`
🚀 Server running at http://localhost:${port}

========================================
REPOSITORY ENDPOINTS
========================================

# Public repo - anyone can read (no auth)
curl http://localhost:${port}/api/repos/octocat/hello-world

# Private repo - returns 404 without auth (hides existence)
curl http://localhost:${port}/api/repos/octocat/secret-project

# Private repo - with proper auth
curl http://localhost:${port}/api/repos/octocat/secret-project \\
  -H "Authorization: Bearer admin-token"

# Create issue (requires write permission)
curl -X POST http://localhost:${port}/api/repos/octocat/hello-world/issues \\
  -H "Authorization: Bearer write-token" \\
  -H "Content-Type: application/json" \\
  -d '{"title": "New issue"}'

# List webhooks (requires admin:repo_hook scope)
curl http://localhost:${port}/api/repos/octocat/hello-world/hooks \\
  -H "Authorization: Bearer admin-token"

# GitHub App with fine-grained permissions
curl http://localhost:${port}/api/repos/octocat/hello-world/issues \\
  -H "Authorization: Bearer github-app-token"

========================================
ORGANIZATION ENDPOINTS
========================================

# Public org profile - anyone can view
curl http://localhost:${port}/api/orgs/acme-corp

# List org members - requires membership
curl http://localhost:${port}/api/orgs/acme-corp/members \\
  -H "Authorization: Bearer org-member-token"

# List org teams - requires membership
curl http://localhost:${port}/api/orgs/acme-corp/teams \\
  -H "Authorization: Bearer org-member-token"

# Create team - requires admin
curl -X POST http://localhost:${port}/api/orgs/acme-corp/teams \\
  -H "Authorization: Bearer org-admin-token" \\
  -H "Content-Type: application/json" \\
  -d '{"name": "new-team"}'

# View billing - requires billing manager or owner
curl http://localhost:${port}/api/orgs/acme-corp/billing \\
  -H "Authorization: Bearer billing-manager-token"

# Create repo in org
curl -X POST http://localhost:${port}/api/orgs/acme-corp/repos \\
  -H "Authorization: Bearer org-member-token" \\
  -H "Content-Type: application/json" \\
  -d '{"name": "new-repo"}'

========================================
USER ENDPOINTS
========================================

# Get current user (self)
curl http://localhost:${port}/api/user \\
  -H "Authorization: Bearer admin-token"

# List own repos (includes private)
curl http://localhost:${port}/api/user/repos \\
  -H "Authorization: Bearer admin-token"

# View other user's public profile
curl http://localhost:${port}/api/users/admin-user

# View other user's emails - DENIED (not self)
curl http://localhost:${port}/api/users/admin-user/emails \\
  -H "Authorization: Bearer write-token"

# View other user's emails - ALLOWED (site admin)
curl http://localhost:${port}/api/users/admin-user/emails \\
  -H "Authorization: Bearer site-admin-token"

========================================
AVAILABLE TEST TOKENS
========================================
admin-token       - Repo admin, org owner
write-token       - Repo write access
read-token        - Repo read access (public_repo scope)
triage-token      - Can manage issues, not code
github-app-token  - Fine-grained: contents:read, issues:write
pat-v2-token      - Fine-grained PAT: contents:read, issues:read
outsider-token    - Authenticated but no repo access
org-member-token  - Org member (read:org scope)
org-admin-token   - Org admin (admin:org scope)
org-owner-token   - Org owner (admin:org scope)
billing-manager-token - Can view billing
site-admin-token  - Site admin (can access any user's data)
`);
}

bootstrap();
