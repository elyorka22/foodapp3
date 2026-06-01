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

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  productCategoryId?: string;

  @ApiPropertyOptional({ deprecated: true })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  slug: string;

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
