import { Controller, Post, Body, Headers, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { ResponseMessage } from '../../common/decorators/response-message.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { PaymentMethod } from './entities/payment-history.entity';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @ApiBearerAuth('access-token')
  @Post('stripe/create-session')
  @ResponseMessage('Stripe session created')
  @ApiOperation({ summary: 'Create Stripe checkout session' })
  async createStripeSession(@Body() dto: { planId: string; organizationId: string; successUrl: string; cancelUrl: string }) {
    return this.paymentsService.createStripeSession(dto.planId, dto.organizationId, dto.successUrl, dto.cancelUrl);
  }

  @ApiBearerAuth('access-token')
  @ApiBearerAuth('access-token')
  @Post('chapa/initialize')
  @ResponseMessage('Chapa payment initialized')
  @ApiOperation({ summary: 'Initialize local payment via Chapa' })
  async initializeChapa(@Body() dto: { planId: string; organizationId: string; callbackUrl: string }) {
    return this.paymentsService.initializeChapaPayment(dto.planId, dto.organizationId, dto.callbackUrl);
  }

  @ApiBearerAuth('access-token')
  @Get('history/:organizationId')
  @ResponseMessage('Payment history fetched')
  @ApiOperation({ summary: 'Get payment history for an organization with pagination and search' })
  async getHistory(
    @Param('organizationId', ParseUUIDPipe) organizationId: string,
    @Query() query: PaginationQueryDto,
  ) {
    return this.paymentsService.findHistory(organizationId, query);
  }

  // ─── Webhooks / Callbacks ───────────────────────────────────────────────────

  @Public()
  @Post('stripe/webhook')
  @ApiOperation({ summary: 'Stripe webhook handler' })
  async handleStripeWebhook(@Body() body: any, @Headers('stripe-signature') signature: string) {
    // In production, verify the signature here
    if (body.type === 'checkout.session.completed') {
      const session = body.data.object;
      const { planId, organizationId } = session.metadata;

      await this.paymentsService.handleSuccessfulPayment(
        planId,
        organizationId,
        session.amount_total / 100,
        session.currency,
        PaymentMethod.STRIPE,
        session.id,
        { stripeSession: session.id },
      );
    }
    return { received: true };
  }

  @Public()
  @Get('chapa/callback/:planId/:organizationId')
  @ApiOperation({ summary: 'Chapa payment callback handler' })
  async handleChapaCallback(
    @Param('planId') planId: string,
    @Param('organizationId') organizationId: string,
    @Query('trx_ref') trx_ref: string,
  ) {
    const verification = await this.paymentsService.verifyChapaPayment(trx_ref);
    if (verification.status === 'success') {
      const data = verification.data;
      await this.paymentsService.handleSuccessfulPayment(
        planId,
        organizationId,
        data.amount,
        data.currency,
        PaymentMethod.CHAPA,
        trx_ref,
        { chapaData: data },
      );
    }
    return { status: verification.status };
  }
}
