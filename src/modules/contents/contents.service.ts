import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Content } from './entities/content.entity';
import { PaginationQueryDto, SortOrder } from '../../common/dto/pagination-query.dto';
import { PaginatedResult, createPaginatedResponse } from '../../common/utils/pagination.util';

@Injectable()
export class ContentsService {
  constructor(
    @InjectRepository(Content)
    private readonly contentRepository: Repository<Content>,
  ) {}

  async create(createContentDto: any): Promise<Content> {
    const content = this.contentRepository.create(createContentDto as object);
    return (await this.contentRepository.save(content)) as Content;
  }

  async findAll(query: PaginationQueryDto): Promise<PaginatedResult<Content>> {
    const { page, limit, search, sortBy = 'createdAt', sortOrder = SortOrder.DESC } = query;

    const queryBuilder = this.contentRepository.createQueryBuilder('content')
      .leftJoinAndSelect('content.organization', 'organization')
      .leftJoinAndSelect('content.user', 'user');

    if (search) {
      queryBuilder.where(
        'content.title ILIKE :search OR content.body ILIKE :search OR content.language ILIKE :search',
        { search: `%${search}%` },
      );
    }

    queryBuilder.orderBy(`content.${sortBy}`, sortOrder);

    if (page && limit) {
      const skip = (page - 1) * limit;
      queryBuilder.skip(skip).take(limit);
    }

    const [data, total] = await queryBuilder.getManyAndCount();

    return createPaginatedResponse(data, total, page || 1, limit || total);
  }

  async findOne(id: string): Promise<Content> {
    const content = await this.contentRepository.findOne({
      where: { id },
      relations: ['organization', 'user'],
    });
    if (!content) {
      throw new NotFoundException(`Content with ID ${id} not found`);
    }
    return content;
  }
}
