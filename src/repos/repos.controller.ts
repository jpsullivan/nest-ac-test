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
import { repoAccess } from '../access-control/definitions';
import { ReposService } from './repos.service';
import { Repository } from '../entities/repository.entity';

/**
 * Example controller demonstrating GitHub-style access control.
 *
 * Each endpoint uses:
 * - @Access() - Specifies who can access this endpoint
 * - @LoadResource() - Loads the resource for access checking
 *
 * The AccessGuard automatically:
 * 1. Loads the resource
 * 2. Checks if the user has access
 * 3. Returns 404 for private resources (to avoid leaking existence)
 * 4. Attaches the resource to the request for controller use
 */
@Controller('repos/:owner/:repo')
@UseGuards(AccessGuard)
export class ReposController {
  constructor(private readonly reposService: ReposService) {}

  /**
   * GET /repos/:owner/:repo
   * Get repository metadata.
   */
  @Get()
  @Access(repoAccess.getRepo)
  @LoadResource((params) =>
    // In real code, inject ReposService and use it here
    new ReposService().findByOwnerAndName(params.owner, params.repo)
  )
  async getRepo(@Req() req: Request) {
    const repo = req.resource as Repository;
    return {
      id: repo.id,
      owner: repo.owner,
      name: repo.name,
      full_name: `${repo.owner}/${repo.name}`,
      private: !repo.isPublic,
    };
  }

  /**
   * GET /repos/:owner/:repo/contents/*
   * Get file or directory contents.
   */
  @Get('contents/*')
  @Access(repoAccess.getContents)
  @LoadResource((params) =>
    new ReposService().findByOwnerAndName(params.owner, params.repo)
  )
  async getContents(
    @Param('owner') owner: string,
    @Param('repo') repo: string,
    @Param('0') path: string
  ) {
    return this.reposService.getContents(owner, repo, path || '');
  }

  /**
   * GET /repos/:owner/:repo/issues
   * List issues on a repository.
   */
  @Get('issues')
  @Access(repoAccess.listIssues)
  @LoadResource((params) =>
    new ReposService().findByOwnerAndName(params.owner, params.repo)
  )
  async listIssues(
    @Param('owner') owner: string,
    @Param('repo') repo: string
  ) {
    return this.reposService.listIssues(owner, repo);
  }

  /**
   * POST /repos/:owner/:repo/issues
   * Create a new issue.
   */
  @Post('issues')
  @Access(repoAccess.createIssue)
  @LoadResource((params) =>
    new ReposService().findByOwnerAndName(params.owner, params.repo)
  )
  async createIssue(
    @Param('owner') owner: string,
    @Param('repo') repo: string,
    @Body() body: { title: string; body?: string }
  ) {
    return this.reposService.createIssue(owner, repo, body);
  }

  /**
   * DELETE /repos/:owner/:repo
   * Delete a repository.
   */
  @Delete()
  @Access(repoAccess.deleteRepo)
  @LoadResource((params) =>
    new ReposService().findByOwnerAndName(params.owner, params.repo)
  )
  async deleteRepo(
    @Param('owner') owner: string,
    @Param('repo') repo: string
  ) {
    await this.reposService.delete(owner, repo);
    return { message: 'Repository deleted' };
  }
}
