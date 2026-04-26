import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Role } from './entities/role.entity';
import { Permission } from '../permissions/entities/permission.entity';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) {}

  async create(createRoleDto: CreateRoleDto) {
    const { permissionIds, ...roleData } = createRoleDto;
    const role = this.roleRepository.create(roleData);

    if (permissionIds && permissionIds.length > 0) {
      role.permissions = await this.permissionRepository.findBy({
        id: In(permissionIds),
      });
    }

    return this.roleRepository.save(role);
  }

  findAll() {
    return this.roleRepository.find({ relations: ['permissions'] });
  }

  findOne(id: string) {
    return this.roleRepository.findOne({
      where: { id },
      relations: ['permissions'],
    });
  }

  async update(id: string, updateRoleDto: UpdateRoleDto) {
    const { permissionIds, ...roleData } = updateRoleDto;
    const role = await this.roleRepository.preload({
      id,
      ...roleData,
    });

    if (!role) {
      return null;
    }

    if (permissionIds) {
      role.permissions = await this.permissionRepository.findBy({
        id: In(permissionIds),
      });
    }

    return this.roleRepository.save(role);
  }

  remove(id: string) {
    return this.roleRepository.delete(id);
  }
}
