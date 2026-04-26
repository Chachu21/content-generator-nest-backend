import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { Permission } from './entities/permission.entity';

@Injectable()
export class PermissionService {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) {}

  create(createPermissionDto: CreatePermissionDto) {
    const permission = this.permissionRepository.create(createPermissionDto);
    return this.permissionRepository.save(permission);
  }

  async findAll() {
    const permissions = await this.permissionRepository.find();
    return permissions.reduce(
      (acc, permission) => {
        const { module, ...details } = permission;
        if (!acc[module]) {
          acc[module] = [];
        }
        acc[module].push(details);
        return acc;
      },
      {} as Record<string, Omit<Permission, 'module'>[]>,
    );
  }

  findOne(id: string) {
    return this.permissionRepository.findOneBy({ id });
  }

  async update(id: string, updatePermissionDto: UpdatePermissionDto) {
    await this.permissionRepository.update(id, updatePermissionDto);
    return this.findOne(id);
  }

  remove(id: string) {
    return this.permissionRepository.delete(id);
  }
}
