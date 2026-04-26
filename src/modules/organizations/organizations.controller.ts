import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { ResponseMessage } from '../../common/decorators/response-message.decorator';

@ApiTags('organizations')
@ApiBearerAuth('access-token')
@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Post()
  @RequirePermissions('org:create')
  @ResponseMessage('Organization created successfully')
  @ApiOperation({ summary: 'Create a new organization' })
  create(@Body() createOrganizationDto: CreateOrganizationDto) {
    return this.organizationsService.create(createOrganizationDto);
  }

  @Get()
  @RequirePermissions('org:read')
  @ResponseMessage('Organizations fetched successfully')
  @ApiOperation({ summary: 'Get all organizations' })
  findAll() {
    return this.organizationsService.findAll();
  }

  @Get(':id')
  @RequirePermissions('org:read')
  @ResponseMessage('Organization fetched successfully')
  @ApiOperation({ summary: 'Get organization by ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.organizationsService.findOne(id);
  }

  @Patch(':id')
  @RequirePermissions('org:update')
  @ResponseMessage('Organization updated successfully')
  @ApiOperation({ summary: 'Update organization' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateOrganizationDto: UpdateOrganizationDto,
  ) {
    return this.organizationsService.update(id, updateOrganizationDto);
  }

  @Delete(':id')
  @RequirePermissions('org:delete')
  @ResponseMessage('Organization deleted successfully')
  @ApiOperation({ summary: 'Delete organization' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.organizationsService.remove(id);
  }
}
