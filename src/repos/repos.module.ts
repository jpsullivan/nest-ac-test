import { Module } from '@nestjs/common';
import { ReposController } from './repos.controller';
import { ReposService } from './repos.service';
import { AccessControlService } from '../access-control';

@Module({
  controllers: [ReposController],
  providers: [ReposService, AccessControlService],
  exports: [ReposService],
})
export class ReposModule {}
