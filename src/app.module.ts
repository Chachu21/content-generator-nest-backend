import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import databaseConfig from './core/config/database.config';
import { DatabaseModule } from './core/config/database.module';
import { PermissionModule } from './modules/rbac/permissions/permission.module';
import { RoleModule } from './modules/rbac/roles/role.module';
import { RbacSeedModule } from './modules/rbac/seeds/rbac-seed.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig],
    }),

    DatabaseModule,
    PermissionModule,
    RoleModule,
    RbacSeedModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
