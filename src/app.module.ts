import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import databaseConfig from './core/config/database.config';
import authConfig from './core/config/auth.config';
import { DatabaseModule } from './core/config/database.module';
import { PermissionModule } from './modules/rbac/permissions/permission.module';
import { RoleModule } from './modules/rbac/roles/role.module';
import { RbacSeedModule } from './modules/rbac/seeds/rbac-seed.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { GlobalJwtAccessGuard } from './common/guards/global-jwt.guard';
import { PermissionsGuard } from './common/guards/permissions.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, authConfig],
    }),

    DatabaseModule,
    PermissionModule,
    RoleModule,
    UsersModule,
    AuthModule,
    RbacSeedModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
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
