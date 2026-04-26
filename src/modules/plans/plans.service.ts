import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Plan } from './entities/plan.entity';

@Injectable()
export class PlansService {
  constructor(
    @InjectRepository(Plan)
    private readonly planRepository: Repository<Plan>,
  ) {}

  async findAll(): Promise<Plan[]> {
    return await this.planRepository.find({
      where: { isActive: true },
    });
  }

  async findOne(id: string): Promise<Plan> {
    const plan = await this.planRepository.findOne({
      where: { id },
    });
    if (!plan) {
      throw new NotFoundException(`Plan with ID ${id} not found`);
    }
    return plan;
  }
}
