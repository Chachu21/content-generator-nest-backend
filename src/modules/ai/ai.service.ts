import {
  Injectable,
  Logger,
  InternalServerErrorException,
  ForbiddenException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import {
  GenerateContentDto,
  ContentType,
  TargetIndustry,
} from './dto/generate-content.dto';
import { Content } from '../contents/entities/content.entity';
import {
  Subscription,
  SubscriptionStatus,
} from '../subscriptions/entities/subscription.entity';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    @InjectRepository(Content)
    private readonly contentRepository: Repository<Content>,
    @InjectRepository(Subscription)
    private readonly subscriptionRepository: Repository<Subscription>,
  ) {}

  async generateContent(dto: GenerateContentDto, organizationId?: string): Promise<string> {
    if (organizationId) {
      await this.checkDailyLimit(organizationId);
    }

    const { type, industry, language, topic, keywords, tone } = dto;
    const apiKey = this.configService.get<string>('ai.grok.apiKey') || '';
    const apiUrl = this.configService.get<string>('ai.grok.apiUrl') || 'https://api.x.ai/v1/chat/completions';
    const model = this.configService.get<string>('ai.grok.model') || 'grok-beta';

    const systemPrompt = this.getSystemPrompt(industry, language);
    const userPrompt = this.getUserPrompt(type, topic, keywords || [], tone || '', language);

    try {
      const response = await firstValueFrom(
        this.httpService.post(
          apiUrl,
          {
            model: model,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt },
            ],
            temperature: 0.7,
          },
          {
            headers: {
              Authorization: `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
            },
          },
        ),
      );

      return response.data.choices[0].message.content;
    } catch (error) {
      this.logger.error('Error calling Grok API', error.response?.data || error.message);
      throw new InternalServerErrorException('Failed to generate content from AI');
    }
  }

  private getSystemPrompt(industry: TargetIndustry, language: string): string {
    const langName = language === 'am' ? 'Amharic' : 'English';
    let industryContext = '';

    switch (industry) {
      case TargetIndustry.COFFEE:
        industryContext = 'You are an expert in the Ethiopian coffee industry, knowledgeable about Yirgacheffe, Sidamo, and Harrar varieties, export quality, and traditional ceremonies.';
        break;
      case TargetIndustry.TOURISM:
        industryContext = 'You are an expert Ethiopian travel guide, knowledgeable about Simien Mountains, Lalibela, Axum, and the cultural heritage of Ethiopia.';
        break;
      case TargetIndustry.RETAIL:
        industryContext = 'You are a professional retail marketing expert focused on the Ethiopian local market (Addis Ababa and other regions), understanding local consumer behavior and Telebirr/Chapa payment trends.';
        break;
      default:
        industryContext = 'You are a professional content creator focused on the Ethiopian market.';
    }

    return `${industryContext} Write all content in ${langName}. If Amharic is requested, use proper Fidel characters and local idioms that sound natural to Ethiopians.`;
  }

  private getUserPrompt(
    type: ContentType,
    topic: string,
    keywords: string[],
    tone: string,
    language: string,
  ): string {
    const keywordText = keywords && keywords.length > 0 ? `Include these keywords: ${keywords.join(', ')}.` : '';
    const toneText = tone ? `Use a ${tone} tone.` : 'Use a professional and engaging tone.';
    
    let instructions = '';
    switch (type) {
      case ContentType.BLOG:
        instructions = 'Write a detailed blog post (around 500-800 words) with a catchy title, introduction, subheadings, and a conclusion.';
        break;
      case ContentType.SOCIAL_MEDIA:
        instructions = 'Write 3 short and engaging social media captions (Facebook/TikTok style) with relevant emojis and hashtags popular in Ethiopia.';
        break;
      case ContentType.PRODUCT_DESCRIPTION:
        instructions = 'Write a compelling product description focusing on features, benefits, and a clear call to action.';
        break;
    }

    return `${instructions} Topic: ${topic}. ${keywordText} ${toneText} Output only the ${language === 'am' ? 'Amharic' : 'English'} text.`;
  }

  private async checkDailyLimit(organizationId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    // Get current active subscription
    const subscription = await this.subscriptionRepository.findOne({
      where: {
        organization: { id: organizationId },
        status: SubscriptionStatus.ACTIVE,
      },
      relations: ['plan'],
    });

    if (!subscription) {
      throw new ForbiddenException('No active subscription found for this organization');
    }

    // Check if subscription has expired
    if (new Date() > subscription.endDate) {
      throw new ForbiddenException('Your subscription has expired');
    }

    const limit = subscription.plan.features?.posts_per_day || 0;
    if (limit === -1) return; // Unlimited

    const usageCount = await this.contentRepository.count({
      where: {
        organization: { id: organizationId },
        createdAt: Between(today, tomorrow),
      },
    });

    if (usageCount >= limit) {
      throw new ForbiddenException(`Daily limit reached (${limit} requests/day). Please upgrade your plan.`);
    }
  }
}
