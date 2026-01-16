import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { Access, LoadResource, AccessGuard } from '../access-control';
import { orgAccess } from '../access-control/definitions/orgs.access';
import { OrgsService } from './orgs.service';
import { Organization } from '../entities/organization.entity';

/**
 * Organization endpoints demonstrating membership-based access control.
 *
 * Organizations have different access patterns than repositories:
 * - Public profile info is visible to everyone
 * - Member list requires org membership
 * - Admin actions require owner/admin role
 * - Billing requires billing_manager or owner role
 */
@Controller('orgs/:org')
@UseGuards(AccessGuard)
export class OrgsController {
  constructor(private readonly orgsService: OrgsService) {}

  /**
   * GET /orgs/:org
   * Get organization profile (public).
   */
  @Get()
  @Access(orgAccess.getOrg)
  @LoadResource((params) => new OrgsService().findByLogin(params.org))
  async getOrg(@Param('org') orgLogin: string) {
    const org = await this.orgsService.findByLogin(orgLogin);
    return {
      id: org?.id,
      login: org?.login,
      name: org?.displayName,
    };
  }

  /**
   * GET /orgs/:org/members
   * List organization members (requires membership).
   */
  @Get('members')
  @Access(orgAccess.listMembers)
  @LoadResource((params) => new OrgsService().findByLogin(params.org))
  async listMembers(@Param('org') orgLogin: string) {
    return this.orgsService.getMembers(orgLogin);
  }

  /**
   * PUT /orgs/:org/memberships/:username
   * Add or update membership (requires admin).
   */
  @Patch('memberships/:username')
  @Access(orgAccess.updateMembership)
  @LoadResource((params) => new OrgsService().findByLogin(params.org))
  async updateMembership(
    @Param('org') orgLogin: string,
    @Param('username') username: string,
    @Body() body: { role: string }
  ) {
    return {
      organization: orgLogin,
      user: username,
      role: body.role,
      state: 'active',
    };
  }

  /**
   * DELETE /orgs/:org/memberships/:username
   * Remove a member (requires admin).
   */
  @Delete('memberships/:username')
  @Access(orgAccess.removeMember)
  @LoadResource((params) => new OrgsService().findByLogin(params.org))
  async removeMember(
    @Param('org') orgLogin: string,
    @Param('username') username: string
  ) {
    return { message: `Removed ${username} from ${orgLogin}` };
  }

  /**
   * GET /orgs/:org/teams
   * List teams (requires membership).
   */
  @Get('teams')
  @Access(orgAccess.listTeams)
  @LoadResource((params) => new OrgsService().findByLogin(params.org))
  async listTeams(@Param('org') orgLogin: string) {
    return this.orgsService.getTeams(orgLogin);
  }

  /**
   * POST /orgs/:org/teams
   * Create a team (requires team management permission).
   */
  @Post('teams')
  @Access(orgAccess.createTeam)
  @LoadResource((params) => new OrgsService().findByLogin(params.org))
  async createTeam(
    @Param('org') orgLogin: string,
    @Body() body: { name: string; description?: string }
  ) {
    return {
      id: Math.floor(Math.random() * 1000),
      name: body.name,
      description: body.description,
      organization: orgLogin,
    };
  }

  /**
   * GET /orgs/:org/billing
   * Get billing info (requires billing manager or owner).
   */
  @Get('billing')
  @Access(orgAccess.getBilling)
  @LoadResource((params) => new OrgsService().findByLogin(params.org))
  async getBilling(@Param('org') orgLogin: string) {
    return this.orgsService.getBilling(orgLogin);
  }

  /**
   * POST /orgs/:org/repos
   * Create a repository in the org (requires repo creation permission).
   */
  @Post('repos')
  @Access(orgAccess.createRepo)
  @LoadResource((params) => new OrgsService().findByLogin(params.org))
  async createRepo(
    @Param('org') orgLogin: string,
    @Body() body: { name: string; private?: boolean }
  ) {
    return {
      id: Math.floor(Math.random() * 1000),
      name: body.name,
      full_name: `${orgLogin}/${body.name}`,
      private: body.private ?? false,
      owner: { login: orgLogin },
    };
  }
}
