import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { Plan } from '../plans/entities/plan.entity';
import { Subscription } from '../subscriptions/entities/subscription.entity';
import { Organization } from '../organizations/entities/organization.entity';
import { PaymentHistory } from './entities/payment-history.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Plan, Subscription, Organization, PaymentHistory])],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
