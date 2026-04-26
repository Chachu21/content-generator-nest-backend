import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Content } from './entities/content.entity';

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

  async findAll(): Promise<Content[]> {
    return await this.contentRepository.find({
      relations: ['organization', 'user'],
    });
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
