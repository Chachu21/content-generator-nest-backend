import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AiService } from './ai.service';
import { GenerateContentDto } from './dto/generate-content.dto';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { ResponseMessage } from '../../common/decorators/response-message.decorator';

@ApiTags('ai')
@ApiBearerAuth('access-token')
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('generate')
  @RequirePermissions('content:create')
  @ResponseMessage('Content generated successfully')
  @ApiOperation({ summary: 'Generate AI content (Amharic/English)' })
  async generate(@Body() dto: GenerateContentDto) {
    // Note: In a production app, we would verify that the user belongs to dto.organizationId here
    const content = await this.aiService.generateContent(dto, dto.organizationId);
    return { content };
  }
}
