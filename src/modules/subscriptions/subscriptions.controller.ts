import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { SubscriptionsService } from './subscriptions.service';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { ResponseMessage } from '../../common/decorators/response-message.decorator';

@ApiTags('subscriptions')
@ApiBearerAuth('access-token')
@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get()
  @RequirePermissions('sub:read')
  @ResponseMessage('Subscriptions fetched successfully')
  @ApiOperation({ summary: 'Get all subscriptions' })
  findAll() {
    return this.subscriptionsService.findAll();
  }

  @Get(':id')
  @RequirePermissions('sub:read')
  @ResponseMessage('Subscription fetched successfully')
  @ApiOperation({ summary: 'Get subscription by ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.subscriptionsService.findOne(id);
  }
}
