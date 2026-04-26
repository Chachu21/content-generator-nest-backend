import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { MembershipsService } from './memberships.service';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { ResponseMessage } from '../../common/decorators/response-message.decorator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

@ApiTags('memberships')
@ApiBearerAuth('access-token')
@Controller('memberships')
export class MembershipsController {
  constructor(private readonly membershipsService: MembershipsService) {}

  @Get()
  @RequirePermissions('membership:read')
  @ResponseMessage('Memberships fetched successfully')
  @ApiOperation({ summary: 'Get all memberships with pagination and search' })
  findAll(@Query() query: PaginationQueryDto) {
    return this.membershipsService.findAll(query);
  }

  @Get(':id')
  @RequirePermissions('membership:read')
  @ResponseMessage('Membership fetched successfully')
  @ApiOperation({ summary: 'Get membership by ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.membershipsService.findOne(id);
  }
}
