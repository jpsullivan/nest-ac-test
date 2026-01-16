import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AccessControlService } from '../access-control';

@Module({
  controllers: [UsersController],
  providers: [UsersService, AccessControlService],
  exports: [UsersService],
})
export class UsersModule {}
