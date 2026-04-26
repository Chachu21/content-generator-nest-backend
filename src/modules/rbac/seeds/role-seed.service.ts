import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../roles/entities/role.entity';
import { Permission } from '../permissions/entities/permission.entity';

@Injectable()
export class RoleSeedService {
  private readonly logger = new Logger(RoleSeedService.name);

  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) {}

  async seedRoles() {
    const allPermissions = await this.permissionRepository.find();
    
    const roles = [
      {
        name: 'Super Admin',
        description: 'Has all permissions',
        permissionKeys: ['*'], // Logic to assign all
      },
      {
        name: 'Admin',
        description: 'Administrative access',
        permissionKeys: [
          'user:read',
          'user:update',
          'content:read',
          'content:update',
          'role:read',
          'org:read',
          'org:update',
          'plan:read',
          'sub:read',
        ],
      },
      {
        name: 'Editor',
        description: 'Can manage content',
        permissionKeys: ['content:create', 'content:read', 'content:update'],
      },
      {
        name: 'User',
        description: 'Regular user',
        permissionKeys: ['content:read'],
      },
    ];

    for (const r of roles) {
      let role = await this.roleRepository.findOne({ 
        where: { name: r.name },
        relations: ['permissions'] 
      });

      if (!role) {
        role = this.roleRepository.create({
          name: r.name,
          description: r.description,
        });
        this.logger.log(`Created role: ${r.name}`);
      }

      // Assign permissions
      let rolePermissions: Permission[] = [];
      if (r.permissionKeys.includes('*')) {
        rolePermissions = allPermissions;
      } else {
        rolePermissions = allPermissions.filter(p => r.permissionKeys.includes(p.key));
      }

      role.permissions = rolePermissions;
      await this.roleRepository.save(role);
      this.logger.log(`Updated permissions for role: ${r.name}`);
    }
  }
}
