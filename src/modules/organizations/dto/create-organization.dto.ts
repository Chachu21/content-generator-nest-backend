import { IsString, IsNotEmpty, IsOptional, IsUrl, IsEmail } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateOrganizationDto {
  @ApiProperty({ example: 'Ethio Coffee Co.' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'ethio-coffee' })
  @IsString()
  @IsOptional()
  slug?: string;

  @ApiPropertyOptional({ example: 'Premium Ethiopian coffee exporter' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 'https://logo.com/logo.png' })
  @IsUrl()
  @IsOptional()
  logoUrl?: string;

  @ApiPropertyOptional({ example: 'https://ethiocoffee.com' })
  @IsUrl()
  @IsOptional()
  website?: string;

  @ApiPropertyOptional({ example: '+251911223344' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ example: 'Addis Ababa, Ethiopia' })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({ example: 'Agriculture/Export' })
  @IsString()
  @IsOptional()
  industry?: string;
}
