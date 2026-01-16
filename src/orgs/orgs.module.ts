import { Module } from '@nestjs/common';
import { OrgsController } from './orgs.controller';
import { OrgsService } from './orgs.service';
import { AccessControlService } from '../access-control';

@Module({
  controllers: [OrgsController],
  providers: [OrgsService, AccessControlService],
  exports: [OrgsService],
})
export class OrgsModule {}
