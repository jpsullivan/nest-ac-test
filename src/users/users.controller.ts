import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { Access, LoadResource, AccessGuard } from '../access-control';
import { userAccess } from '../access-control/definitions/users.access';
import { UsersService } from './users.service';

/**
 * User endpoints demonstrating self-access patterns.
 *
 * Key patterns:
 * - Public profiles viewable by anyone
 * - Sensitive data (emails, keys) only viewable by self or admin
 * - /user endpoints for authenticated user's own resources
 * - /users/:username endpoints for viewing other users
 */
@Controller()
@UseGuards(AccessGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // ==================== Authenticated User Endpoints ====================

  /**
   * GET /user
   * Get the authenticated user's profile.
   */
  @Get('user')
  @Access(userAccess.getCurrentUser)
  async getCurrentUser(@Req() req: Request) {
    const user = req.user;
    if (!user) return null;

    const profile = await this.usersService.findById(user.id);
    return {
      ...profile,
      // Include private data for self
      private_repos: profile?.privateRepos,
    };
  }

  /**
   * GET /user/repos
   * List authenticated user's repos (including private).
   */
  @Get('user/repos')
  @Access(userAccess.listOwnRepos)
  async listOwnRepos(@Req() req: Request) {
    const user = req.user;
    if (!user) return [];
    return this.usersService.getRepos(user.login);
  }

  /**
   * GET /user/orgs
   * List authenticated user's organizations.
   */
  @Get('user/orgs')
  @Access(userAccess.listOwnOrgs)
  async listOwnOrgs(@Req() req: Request) {
    const user = req.user;
    if (!user) return [];
    return this.usersService.getOrgs(user.login);
  }

  /**
   * POST /user/emails
   * Add email to authenticated user.
   */
  @Post('user/emails')
  @Access(userAccess.addEmail)
  async addEmail(@Req() req: Request, @Body() body: { emails: string[] }) {
    return body.emails.map((email) => ({
      email,
      primary: false,
      verified: false,
    }));
  }

  /**
   * POST /user/keys
   * Add SSH key to authenticated user.
   */
  @Post('user/keys')
  @Access(userAccess.addKey)
  async addKey(@Req() req: Request, @Body() body: { key: string; title: string }) {
    return {
      id: Math.floor(Math.random() * 1000),
      key: body.key,
      title: body.title,
    };
  }

  // ==================== Other User Endpoints ====================

  /**
   * GET /users/:username
   * Get a user's public profile.
   */
  @Get('users/:username')
  @Access(userAccess.getUser)
  @LoadResource((params) => new UsersService().findUserEntityByLogin(params.username))
  async getUser(@Param('username') username: string) {
    const profile = await this.usersService.findByLogin(username);
    return {
      login: profile?.login,
      id: profile?.id,
      name: profile?.name,
      public_repos: profile?.publicRepos,
      // Don't include private data
    };
  }

  /**
   * GET /users/:username/repos
   * List a user's public repositories.
   */
  @Get('users/:username/repos')
  @Access(userAccess.listUserRepos)
  @LoadResource((params) => new UsersService().findUserEntityByLogin(params.username))
  async listUserRepos(@Param('username') username: string) {
    const repos = await this.usersService.getRepos(username);
    // Filter to public only for other users
    return repos.filter((r) => !r.private);
  }

  /**
   * GET /users/:username/orgs
   * List a user's public organization memberships.
   */
  @Get('users/:username/orgs')
  @Access(userAccess.listUserOrgs)
  @LoadResource((params) => new UsersService().findUserEntityByLogin(params.username))
  async listUserOrgs(@Param('username') username: string) {
    return this.usersService.getOrgs(username);
  }

  /**
   * GET /users/:username/emails
   * List a user's emails (self or admin only).
   */
  @Get('users/:username/emails')
  @Access(userAccess.listEmails)
  @LoadResource((params) => new UsersService().findUserEntityByLogin(params.username))
  async listEmails(@Param('username') username: string) {
    return this.usersService.getEmails(username);
  }

  /**
   * GET /users/:username/keys
   * List a user's SSH keys (self or admin only).
   */
  @Get('users/:username/keys')
  @Access(userAccess.listKeys)
  @LoadResource((params) => new UsersService().findUserEntityByLogin(params.username))
  async listKeys(@Param('username') username: string) {
    return this.usersService.getKeys(username);
  }
}
