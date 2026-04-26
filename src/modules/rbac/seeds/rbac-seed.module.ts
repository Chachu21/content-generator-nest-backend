import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Permission } from '../permissions/entities/permission.entity';
import { Role } from '../roles/entities/role.entity';
import { User } from '../../users/entities/user.entity';
import { Organization } from '../../organizations/entities/organization.entity';
import { Plan } from '../../plans/entities/plan.entity';
import { PermissionSeedService } from './permission-seed.service';
import { RoleSeedService } from './role-seed.service';
import { UserSeedService } from './user-seed.service';
import { OrganizationSeedService } from '../../organizations/seeds/organization-seed.service';
import { PlanSeedService } from '../../plans/seeds/plan-seed.service';
import { RbacSeedService } from './rbac-seed.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Permission, Role, User, Organization, Plan]),
  ],
  providers: [
    PermissionSeedService,
    RoleSeedService,
    UserSeedService,
    OrganizationSeedService,
    PlanSeedService,
    RbacSeedService,
  ],
  exports: [RbacSeedService],
})
export class RbacSeedModule {}
