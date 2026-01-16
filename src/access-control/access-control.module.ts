import { Global, Module } from '@nestjs/common';
import { AccessControlService } from './access-control.service';
import { AccessGuard } from './access.guard';

/**
 * Module providing access control functionality.
 *
 * This is a global module, so AccessControlService and AccessGuard
 * are available throughout the application without explicit imports.
 */
@Global()
@Module({
  providers: [AccessControlService, AccessGuard],
  exports: [AccessControlService, AccessGuard],
})
export class AccessControlModule {}
