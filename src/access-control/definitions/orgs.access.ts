/**
 * Access definitions for organization endpoints.
 *
 * Organizations have different access patterns than repositories:
 * - Membership-based access (member, admin, owner)
 * - Team-based permissions
 * - Billing-specific access
 */

import { defineAccess } from '../define-access';
import { Organization } from '../../entities/organization.entity';

export const orgAccess = {
  /**
   * GET /orgs/:org
   * View organization profile.
   * Public orgs are viewable by anyone.
   */
  getOrg: defineAccess<Organization>((access) => {
    access.ensureContext('resource');
    // All orgs are publicly viewable (basic info)
    access.allow('everyone', () => true);
  }),

  /**
   * PATCH /orgs/:org
   * Update organization settings.
   */
  updateOrg: defineAccess<Organization>((access) => {
    access.ensureContext('resource');
    access.allow('orgAdmin');
  }),

  /**
   * GET /orgs/:org/members
   * List organization members.
   * Only members can see the full member list.
   */
  listMembers: defineAccess<Organization>((access) => {
    access.ensureContext('resource');
    access.allow('orgMember');
  }),

  /**
   * PUT /orgs/:org/memberships/:username
   * Add or update organization membership.
   */
  updateMembership: defineAccess<Organization>((access) => {
    access.ensureContext('resource');
    access.allow('orgAdmin');
  }),

  /**
   * DELETE /orgs/:org/memberships/:username
   * Remove a member from the organization.
   */
  removeMember: defineAccess<Organization>((access) => {
    access.ensureContext('resource');
    access.allow('orgAdmin');
  }),

  /**
   * GET /orgs/:org/teams
   * List organization teams.
   */
  listTeams: defineAccess<Organization>((access) => {
    access.ensureContext('resource');
    access.allow('orgMember');
  }),

  /**
   * POST /orgs/:org/teams
   * Create a new team.
   */
  createTeam: defineAccess<Organization>((access) => {
    access.ensureContext('resource');
    access.allow('orgTeamManager');
  }),

  /**
   * GET /orgs/:org/billing
   * View billing information.
   */
  getBilling: defineAccess<Organization>((access) => {
    access.ensureContext('resource');
    access.allow('orgBillingManager');
  }),

  /**
   * PATCH /orgs/:org/billing
   * Update billing settings.
   */
  updateBilling: defineAccess<Organization>((access) => {
    access.ensureContext('resource');
    access.allow('orgOwner');
  }),

  /**
   * POST /orgs/:org/repos
   * Create a repository in the organization.
   */
  createRepo: defineAccess<Organization>((access) => {
    access.ensureContext('resource');
    access.allow('orgRepoCreator');
  }),

  /**
   * GET /orgs/:org/hooks
   * List organization webhooks.
   */
  listHooks: defineAccess<Organization>((access) => {
    access.ensureContext('resource');
    access.allow('orgAdmin');
  }),

  /**
   * POST /orgs/:org/hooks
   * Create an organization webhook.
   */
  createHook: defineAccess<Organization>((access) => {
    access.ensureContext('resource');
    access.allow('orgAdmin');
  }),

  /**
   * DELETE /orgs/:org
   * Delete the organization.
   */
  deleteOrg: defineAccess<Organization>((access) => {
    access.ensureContext('resource');
    access.allow('orgOwner');
  }),
};
