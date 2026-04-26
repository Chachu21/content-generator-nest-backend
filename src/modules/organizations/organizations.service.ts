import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organization } from './entities/organization.entity';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { PaginationQueryDto, SortOrder } from '../../common/dto/pagination-query.dto';
import { PaginatedResult, createPaginatedResponse } from '../../common/utils/pagination.util';

import { Plan } from '../plans/entities/plan.entity';
import { Subscription, SubscriptionStatus } from '../subscriptions/entities/subscription.entity';

@Injectable()
export class OrganizationsService {
  constructor(
    @InjectRepository(Organization)
    private readonly organizationRepository: Repository<Organization>,
    @InjectRepository(Plan)
    private readonly planRepository: Repository<Plan>,
    @InjectRepository(Subscription)
    private readonly subscriptionRepository: Repository<Subscription>,
  ) {}

  async create(createOrganizationDto: CreateOrganizationDto): Promise<Organization> {
    const organization = this.organizationRepository.create(createOrganizationDto);
    if (!organization.slug) {
      organization.slug = organization.name
        .toLowerCase()
        .replace(/ /g, '-')
        .replace(/[^\w-]+/g, '');
    }
    const savedOrg = await this.organizationRepository.save(organization);

    // Auto-subscribe to Trial plan
    const trialPlan = await this.planRepository.findOne({ where: { name: 'Trial' } });
    if (trialPlan) {
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(startDate.getDate() + 7); // 7-day trial

      const subscription = this.subscriptionRepository.create({
        organization: savedOrg,
        plan: trialPlan,
        startDate,
        endDate,
        status: SubscriptionStatus.ACTIVE,
      });
      await this.subscriptionRepository.save(subscription);
    }

    return savedOrg;
  }

  async findAll(query: PaginationQueryDto): Promise<PaginatedResult<Organization>> {
    const { page, limit, search, sortBy = 'createdAt', sortOrder = SortOrder.DESC } = query;

    const queryBuilder = this.organizationRepository.createQueryBuilder('organization')
      .leftJoinAndSelect('organization.memberships', 'memberships')
      .leftJoinAndSelect('organization.subscriptions', 'subscriptions');

    if (search) {
      queryBuilder.where('organization.name ILIKE :search OR organization.slug ILIKE :search', {
        search: `%${search}%`,
      });
    }

    queryBuilder.orderBy(`organization.${sortBy}`, sortOrder);

    if (page && limit) {
      const skip = (page - 1) * limit;
      queryBuilder.skip(skip).take(limit);
    }

    const [data, total] = await queryBuilder.getManyAndCount();

    return createPaginatedResponse(data, total, page || 1, limit || total);
  }

  async findOne(id: string): Promise<Organization> {
    const organization = await this.organizationRepository.findOne({
      where: { id },
      relations: ['memberships', 'subscriptions', 'contents'],
    });
    if (!organization) {
      throw new NotFoundException(`Organization with ID ${id} not found`);
    }
    return organization;
  }

  async findBySlug(slug: string): Promise<Organization> {
    const organization = await this.organizationRepository.findOne({
      where: { slug },
    });
    if (!organization) {
      throw new NotFoundException(`Organization with slug ${slug} not found`);
    }
    return organization;
  }

  async update(
    id: string,
    updateOrganizationDto: UpdateOrganizationDto,
  ): Promise<Organization> {
    const organization = await this.findOne(id);
    Object.assign(organization, updateOrganizationDto);
    return await this.organizationRepository.save(organization);
  }

  async remove(id: string): Promise<void> {
    const organization = await this.findOne(id);
    await this.organizationRepository.remove(organization);
  }
}
