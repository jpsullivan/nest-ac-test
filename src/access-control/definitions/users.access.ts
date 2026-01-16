/**
 * Access definitions for user endpoints.
 *
 * User endpoints have unique patterns:
 * - Self-access (users can always access their own data)
 * - Public profile vs private data
 * - Admin override for site admins
 */

import { defineAccess } from '../define-access';
import { User } from '../../entities/user.entity';

export const userAccess = {
  /**
   * GET /users/:username
   * View user profile.
   * Public profiles are viewable by anyone.
   */
  getUser: defineAccess<User>((access) => {
    access.ensureContext('resource');
    access.allow('everyone', () => true);
  }),

  /**
   * GET /user
   * Get the authenticated user's own profile.
   */
  getCurrentUser: defineAccess((access) => {
    access.allow('authenticated');
  }),

  /**
   * PATCH /user
   * Update the authenticated user's profile.
   */
  updateCurrentUser: defineAccess((access) => {
    access.allow('authenticated');
  }),

  /**
   * GET /users/:username/repos
   * List a user's repositories.
   * Public repos are visible to everyone.
   */
  listUserRepos: defineAccess<User>((access) => {
    access.ensureContext('resource');
    access.allow('everyone', () => true);
  }),

  /**
   * GET /user/repos
   * List the authenticated user's repositories (including private).
   */
  listOwnRepos: defineAccess((access) => {
    access.allow('authenticated');
  }),

  /**
   * GET /users/:username/emails
   * List a user's email addresses.
   * Only the user themselves or admins can see this.
   */
  listEmails: defineAccess<User>((access) => {
    access.ensureContext('resource');
    access.allow('selfOrAdmin');
  }),

  /**
   * POST /user/emails
   * Add email addresses to the authenticated user.
   */
  addEmail: defineAccess((access) => {
    access.allow('authenticated');
  }),

  /**
   * GET /users/:username/keys
   * List a user's public SSH keys.
   * Only the user themselves or admins can see this.
   */
  listKeys: defineAccess<User>((access) => {
    access.ensureContext('resource');
    access.allow('selfOrAdmin');
  }),

  /**
   * POST /user/keys
   * Add an SSH key to the authenticated user.
   */
  addKey: defineAccess((access) => {
    access.allow('authenticated');
  }),

  /**
   * GET /user/orgs
   * List organizations for the authenticated user.
   */
  listOwnOrgs: defineAccess((access) => {
    access.allow('authenticated');
  }),

  /**
   * GET /users/:username/orgs
   * List a user's public organization memberships.
   */
  listUserOrgs: defineAccess<User>((access) => {
    access.ensureContext('resource');
    access.allow('everyone', () => true);
  }),

  /**
   * DELETE /user
   * Delete the authenticated user's account.
   */
  deleteAccount: defineAccess((access) => {
    access.allow('authenticated');
  }),
};
