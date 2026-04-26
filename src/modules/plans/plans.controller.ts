import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PlansService } from './plans.service';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { ResponseMessage } from '../../common/decorators/response-message.decorator';

@ApiTags('plans')
@ApiBearerAuth('access-token')
@Controller('plans')
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

  @Get()
  @RequirePermissions('plan:read')
  @ResponseMessage('Plans fetched successfully')
  @ApiOperation({ summary: 'Get all available pricing plans' })
  findAll() {
    return this.plansService.findAll();
  }

  @Get(':id')
  @RequirePermissions('plan:read')
  @ResponseMessage('Plan fetched successfully')
  @ApiOperation({ summary: 'Get plan by ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.plansService.findOne(id);
  }
}
