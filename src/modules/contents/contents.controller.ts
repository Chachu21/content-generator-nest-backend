import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ContentsService } from './contents.service';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { ResponseMessage } from '../../common/decorators/response-message.decorator';

@ApiTags('contents')
@ApiBearerAuth('access-token')
@Controller('contents')
export class ContentsController {
  constructor(private readonly contentsService: ContentsService) {}

  @Post()
  @RequirePermissions('content:create')
  @ResponseMessage('Content created successfully')
  @ApiOperation({ summary: 'Create new content' })
  create(@Body() createContentDto: any) {
    return this.contentsService.create(createContentDto);
  }

  @Get()
  @RequirePermissions('content:read')
  @ResponseMessage('Contents fetched successfully')
  @ApiOperation({ summary: 'Get all contents' })
  findAll() {
    return this.contentsService.findAll();
  }

  @Get(':id')
  @RequirePermissions('content:read')
  @ResponseMessage('Content fetched successfully')
  @ApiOperation({ summary: 'Get content by ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.contentsService.findOne(id);
  }
}
