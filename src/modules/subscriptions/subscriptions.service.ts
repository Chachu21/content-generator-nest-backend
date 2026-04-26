import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subscription } from './entities/subscription.entity';
import { PaginationQueryDto, SortOrder } from '../../common/dto/pagination-query.dto';
import { PaginatedResult, createPaginatedResponse } from '../../common/utils/pagination.util';

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectRepository(Subscription)
    private readonly subscriptionRepository: Repository<Subscription>,
  ) {}

  async findAll(query: PaginationQueryDto): Promise<PaginatedResult<Subscription>> {
    const { page, limit, search, sortBy = 'createdAt', sortOrder = SortOrder.DESC } = query;

    const queryBuilder = this.subscriptionRepository.createQueryBuilder('subscription')
      .leftJoinAndSelect('subscription.organization', 'organization')
      .leftJoinAndSelect('subscription.plan', 'plan');

    if (search) {
      queryBuilder.where('organization.name ILIKE :search OR plan.name ILIKE :search', {
        search: `%${search}%`,
      });
    }

    queryBuilder.orderBy(`subscription.${sortBy}`, sortOrder);

    if (page && limit) {
      const skip = (page - 1) * limit;
      queryBuilder.skip(skip).take(limit);
    }

    const [data, total] = await queryBuilder.getManyAndCount();

    return createPaginatedResponse(data, total, page || 1, limit || total);
  }

  async findOne(id: string): Promise<Subscription> {
    const subscription = await this.subscriptionRepository.findOne({
      where: { id },
      relations: ['organization', 'plan'],
    });
    if (!subscription) {
      throw new NotFoundException(`Subscription with ID ${id} not found`);
    }
    return subscription;
  }
}
