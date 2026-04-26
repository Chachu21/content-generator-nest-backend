import { IsString, IsNotEmpty, IsEnum, IsOptional, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum ContentType {
  BLOG = 'BLOG',
  SOCIAL_MEDIA = 'SOCIAL_MEDIA',
  PRODUCT_DESCRIPTION = 'PRODUCT_DESCRIPTION',
}

export enum TargetIndustry {
  COFFEE = 'COFFEE',
  TOURISM = 'TOURISM',
  RETAIL = 'RETAIL',
  GENERAL = 'GENERAL',
}

export class GenerateContentDto {
  @ApiProperty({ enum: ContentType, example: ContentType.SOCIAL_MEDIA })
  @IsEnum(ContentType)
  type: ContentType;

  @ApiProperty({ enum: TargetIndustry, example: TargetIndustry.COFFEE })
  @IsEnum(TargetIndustry)
  industry: TargetIndustry;

  @ApiProperty({ example: 'am', description: "Language code: 'am' for Amharic, 'en' for English" })
  @IsString()
  @IsNotEmpty()
  language: string;

  @ApiProperty({ example: 'New organic Yirgacheffe coffee beans launch' })
  @IsString()
  @IsNotEmpty()
  topic: string;

  @ApiPropertyOptional({ example: ['coffee', 'ethiopia', 'organic'], isArray: true })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  keywords?: string[];

  @ApiPropertyOptional({ example: 'Exciting and professional' })
  @IsString()
  @IsOptional()
  tone?: string;
}
