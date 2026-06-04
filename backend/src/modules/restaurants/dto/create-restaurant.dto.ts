import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsNumber, IsOptional, IsString, IsUUID, Max, Min, MinLength } from 'class-validator';

export class CreateRestaurantDto {
  @ApiProperty()
  @IsString()
  @MinLength(2)
  name: string;

  @ApiPropertyOptional({
    description:
      'Optional URL slug. Omit or match auto slug from name for unique auto-generation (pizza-house-2, …). Custom slug must be unique.',
  })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiPropertyOptional({ description: 'Marketplace category (business type) UUID' })
  @IsOptional()
  @IsUUID()
  businessTypeId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  logoUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  coverUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  commissionRate?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Cover focal point X (0=left, 100=right)', default: 50 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  coverPositionX?: number;

  @ApiPropertyOptional({ description: 'Cover focal point Y (0=top, 100=bottom)', default: 50 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  coverPositionY?: number;

  @ApiPropertyOptional({ description: 'Cover zoom 50–200 for homepage card' })
  @IsOptional()
  @IsInt()
  @Min(50)
  @Max(200)
  coverScale?: number;
}
