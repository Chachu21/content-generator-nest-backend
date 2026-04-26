import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Plan } from '../entities/plan.entity';

@Injectable()
export class PlanSeedService {
  private readonly logger = new Logger(PlanSeedService.name);

  constructor(
    @InjectRepository(Plan)
    private readonly planRepository: Repository<Plan>,
  ) {}

  async seedPlans() {
    const plans = [
      {
        name: 'Trial',
        price: 0,
        currency: 'USD',
        interval: 'MONTHLY',
        description: '7-day free trial with 2 requests per day',
        features: { posts_per_day: 2, seo: false, analytics: false, trial: true },
      },
      {
        name: 'Freemium',
        price: 0,
        currency: 'USD',
        interval: 'MONTHLY',
        description: '5 free posts/month to attract users',
        features: { posts: 5, seo: false, analytics: false },
      },
      {
        name: 'Basic',
        price: 3,
        currency: 'USD',
        interval: 'MONTHLY',
        description: 'Basic content generation',
        features: { posts: 20, seo: false, analytics: false },
      },
      {
        name: 'Pro',
        price: 10,
        currency: 'USD',
        interval: 'MONTHLY',
        description: 'SEO + scheduling',
        features: { posts: 100, seo: true, scheduling: true, analytics: false },
      },
      {
        name: 'Full Suite',
        price: 15,
        currency: 'USD',
        interval: 'MONTHLY',
        description: 'Full suite with analytics',
        features: { posts: -1, seo: true, scheduling: true, analytics: true },
      },
    ];

    for (const planData of plans) {
      const existingPlan = await this.planRepository.findOne({
        where: { name: planData.name },
      });
      if (!existingPlan) {
        await this.planRepository.save(this.planRepository.create(planData));
        this.logger.log(`Plan ${planData.name} seeded`);
      }
    }
  }
}
