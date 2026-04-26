import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Permission } from '../permissions/entities/permission.entity';
import { Role } from '../roles/entities/role.entity';
import { User } from '../../users/entities/user.entity';
import { PermissionSeedService } from './permission-seed.service';
import { RoleSeedService } from './role-seed.service';
import { UserSeedService } from './user-seed.service';
import { RbacSeedService } from './rbac-seed.service';

@Module({
  imports: [TypeOrmModule.forFeature([Permission, Role, User])],
  providers: [
    PermissionSeedService,
    RoleSeedService,
    UserSeedService,
    RbacSeedService,
  ],
  exports: [RbacSeedService],
})
export class RbacSeedModule {}
