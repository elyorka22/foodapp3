import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export const PRODUCT_SALE_UNITS = ['dona', 'gr', 'kg', 'karobka'] as const;
export type ProductSaleUnitValue = (typeof PRODUCT_SALE_UNITS)[number];

export class CreateProductDto {
  @ApiPropertyOptional({ description: 'Preferred merchant UUID' })
  @IsOptional()
  @IsUUID()
  businessId?: string;

  @ApiPropertyOptional({ deprecated: true, description: 'Legacy alias for businessId' })
  @IsOptional()
  @IsUUID()
  restaurantId?: string;

  @ApiPropertyOptional({
    description: 'Branch UUID — omit for shared menu; set for branch-only item',
  })
  @IsOptional()
  @IsUUID()
  branchId?: string;

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

  @ApiPropertyOptional({
    enum: PRODUCT_SALE_UNITS,
    description: 'Sale unit: dona / gr / kg / karobka',
    default: 'dona',
  })
  @IsOptional()
  @IsIn(PRODUCT_SALE_UNITS)
  saleUnit?: ProductSaleUnitValue;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}
