import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import axios from 'axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Plan } from '../plans/entities/plan.entity';
import { Subscription, SubscriptionStatus } from '../subscriptions/entities/subscription.entity';
import { Organization } from '../organizations/entities/organization.entity';

import { PaymentHistory, PaymentMethod, PaymentStatus } from './entities/payment-history.entity';
import { PaginationQueryDto, SortOrder } from '../../common/dto/pagination-query.dto';
import { PaginatedResult, createPaginatedResponse } from '../../common/utils/pagination.util';

@Injectable()
export class PaymentsService {
  private stripe: any;
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(Plan)
    private readonly planRepository: Repository<Plan>,
    @InjectRepository(Organization)
    private readonly organizationRepository: Repository<Organization>,
    @InjectRepository(Subscription)
    private readonly subscriptionRepository: Repository<Subscription>,
    @InjectRepository(PaymentHistory)
    private readonly paymentHistoryRepository: Repository<PaymentHistory>,
  ) {
    const stripeKey = this.configService.get<string>('payment.stripe.secretKey') || '';
    this.stripe = new Stripe(stripeKey, {
      apiVersion: '2025-01-27' as any,
    });
  }

  // ─── Stripe ──────────────────────────────────────────────────────────────────

  async createStripeSession(planId: string, organizationId: string, successUrl: string, cancelUrl: string) {
    const plan = await this.planRepository.findOneBy({ id: planId });
    const org = await this.organizationRepository.findOneBy({ id: organizationId });

    if (!plan || !org) {
      throw new BadRequestException('Invalid plan or organization');
    }

    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: plan.currency.toLowerCase(),
            product_data: {
              name: `${plan.name} Plan - ${org.name}`,
              description: plan.description,
            },
            unit_amount: Math.round(plan.price * 100), // Stripe uses cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        planId,
        organizationId,
      },
    });

    return { url: session.url };
  }

  // ─── Chapa (Local Ethiopia) ──────────────────────────────────────────────────

  async initializeChapaPayment(planId: string, organizationId: string, callbackUrl: string) {
    const plan = await this.planRepository.findOneBy({ id: planId });
    const org = await this.organizationRepository.findOneBy({ id: organizationId });

    if (!plan || !org) {
      throw new BadRequestException('Invalid plan or organization');
    }

    const tx_ref = `tx-${Date.now()}-${organizationId}`;
    const chapaSecret = this.configService.get('payment.chapa.secretKey');
    const chapaUrl = this.configService.get('payment.chapa.apiUrl');

    try {
      const response = await axios.post(
        `${chapaUrl}/transaction/initialize`,
        {
          amount: plan.price,
          currency: 'ETB', // Chapa usually uses ETB
          email: 'customer@example.com', // Should get from org/user
          first_name: org.name,
          tx_ref,
          callback_url: callbackUrl,
          customization: {
            title: `${plan.name} Plan`,
            description: plan.description,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${chapaSecret}`,
          },
        },
      );

      return response.data;
    } catch (error) {
      this.logger.error('Chapa Initialization Error', error.response?.data || error.message);
      throw new BadRequestException('Failed to initialize local payment');
    }
  }

  // ─── Webhook Logic ───────────────────────────────────────────────────────────

  async handleSuccessfulPayment(
    planId: string,
    organizationId: string,
    amount: number,
    currency: string,
    method: PaymentMethod,
    transactionReference: string,
    metadata?: any,
  ) {
    const plan = await this.planRepository.findOneBy({ id: planId });
    const org = await this.organizationRepository.findOneBy({ id: organizationId });

    if (!plan || !org) return;

    // 1. Create Payment History
    const history = this.paymentHistoryRepository.create({
      organization: org,
      amount,
      currency,
      method,
      status: PaymentStatus.SUCCESS,
      transactionReference,
      metadata,
    });
    await this.paymentHistoryRepository.save(history);

    // 2. Deactivate old subscriptions
    await this.subscriptionRepository.update(
      { organization: { id: organizationId }, status: SubscriptionStatus.ACTIVE },
      { status: SubscriptionStatus.CANCELED },
    );

    // 3. Create new subscription
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(startDate.getMonth() + 1); // Monthly for now

    const subscription = this.subscriptionRepository.create({
      organization: org,
      plan,
      startDate,
      endDate,
      status: SubscriptionStatus.ACTIVE,
    });

    await this.subscriptionRepository.save(subscription);
    this.logger.log(`Payment recorded and Subscription activated for ${org.name} on ${plan.name} plan`);
  }

  async findHistory(organizationId: string, query: PaginationQueryDto): Promise<PaginatedResult<PaymentHistory>> {
    const { page, limit, search, sortBy = 'createdAt', sortOrder = SortOrder.DESC } = query;

    const queryBuilder = this.paymentHistoryRepository.createQueryBuilder('history')
      .where('history.organizationId = :organizationId', { organizationId });

    if (search) {
      queryBuilder.andWhere(
        'history.transactionReference ILIKE :search OR history.currency ILIKE :search',
        { search: `%${search}%` },
      );
    }

    queryBuilder.orderBy(`history.${sortBy}`, sortOrder);

    if (page && limit) {
      const skip = (page - 1) * limit;
      queryBuilder.skip(skip).take(limit);
    }

    const [data, total] = await queryBuilder.getManyAndCount();

    return createPaginatedResponse(data, total, page || 1, limit || total);
  }

  async verifyChapaPayment(tx_ref: string): Promise<any> {
    const chapaSecret = this.configService.get('payment.chapa.secretKey');
    const chapaUrl = this.configService.get('payment.chapa.apiUrl');

    try {
      const response = await axios.get(`${chapaUrl}/transaction/verify/${tx_ref}`, {
        headers: {
          Authorization: `Bearer ${chapaSecret}`,
        },
      });
      return response.data;
    } catch (error) {
      this.logger.error('Chapa Verification Error', error.response?.data || error.message);
      throw new BadRequestException('Failed to verify local payment');
    }
  }
}
