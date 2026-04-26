import { Injectable, OnApplicationBootstrap, Logger } from '@nestjs/common';
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
      { key: 'content:create', module: 'content', action: 'create', description: 'Create content' },
      { key: 'content:read', module: 'content', action: 'read', description: 'Read content' },
      { key: 'content:update', module: 'content', action: 'update', description: 'Update content' },
      { key: 'content:delete', module: 'content', action: 'delete', description: 'Delete content' },
      { key: 'content:*', module: 'content', action: 'manage', isWildcard: true, description: 'Manage all content' },

      // User Module
      { key: 'user:create', module: 'user', action: 'create', description: 'Create users' },
      { key: 'user:read', module: 'user', action: 'read', description: 'Read users' },
      { key: 'user:update', module: 'user', action: 'update', description: 'Update users' },
      { key: 'user:delete', module: 'user', action: 'delete', description: 'Delete users' },

      // RBAC Module
      { key: 'role:create', module: 'rbac', action: 'create', description: 'Create roles' },
      { key: 'role:read', module: 'rbac', action: 'read', description: 'Read roles' },
      { key: 'role:update', module: 'rbac', action: 'update', description: 'Update roles' },
      { key: 'role:delete', module: 'rbac', action: 'delete', description: 'Delete roles' },
    ];

    for (const p of permissions) {
      const exists = await this.permissionRepository.findOneBy({ key: p.key });
      if (!exists) {
        await this.permissionRepository.save(this.permissionRepository.create(p));
        this.logger.log(`Seeded permission: ${p.key}`);
      }
    }
  }
}
