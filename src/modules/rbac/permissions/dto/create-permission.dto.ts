import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class CreatePermissionDto {
  @IsString()
  @IsNotEmpty()
  key: string;

  @IsString()
  @IsNotEmpty()
  module: string;

  @IsString()
  @IsNotEmpty()
  action: string;

  @IsBoolean()
  @IsOptional()
  isWildcard?: boolean;

  @IsString()
  @IsOptional()
  description?: string;
}
