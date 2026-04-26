import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import databaseConfig from './core/config/database.config';
import authConfig from './core/config/auth.config';
import aiConfig from './core/config/ai.config';
import { DatabaseModule } from './core/config/database.module';
import { PermissionModule } from './modules/rbac/permissions/permission.module';
import { RoleModule } from './modules/rbac/roles/role.module';
import { RbacSeedModule } from './modules/rbac/seeds/rbac-seed.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { GlobalJwtAccessGuard } from './common/guards/global-jwt.guard';
import { PermissionsGuard } from './common/guards/permissions.guard';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { APP_GUARD, APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';
import { MembershipsModule } from './modules/memberships/memberships.module';
import { PlansModule } from './modules/plans/plans.module';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';
import { ContentsModule } from './modules/contents/contents.module';
import { AiModule } from './modules/ai/ai.module';
import { OrganizationsModule } from './modules/organizations/organizations.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, authConfig, aiConfig],
    }),

    DatabaseModule,
    PermissionModule,
    RoleModule,
    UsersModule,
    AuthModule,
    RbacSeedModule,
    MembershipsModule,
    PlansModule,
    SubscriptionsModule,
    ContentsModule,
    AiModule,
    OrganizationsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // ─── Global interceptors & filters ────────────────────────────────────────
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    // ─── Global guards (applied in order) ─────────────────────────────────────
    // 1. JWT: authenticate every request; skip @Public() routes
    {
      provide: APP_GUARD,
      useClass: GlobalJwtAccessGuard,
    },
    // 2. Permissions: check @RequirePermissions() after JWT is verified
    {
      provide: APP_GUARD,
      useClass: PermissionsGuard,
    },
  ],
})
export class AppModule {}
