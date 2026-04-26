import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { SubscriptionsService } from './subscriptions.service';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { ResponseMessage } from '../../common/decorators/response-message.decorator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

@ApiTags('subscriptions')
@ApiBearerAuth('access-token')
@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get()
  @RequirePermissions('sub:read')
  @ResponseMessage('Subscriptions fetched successfully')
  @ApiOperation({ summary: 'Get all subscriptions with pagination and search' })
  findAll(@Query() query: PaginationQueryDto) {
    return this.subscriptionsService.findAll(query);
  }

  @Get(':id')
  @RequirePermissions('sub:read')
  @ResponseMessage('Subscription fetched successfully')
  @ApiOperation({ summary: 'Get subscription by ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.subscriptionsService.findOne(id);
  }
}
