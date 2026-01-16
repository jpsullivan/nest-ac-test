/**
 * Access definitions for repository endpoints.
 *
 * This mirrors GitHub's config/access_control/repos_access.rb pattern.
 * Each definition specifies who can perform a specific action.
 */

import type { Repository } from "../../entities/repository.entity";
import { defineAccess } from "../define-access";

export const repoAccess = {
	/**
	 * GET /repos/:owner/:repo
	 * View repository metadata.
	 */
	getRepo: defineAccess<Repository>((access) => {
		access.ensureContext("resource");
		access.allow("everyone", (ctx) => ctx.resource?.isPublic ?? false);
		access.allow("repoMetadataReader");
	}),

	/**
	 * GET /repos/:owner/:repo/contents/*
	 * Read repository contents (files, directories).
	 */
	getContents: defineAccess<Repository>((access) => {
		access.ensureContext("resource");
		access.allow("everyone", (ctx) => ctx.resource?.isPublic ?? false);
		access.allow("repoContentsReader");
	}),

	/**
	 * PUT /repos/:owner/:repo/contents/*
	 * Create or update file contents.
	 */
	updateContents: defineAccess<Repository>((access) => {
		access.ensureContext("resource");
		access.allow("repoContentsWriter");
	}),

	/**
	 * GET /repos/:owner/:repo/branches
	 * List repository branches.
	 */
	listBranches: defineAccess<Repository>((access) => {
		access.ensureContext("resource");
		access.allow("everyone", (ctx) => ctx.resource?.isPublic ?? false);
		access.allow("repoContentsReader");
	}),

	/**
	 * GET /repos/:owner/:repo/commits
	 * List repository commits.
	 */
	listCommits: defineAccess<Repository>((access) => {
		access.ensureContext("resource");
		access.allow("everyone", (ctx) => ctx.resource?.isPublic ?? false);
		access.allow("repoContentsReader");
	}),

	/**
	 * GET /repos/:owner/:repo/issues
	 * List issues on a repository.
	 */
	listIssues: defineAccess<Repository>((access) => {
		access.ensureContext("resource");
		access.allow("everyone", (ctx) => ctx.resource?.isPublic ?? false);
		access.allow("issueReader");
	}),

	/**
	 * POST /repos/:owner/:repo/issues
	 * Create a new issue.
	 */
	createIssue: defineAccess<Repository>((access) => {
		access.ensureContext("resource");
		// Anyone authenticated can create issues on public repos
		access.allow(
			"everyone",
			(ctx) => ctx.resource?.isPublic && ctx.user !== null,
		);
		access.allow("issueWriter");
	}),

	/**
	 * PATCH /repos/:owner/:repo/issues/:issue_number
	 * Update an existing issue.
	 */
	updateIssue: defineAccess<Repository>((access) => {
		access.ensureContext("resource");
		access.allow("issueWriter");
	}),

	/**
	 * GET /repos/:owner/:repo/pulls
	 * List pull requests.
	 */
	listPullRequests: defineAccess<Repository>((access) => {
		access.ensureContext("resource");
		access.allow("everyone", (ctx) => ctx.resource?.isPublic ?? false);
		access.allow("pullRequestReader");
	}),

	/**
	 * POST /repos/:owner/:repo/pulls
	 * Create a pull request.
	 */
	createPullRequest: defineAccess<Repository>((access) => {
		access.ensureContext("resource");
		access.allow("pullRequestWriter");
	}),

	/**
	 * GET /repos/:owner/:repo/actions/runs
	 * List workflow runs.
	 */
	listWorkflowRuns: defineAccess<Repository>((access) => {
		access.ensureContext("resource");
		access.allow("everyone", (ctx) => ctx.resource?.isPublic ?? false);
		access.allow("actionsReader");
	}),

	/**
	 * POST /repos/:owner/:repo/actions/workflows/:workflow_id/dispatches
	 * Trigger a workflow run.
	 */
	dispatchWorkflow: defineAccess<Repository>((access) => {
		access.ensureContext("resource");
		access.allow("actionsWriter");
	}),

	/**
	 * GET /repos/:owner/:repo/settings
	 * View repository settings.
	 */
	getSettings: defineAccess<Repository>((access) => {
		access.ensureContext("resource");
		access.allow("repoAdministrationReader");
	}),

	/**
	 * PATCH /repos/:owner/:repo
	 * Update repository settings.
	 */
	updateRepo: defineAccess<Repository>((access) => {
		access.ensureContext("resource");
		access.allow("repoAdministrationWriter");
	}),

	/**
	 * DELETE /repos/:owner/:repo
	 * Delete a repository.
	 */
	deleteRepo: defineAccess<Repository>((access) => {
		access.ensureContext("resource");
		access.allow("repoAdmin");
	}),

	/**
	 * POST /repos/:owner/:repo/transfer
	 * Transfer repository ownership.
	 */
	transferRepo: defineAccess<Repository>((access) => {
		access.ensureContext("resource");
		access.allow("repoAdmin");
	}),

	// ==================== Collaborators ====================

	/**
	 * GET /repos/:owner/:repo/collaborators
	 * List repository collaborators.
	 */
	listCollaborators: defineAccess<Repository>((access) => {
		access.ensureContext("resource");
		access.allow("repoContentsReader");
	}),

	/**
	 * PUT /repos/:owner/:repo/collaborators/:username
	 * Add a collaborator to the repository.
	 */
	addCollaborator: defineAccess<Repository>((access) => {
		access.ensureContext("resource");
		access.allow("repoCollaboratorManager");
	}),

	/**
	 * DELETE /repos/:owner/:repo/collaborators/:username
	 * Remove a collaborator from the repository.
	 */
	removeCollaborator: defineAccess<Repository>((access) => {
		access.ensureContext("resource");
		access.allow("repoCollaboratorManager");
	}),

	/**
	 * GET /repos/:owner/:repo/collaborators/:username/permission
	 * Check a user's permission level.
	 */
	getCollaboratorPermission: defineAccess<Repository>((access) => {
		access.ensureContext("resource");
		access.allow("repoContentsReader");
	}),

	// ==================== Webhooks ====================

	/**
	 * GET /repos/:owner/:repo/hooks
	 * List repository webhooks.
	 */
	listHooks: defineAccess<Repository>((access) => {
		access.ensureContext("resource");
		access.allow("repoHookReader");
	}),

	/**
	 * POST /repos/:owner/:repo/hooks
	 * Create a webhook.
	 */
	createHook: defineAccess<Repository>((access) => {
		access.ensureContext("resource");
		access.allow("repoHookWriter");
	}),

	/**
	 * PATCH /repos/:owner/:repo/hooks/:hook_id
	 * Update a webhook.
	 */
	updateHook: defineAccess<Repository>((access) => {
		access.ensureContext("resource");
		access.allow("repoHookWriter");
	}),

	/**
	 * DELETE /repos/:owner/:repo/hooks/:hook_id
	 * Delete a webhook.
	 */
	deleteHook: defineAccess<Repository>((access) => {
		access.ensureContext("resource");
		access.allow("repoHookWriter");
	}),

	// ==================== Releases ====================

	/**
	 * GET /repos/:owner/:repo/releases
	 * List releases.
	 */
	listReleases: defineAccess<Repository>((access) => {
		access.ensureContext("resource");
		access.allow("everyone", (ctx) => ctx.resource?.isPublic ?? false);
		access.allow("repoContentsReader");
	}),

	/**
	 * POST /repos/:owner/:repo/releases
	 * Create a release.
	 */
	createRelease: defineAccess<Repository>((access) => {
		access.ensureContext("resource");
		access.allow("repoContentsWriter");
	}),

	/**
	 * PATCH /repos/:owner/:repo/releases/:release_id
	 * Update a release.
	 */
	updateRelease: defineAccess<Repository>((access) => {
		access.ensureContext("resource");
		access.allow("repoContentsWriter");
	}),

	/**
	 * DELETE /repos/:owner/:repo/releases/:release_id
	 * Delete a release.
	 */
	deleteRelease: defineAccess<Repository>((access) => {
		access.ensureContext("resource");
		access.allow("repoContentsWriter");
	}),
};
