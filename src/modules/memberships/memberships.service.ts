import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Membership } from './entities/membership.entity';

@Injectable()
export class MembershipsService {
  constructor(
    @InjectRepository(Membership)
    private readonly membershipRepository: Repository<Membership>,
  ) {}

  async findAll(): Promise<Membership[]> {
    return await this.membershipRepository.find({
      relations: ['user', 'organization'],
    });
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
