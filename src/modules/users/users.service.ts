import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Role } from '../rbac/roles/entities/role.entity';
import * as bcrypt from 'bcrypt';
import { PaginationQueryDto, SortOrder } from '../../common/dto/pagination-query.dto';
import { PaginatedResult, createPaginatedResponse } from '../../common/utils/pagination.util';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const { roleIds, ...userData } = createUserDto;

    // Check if email already exists
    const existingUser = await this.userRepository.findOne({
      where: { email: userData.email },
    });
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, 10);
    }

    const user = this.userRepository.create(userData);

    if (roleIds && roleIds.length > 0) {
      const roles = await this.roleRepository.findBy({ id: In(roleIds) });
      user.roles = roles;
    }

    return this.userRepository.save(user);
  }

  async findByEmail(email: string, includePassword = false) {
    return this.userRepository.findOne({
      where: { email },
      select: includePassword ? ['id', 'email', 'password', 'firstName', 'lastName', 'isActive'] : undefined,
      relations: ['roles', 'roles.permissions'],
    });
  }

  async findOrCreateOAuthUser(profile: {
    email: string;
    firstName: string;
    lastName: string;
    googleId?: string;
    facebookId?: string;
    avatarUrl?: string;
  }) {
    let user = await this.userRepository.findOne({
      where: [
        { googleId: profile.googleId },
        { facebookId: profile.facebookId },
        { email: profile.email },
      ],
      relations: ['roles'],
    });

    if (!user) {
      // Assign default 'User' role
      const defaultRole = await this.roleRepository.findOneBy({ name: 'User' });
      user = this.userRepository.create({
        ...profile,
        isActive: true,
        roles: defaultRole ? [defaultRole] : [],
      });
      await this.userRepository.save(user);
    } else {
      // Update OAuth IDs if missing
      let changed = false;
      if (profile.googleId && !user.googleId) {
        user.googleId = profile.googleId;
        changed = true;
      }
      if (profile.facebookId && !user.facebookId) {
        user.facebookId = profile.facebookId;
        changed = true;
      }
      if (changed) {
        await this.userRepository.save(user);
      }
    }

    return user;
  }

  async findAll(query: PaginationQueryDto): Promise<PaginatedResult<User>> {
    const { page, limit, search, sortBy = 'createdAt', sortOrder = SortOrder.DESC } = query;

    const queryBuilder = this.userRepository.createQueryBuilder('user')
      .leftJoinAndSelect('user.roles', 'roles');

    if (search) {
      queryBuilder.where(
        'user.email ILIKE :search OR user.firstName ILIKE :search OR user.lastName ILIKE :search',
        { search: `%${search}%` },
      );
    }

    queryBuilder.orderBy(`user.${sortBy}`, sortOrder);

    if (page && limit) {
      const skip = (page - 1) * limit;
      queryBuilder.skip(skip).take(limit);
    }

    const [data, total] = await queryBuilder.getManyAndCount();

    return createPaginatedResponse(data, total, page || 1, limit || total);
  }

  async findOne(id: string) {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['roles', 'roles.permissions'],
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const { roleIds, ...userData } = updateUserDto;
    const user = await this.findOne(id);

    if (roleIds) {
      const roles = await this.roleRepository.findBy({ id: In(roleIds) });
      user.roles = roles;
    }

    Object.assign(user, userData);
    return this.userRepository.save(user);
  }

  async remove(id: string) {
    const user = await this.findOne(id);
    return this.userRepository.remove(user);
  }
}
