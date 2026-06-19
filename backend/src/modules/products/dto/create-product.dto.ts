import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreateProductDto {
  @ApiPropertyOptional({ description: 'Preferred merchant UUID' })
  @IsOptional()
  @IsUUID()
  businessId?: string;

  @ApiPropertyOptional({ deprecated: true, description: 'Legacy alias for businessId' })
  @IsOptional()
  @IsUUID()
  restaurantId?: string;

  @ApiPropertyOptional({ description: 'Global dish category UUID' })
  @IsOptional()
  @IsUUID()
  dishCategoryId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  productCategoryId?: string;

  @ApiPropertyOptional({ deprecated: true, description: 'Alias for dishCategoryId' })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiPropertyOptional({
    description:
      'Optional URL slug. Omit or match auto slug from name for unique auto-generation (palov-2, …).',
  })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  price: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  comparePrice?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}
