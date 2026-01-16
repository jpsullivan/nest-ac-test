import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { AccessControlModule } from './access-control/access-control.module';
import { ReposModule } from './repos/repos.module';
import { OrgsModule } from './orgs/orgs.module';
import { UsersModule } from './users/users.module';
import { AuthMiddleware } from './auth/auth.middleware';

/**
 * Main application module.
 *
 * Sets up:
 * - Access control (globally available)
 * - Repository endpoints
 * - Organization endpoints
 * - User endpoints
 * - Authentication middleware
 */
@Module({
  imports: [AccessControlModule, ReposModule, OrgsModule, UsersModule],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply authentication middleware to all routes
    consumer.apply(AuthMiddleware).forRoutes('*');
  }
}
