import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from '../permissions/entities/permission.entity';

@Injectable()
export class PermissionSeedService {
  private readonly logger = new Logger(PermissionSeedService.name);

  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) {}

  async seedPermissions() {
    const permissions = [
      // Content Module
      {
        key: 'content:create',
        module: 'content',
        action: 'create',
        description: 'Create content',
      },
      {
        key: 'content:read',
        module: 'content',
        action: 'read',
        description: 'Read content',
      },
      {
        key: 'content:update',
        module: 'content',
        action: 'update',
        description: 'Update content',
      },
      {
        key: 'content:delete',
        module: 'content',
        action: 'delete',
        description: 'Delete content',
      },
      {
        key: 'content:*',
        module: 'content',
        action: 'manage',
        isWildcard: true,
        description: 'Manage all content',
      },

      // User Module
      {
        key: 'user:create',
        module: 'user',
        action: 'create',
        description: 'Create users',
      },
      {
        key: 'user:read',
        module: 'user',
        action: 'read',
        description: 'Read users',
      },
      {
        key: 'user:update',
        module: 'user',
        action: 'update',
        description: 'Update users',
      },
      {
        key: 'user:delete',
        module: 'user',
        action: 'delete',
        description: 'Delete users',
      },

      // Organization Module
      {
        key: 'org:create',
        module: 'org',
        action: 'create',
        description: 'Create organizations',
      },
      {
        key: 'org:read',
        module: 'org',
        action: 'read',
        description: 'Read organizations',
      },
      {
        key: 'org:update',
        module: 'org',
        action: 'update',
        description: 'Update organizations',
      },
      {
        key: 'org:delete',
        module: 'org',
        action: 'delete',
        description: 'Delete organizations',
      },
      {
        key: 'org:*',
        module: 'org',
        action: 'manage',
        isWildcard: true,
        description: 'Manage all organizations',
      },

      // Membership Module
      {
        key: 'membership:create',
        module: 'membership',
        action: 'create',
        description: 'Create memberships',
      },
      {
        key: 'membership:read',
        module: 'membership',
        action: 'read',
        description: 'Read memberships',
      },
      {
        key: 'membership:update',
        module: 'membership',
        action: 'update',
        description: 'Update memberships',
      },
      {
        key: 'membership:delete',
        module: 'membership',
        action: 'delete',
        description: 'Delete memberships',
      },

      // Plan Module
      {
        key: 'plan:create',
        module: 'plan',
        action: 'create',
        description: 'Create plans',
      },
      {
        key: 'plan:read',
        module: 'plan',
        action: 'read',
        description: 'Read plans',
      },
      {
        key: 'plan:update',
        module: 'plan',
        action: 'update',
        description: 'Update plans',
      },
      {
        key: 'plan:delete',
        module: 'plan',
        action: 'delete',
        description: 'Delete plans',
      },

      // Subscription Module
      {
        key: 'sub:create',
        module: 'sub',
        action: 'create',
        description: 'Create subscriptions',
      },
      {
        key: 'sub:read',
        module: 'sub',
        action: 'read',
        description: 'Read subscriptions',
      },
      {
        key: 'sub:update',
        module: 'sub',
        action: 'update',
        description: 'Update subscriptions',
      },
      {
        key: 'sub:delete',
        module: 'sub',
        action: 'delete',
        description: 'Delete subscriptions',
      },

      // RBAC Module
      {
        key: 'role:create',
        module: 'rbac',
        action: 'create',
        description: 'Create roles',
      },
      {
        key: 'role:read',
        module: 'rbac',
        action: 'read',
        description: 'Read roles',
      },
      {
        key: 'role:update',
        module: 'rbac',
        action: 'update',
        description: 'Update roles',
      },
      {
        key: 'role:delete',
        module: 'rbac',
        action: 'delete',
        description: 'Delete roles',
      },
      {
        key: 'rbac:manage',
        module: 'rbac',
        action: 'manage',
        description: 'Manage all RBAC',
      },
    ];

    for (const p of permissions) {
      const exists = await this.permissionRepository.findOneBy({ key: p.key });
      if (!exists) {
        await this.permissionRepository.save(
          this.permissionRepository.create(p),
        );
        this.logger.log(`Permission ${p.key} seeded`);
      }
    }
  }
}
