import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Membership } from './entities/membership.entity';
import { PaginationQueryDto, SortOrder } from '../../common/dto/pagination-query.dto';
import { PaginatedResult, createPaginatedResponse } from '../../common/utils/pagination.util';

@Injectable()
export class MembershipsService {
  constructor(
    @InjectRepository(Membership)
    private readonly membershipRepository: Repository<Membership>,
  ) {}

  async findAll(query: PaginationQueryDto): Promise<PaginatedResult<Membership>> {
    const { page, limit, search, sortBy = 'createdAt', sortOrder = SortOrder.DESC } = query;

    const queryBuilder = this.membershipRepository.createQueryBuilder('membership')
      .leftJoinAndSelect('membership.user', 'user')
      .leftJoinAndSelect('membership.organization', 'organization');

    if (search) {
      queryBuilder.where('user.email ILIKE :search OR organization.name ILIKE :search', {
        search: `%${search}%`,
      });
    }

    queryBuilder.orderBy(`membership.${sortBy}`, sortOrder);

    if (page && limit) {
      const skip = (page - 1) * limit;
      queryBuilder.skip(skip).take(limit);
    }

    const [data, total] = await queryBuilder.getManyAndCount();

    return createPaginatedResponse(data, total, page || 1, limit || total);
  }

  async findOne(id: string): Promise<Membership> {
    const membership = await this.membershipRepository.findOne({
      where: { id },
      relations: ['user', 'organization'],
    });
    if (!membership) {
      throw new NotFoundException(`Membership with ID ${id} not found`);
    }
    return membership;
  }
}
