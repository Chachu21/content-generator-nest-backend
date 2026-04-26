import { Injectable, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { PermissionSeedService } from './permission-seed.service';
import { RoleSeedService } from './role-seed.service';
import { UserSeedService } from './user-seed.service';

@Injectable()
export class RbacSeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(RbacSeedService.name);

  constructor(
    private readonly permissionSeedService: PermissionSeedService,
    private readonly roleSeedService: RoleSeedService,
    private readonly userSeedService: UserSeedService,
  ) {}

  async onApplicationBootstrap() {
    this.logger.log('Starting data seeding...');
    
    try {
      await this.permissionSeedService.seedPermissions();
      await this.roleSeedService.seedRoles();
      await this.userSeedService.seedUsers();
      
      this.logger.log('Data seeding completed successfully.');
    } catch (error) {
      this.logger.error('Data seeding failed', error);
    }
  }
}
